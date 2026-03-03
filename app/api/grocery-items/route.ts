import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { CreateGroceryItemInput } from '@/types/grocery';

// GET /api/grocery-items - List all grocery items
export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM grocery_items ORDER BY created_at DESC'
    );

    return NextResponse.json({ items: result.rows });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/grocery-items - Create a new grocery item
export async function POST(request: NextRequest) {
  try {
    const input: CreateGroceryItemInput = await request.json();
    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO grocery_items (name, quantity, unit, status, type, stores, aisle, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.name,
        input.quantity,
        input.unit,
        input.status ?? null,
        input.type,
        input.stores || [],
        input.aisle || null,
        input.tags || [],
      ]
    );

    return NextResponse.json({ item: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
