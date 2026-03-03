import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { UpdateGroceryItemInput } from '@/types/grocery';

// PATCH /api/grocery-items/[id] - Update a grocery item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: UpdateGroceryItemInput = await request.json();

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) { fields.push(`name = $${paramCount++}`); values.push(updates.name); }
    if (updates.quantity !== undefined) { fields.push(`quantity = $${paramCount++}`); values.push(updates.quantity); }
    if (updates.unit !== undefined) { fields.push(`unit = $${paramCount++}`); values.push(updates.unit); }
    if (updates.status !== undefined) { fields.push(`status = $${paramCount++}`); values.push(updates.status); }
    if (updates.type !== undefined) { fields.push(`type = $${paramCount++}`); values.push(updates.type); }
    if (updates.stores !== undefined) { fields.push(`stores = $${paramCount++}`); values.push(updates.stores); }
    if (updates.aisle !== undefined) { fields.push(`aisle = $${paramCount++}`); values.push(updates.aisle || null); }
    if (updates.tags !== undefined) { fields.push(`tags = $${paramCount++}`); values.push(updates.tags); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const pool = getPool();
    const result = await pool.query(
      `UPDATE grocery_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery-items/[id] - Delete a grocery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getPool();

    await pool.query('DELETE FROM grocery_items WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
