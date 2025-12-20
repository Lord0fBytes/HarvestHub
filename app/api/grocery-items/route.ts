import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { CreateGroceryItemInput } from '@/types/grocery';

// GET /api/grocery-items - List all grocery items
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('grocery_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data || [] });
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

    const { data, error } = await supabaseServer
      .from('grocery_items')
      .insert([{
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        status: input.status,
        type: input.type,
        stores: input.stores || [],
        aisle: input.aisle || null,
        tags: input.tags || [],
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
