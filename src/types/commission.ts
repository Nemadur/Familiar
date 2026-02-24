export interface Review {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string | Date;
  itemName?: string;
}

export interface LicenseOption {
  id: string;
  label: string;
  price?: number;
  pricePercentage?: number;
  included?: boolean;
  description?: string;
}

export interface CommissionItem {
  id: string;
  title: string;
  description?: string; // Markdown supported
  price: number;
  discountRate?: number; // 0.0 to 1.0
  imageUrls?: string[];
  status?: "open" | "closed" | "waitlist";
  artistNote?: string;
  reviews?: Review[];
  licenseOptions?: LicenseOption[];
  tags?: string[];
  contentWarnings?: string[];
}

export interface CommissionCategory {
  id: string;
  title: string;
  description?: string;
  status: "open" | "closed" | "waitlist";
  items: CommissionItem[];
}
