export interface CommissionCategory {
  id: string;
  title: string;
  description?: string;
  status: "open" | "closed" | "waitlist";
  items: CommissionItem[];
}

export interface CommissionItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  discountRate?: number;
  imageUrls?: string[];
  status?: "open" | "closed" | "waitlist";
}
