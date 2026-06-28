import { Routes } from '@angular/router';
import { CheckoutPage } from './features/checkout/checkout-page/checkout-page';
import { checkoutGuardGuard } from './core/guard/checkout-guard-guard';
import { ProductDetailPage } from './features/products/product-detail-page/product-detail-page';
import { LoginPage } from './features/auth/login-page/login-page';
import { RegisterPage } from './features/auth/register-page/register-page';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { adminGuard } from './core/guard/admin.guard';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    {
        path: 'products', loadComponent:
            () => import('./features/products/product-page/product-page').then(m => m.ProductPage)
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart-page/cart-page').then(m => m.CartPage),
        canActivate: [authGuard]
    },
    {
        path: 'wishlist',
        loadComponent: () => import('./features/wishlist/wishlist-page/wishlist-page').then(m => m.WishlistPage),
        canActivate: [authGuard]
    },
    { path: 'checkout', component: CheckoutPage, canActivate: [checkoutGuardGuard] },
    {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-history/order-history').then(m => m.OrderHistoryPage),
        canActivate: [authGuard]
    },
    { path: 'product/:id', component: ProductDetailPage },
    { path: 'login', component: LoginPage },
    { path: 'register', component: RegisterPage },
    { path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },
];
