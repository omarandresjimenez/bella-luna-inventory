import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryProvider } from './providers/QueryProvider';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme';

// Store Pages
import StoreLayout from './components/store/StoreLayout';
import HomePage from './pages/store/HomePage';
import ProductPage from './pages/store/ProductPage';
import CategoryPage from './pages/store/CategoryPage';
import CartPage from './pages/store/CartPage';
import CheckoutPage from './pages/store/CheckoutPage';
import OrdersPage from './pages/store/OrdersPage';
import LoginPage from './pages/store/LoginPage';
import RegisterPage from './pages/store/RegisterPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import AdminCategoriesPage from './pages/admin/CategoriesPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminLoginPage from './pages/admin/LoginPage';

// Protected Routes
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import CustomerProtectedRoute from './components/store/CustomerProtectedRoute';

function App() {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CustomerAuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Store Routes */}
                <Route path="/" element={<StoreLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="product/:slug" element={<ProductPage />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route element={<CustomerProtectedRoute />}>
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route element={<AdminProtectedRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="products/new" element={<ProductFormPage />} />
                    <Route path="products/:id/edit" element={<ProductFormPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </CustomerAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
