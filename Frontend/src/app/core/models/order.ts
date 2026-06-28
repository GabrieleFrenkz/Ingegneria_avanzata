import { Product } from './product';

export interface Customer {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}

export interface Address {
    street: string | null;
    city: string | null;
    zip: string | null;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: string;
    quantity: number;
    unitPrice: number;
    createdAt: string;
    updatedAt: string;
    product?: Product;
}

export interface Order {
    id?: number;
    customer: Customer;
    address: Address;
    items?: Product[];
    orderItems?: OrderItem[];
    total: number;
    userId?: number;
    createdAt: string;
    updatedAt?: string;
}