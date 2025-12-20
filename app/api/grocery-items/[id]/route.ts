import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { UpdateGroceryItemInput } from '@/types/grocery';

// PATCH /api/grocery-items/[id] - Update a grocery item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: UpdateGroceryItemInput = await request.json();

    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.stores !== undefined) updateData.stores = updates.stores;
    if (updates.aisle !== undefined) updateData.aisle = updates.aisle || null;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    const { data, error } = await supabaseServer
      .from('grocery_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data });
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

    const { error } = await supabaseServer
      .from('grocery_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
