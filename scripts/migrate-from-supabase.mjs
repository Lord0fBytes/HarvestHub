import { Pool } from 'pg';

const sourceUrl = process.env.SUPABASE_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;
const apply = process.argv.includes('--apply');

if (!sourceUrl) {
  console.error('SUPABASE_DATABASE_URL is required.');
  process.exit(1);
}

if (!targetUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const source = new Pool({
  connectionString: sourceUrl,
  // Supabase requires TLS for external database connections.
  ssl: { rejectUnauthorized: false },
});
const target = new Pool({ connectionString: targetUrl });

async function main() {
  try {
    const targetTable = await target.query("SELECT to_regclass('public.grocery_items') AS table_name");
    if (!targetTable.rows[0].table_name) {
      throw new Error('Target database is missing grocery_items. Start the PostgreSQL stack first.');
    }

    const sourceColumns = await source.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'grocery_items'`
    );
    const columnNames = new Set(sourceColumns.rows.map((row) => row.column_name));
    const requiredColumns = ['id', 'name', 'quantity', 'unit', 'status', 'aisle', 'tags', 'created_at', 'updated_at'];
    const missingColumns = requiredColumns.filter((column) => !columnNames.has(column));

    if (missingColumns.length > 0) {
      throw new Error(`Source grocery_items is missing: ${missingColumns.join(', ')}`);
    }

    const typeSelect = columnNames.has('type') ? 'type' : "'grocery'::text AS type";
    const storesSelect = columnNames.has('stores')
      ? "COALESCE(stores, ARRAY[]::text[]) AS stores"
      : columnNames.has('store')
        ? "CASE WHEN store IS NULL OR store = '' THEN ARRAY[]::text[] ELSE ARRAY[store] END AS stores"
        : "ARRAY[]::text[] AS stores";

    const { rows: items } = await source.query(
      `SELECT id, name, quantity, unit, status, ${typeSelect}, ${storesSelect}, aisle,
              COALESCE(tags, ARRAY[]::text[]) AS tags, created_at, updated_at
       FROM public.grocery_items
       ORDER BY created_at ASC`
    );

    if (!apply) {
      console.log(`Dry run: found ${items.length} item(s) in Supabase.`);
      console.log('No data was written. Re-run with --apply to copy only IDs not already in PostgreSQL.');
      return;
    }

    await target.query('BEGIN');
    let inserted = 0;
    let skipped = 0;

    for (const item of items) {
      const result = await target.query(
        `INSERT INTO grocery_items
          (id, name, quantity, unit, status, type, stores, aisle, tags, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          item.id,
          item.name,
          item.quantity,
          item.unit,
          item.status,
          item.type ?? 'grocery',
          item.stores ?? [],
          item.aisle,
          item.tags ?? [],
          item.created_at,
          item.updated_at,
        ]
      );

      if (result.rowCount === 1) inserted += 1;
      else skipped += 1;
    }

    await target.query('COMMIT');
    console.log(`Migration complete: ${inserted} inserted, ${skipped} already present.`);
  } catch (error) {
    await target.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await Promise.all([source.end(), target.end()]);
  }
}

main();
