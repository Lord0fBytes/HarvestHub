export type ItemStatus = 'pending' | 'purchased' | 'skipped';
export type ItemType = 'grocery' | 'supply' | 'clothing' | 'other';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: ItemStatus | null;
  type: ItemType;
  stores: string[];
  aisle?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateGroceryItemInput = Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateGroceryItemInput = Partial<Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>>;
