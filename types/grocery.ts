export type ItemStatus = 'pending' | 'purchased' | 'skipped';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: ItemStatus | null;
  store?: string;
  aisle?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateGroceryItemInput = Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateGroceryItemInput = Partial<Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>>;
