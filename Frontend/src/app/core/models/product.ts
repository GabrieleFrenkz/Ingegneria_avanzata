export interface Product {
discountPercentage: any;
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    sale: boolean;
    thumbnail?: string;
    tags?: string[];
    quantity?: number;
    inStock?: boolean;
    createdAt: string;
}