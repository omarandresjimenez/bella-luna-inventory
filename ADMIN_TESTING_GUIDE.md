# 🔐 Admin Section Testing Guide

## 📋 Overview
This guide provides comprehensive testing instructions for the Bella Luna Inventory admin section.

---

## 🚀 Getting Started

### Prerequisites
Both servers must be running:
- **Backend**: `npm run dev` (Port 3000)
- **Frontend**: `npm run dev` (Port 5173)

### Admin Credentials
```
Email: admin@bellaluna.com
Password: admin123
```

---

## 🧪 Test Scenarios

### 1. Authentication & Access Control

#### Test 1.1: Admin Login
**Steps:**
1. Navigate to `http://localhost:5173/admin`
2. You should be automatically redirected to `/admin/login`
3. Enter the admin credentials:
   - Email: `admin@bellaluna.com`
   - Password: `admin123`
4. Click "Iniciar Sesión"

**Expected Results:**
- ✅ Successful login redirects to `/admin` (Dashboard)
- ✅ Token is stored in localStorage
- ✅ User data is stored in localStorage

**Failure Cases to Test:**
- ❌ Invalid email format shows validation error
- ❌ Wrong password shows error message: "Error al iniciar sesión"
- ❌ Empty fields prevent form submission

#### Test 1.2: Protected Route Access
**Steps:**
1. Without logging in, try to access:
   - `http://localhost:5173/admin`
   - `http://localhost:5173/admin/products`
   - `http://localhost:5173/admin/categories`
   - `http://localhost:5173/admin/orders`

**Expected Results:**
- ✅ All routes redirect to `/admin/login`
- ✅ After login, user can access all admin routes

#### Test 1.3: Logout Functionality
**Steps:**
1. Log in to admin panel
2. Click logout button (in AdminLayout navigation)
3. Check localStorage

**Expected Results:**
- ✅ User is redirected to `/admin/login`
- ✅ Token is removed from localStorage
- ✅ User data is removed from localStorage
- ✅ Cannot access protected routes without re-login

---

### 2. Dashboard Page

#### Test 2.1: Dashboard Statistics
**Steps:**
1. Log in and navigate to `/admin`
2. Observe the dashboard cards

**Expected Results:**
- ✅ Shows "Total Productos" card with count
- ✅ Shows "Pedidos" card with count
- ✅ Shows "Categorías" card with count
- ✅ Each card displays an icon (Inventory, ShoppingCart, Category)
- ✅ Loading state shows CircularProgress while fetching data
- ✅ Data loads from API endpoints:
  - `/api/admin/products`
  - `/api/admin/orders`
  - `/api/admin/categories`

**Sample Expected Values (from seed data):**
- Total Productos: 3
- Pedidos: 0 (initially)
- Categorías: 6+ (including subcategories)

---

### 3. Products Page

#### Test 3.1: View Products List
**Steps:**
1. Navigate to `/admin/products`
2. Observe the products table

**Expected Results:**
- ✅ Table displays columns: SKU, Nombre, Marca, Precio, Estado, Acciones
- ✅ Shows all products from database
- ✅ Each product shows:
  - SKU (e.g., "LAB-MAT-001")
  - Name (e.g., "Labial Líquido Matte Longwear")
  - Brand (e.g., "Bella Luna Pro")
  - Price (e.g., "$35000")
  - Status chip (green "Activo" or gray "Inactivo")
- ✅ Action buttons visible: Image, Edit, Delete

#### Test 3.2: Search Products
**Steps:**
1. In the search field, type "labial"
2. Observe filtered results
3. Clear search and type a SKU like "LAB-MAT-001"

**Expected Results:**
- ✅ Table filters products by name (case-insensitive)
- ✅ Table filters products by SKU
- ✅ Empty search shows all products

#### Test 3.3: Image Management
**Steps:**
1. Click the Image icon (📷) for any product
2. Observe the Image Management Dialog

**Expected Results:**
- ✅ Dialog opens with title "Gestionar Imágenes - [Product Name]"
- ✅ Shows existing images section (if product has images)
- ✅ Each existing image shows:
  - Thumbnail preview
  - Star icon (filled if primary, outlined if not)
  - Delete button
- ✅ Shows "Subir nuevas imágenes" section with ImageUpload component

#### Test 3.4: Upload Product Images
**Steps:**
1. Open image dialog for a product
2. Click or drag-drop image files
3. Click "Subir X imagen(es)" button

**Expected Results:**
- ✅ Selected files appear in preview
- ✅ Can remove files before upload
- ✅ Upload button shows count of selected files
- ✅ Upload button disabled if no files selected
- ✅ Shows "Subiendo..." during upload
- ✅ Progress indicator appears
- ✅ Images appear in "existing images" after successful upload
- ✅ Selected files list clears after upload

#### Test 3.5: Set Primary Image
**Steps:**
1. Open image dialog for product with multiple images
2. Click star icon on a non-primary image

**Expected Results:**
- ✅ Star icon fills with color
- ✅ Previous primary image star becomes outlined
- ✅ API call to set primary image succeeds
- ✅ Product list updates to show new primary image

#### Test 3.6: Delete Product Image
**Steps:**
1. Open image dialog
2. Click delete button on an image
3. Confirm deletion

**Expected Results:**
- ✅ Image is removed from the list
- ✅ API call succeeds
- ✅ If deleted image was primary, another image becomes primary

#### Test 3.7: Delete Product
**Steps:**
1. Click delete icon (🗑️) for a product
2. Observe confirmation dialog
3. Click "Eliminar"

**Expected Results:**
- ✅ Confirmation dialog appears with product name
- ✅ Dialog shows "¿Estás seguro de que deseas eliminar el producto '[Name]'?"
- ✅ "Cancelar" button closes dialog without deleting
- ✅ "Eliminar" button deletes product
- ✅ Product disappears from table
- ✅ Dashboard count updates

#### Test 3.8: Create New Product (Button)
**Steps:**
1. Click "Nuevo Producto" button

**Expected Results:**
- ⚠️ Currently shows button but functionality may not be implemented
- 📝 Should open a form/dialog to create new product

---

### 4. Categories Page

#### Test 4.1: View Categories List
**Steps:**
1. Navigate to `/admin/categories`
2. Observe the categories table

**Expected Results:**
- ✅ Table displays all categories
- ✅ Shows category hierarchy (parent/child relationships)
- ✅ Displays category properties:
  - Name
  - Slug
  - Description
  - Featured status
  - Sort order
- ✅ Action buttons for edit/delete

#### Test 4.2: Category Management
**Steps:**
1. Test creating, editing, and deleting categories
2. Test parent-child relationships

**Expected Results:**
- ✅ Can create new categories
- ✅ Can assign parent categories
- ✅ Can mark categories as featured
- ✅ Can set sort order
- ✅ Changes reflect in storefront

---

### 5. Orders Page

#### Test 5.1: View Orders List
**Steps:**
1. Navigate to `/admin/orders`
2. Observe orders table

**Expected Results:**
- ✅ Shows all customer orders
- ✅ Displays order information:
  - Order number
  - Customer name
  - Date
  - Total amount
  - Status
- ✅ Can filter/search orders
- ✅ Can view order details

#### Test 5.2: Order Status Management
**Steps:**
1. Click on an order
2. Update order status

**Expected Results:**
- ✅ Can change order status (pending, processing, completed, cancelled)
- ✅ Status updates save to database
- ✅ Customer can see updated status

---

## 🔍 API Endpoints to Test

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/products/:id/images` - Upload images
- `DELETE /api/admin/products/:id/images/:imageId` - Delete image
- `PUT /api/admin/products/:id/images/:imageId/primary` - Set primary image

### Categories
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Orders
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id/status` - Update order status

---

## 🐛 Common Issues & Troubleshooting

### Issue: "Cannot access admin routes"
**Solution:** 
- Check if token exists in localStorage
- Verify token is valid (not expired)
- Check AuthContext is properly initialized

### Issue: "Products not loading"
**Solution:**
- Check backend server is running on port 3000
- Verify API endpoint `/api/admin/products` returns data
- Check browser console for CORS errors
- Verify authentication token is being sent in headers

### Issue: "Image upload fails"
**Solution:**
- Check file size limits
- Verify file type is allowed (jpg, png, webp)
- Check backend has write permissions
- Verify Supabase/storage configuration

### Issue: "Dashboard shows 0 for all stats"
**Solution:**
- Run database seed: `npm run db:seed`
- Check API endpoints are returning data
- Verify database connection

---

## ✅ Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected routes without auth
- [ ] Logout functionality
- [ ] Token persistence
- [ ] Auto-redirect after login

### Dashboard
- [ ] Statistics load correctly
- [ ] Loading states work
- [ ] Error states handled
- [ ] Navigation to other sections

### Products
- [ ] View products list
- [ ] Search/filter products
- [ ] Upload product images
- [ ] Set primary image
- [ ] Delete images
- [ ] Delete products
- [ ] View product details
- [ ] Edit products (if implemented)
- [ ] Create products (if implemented)

### Categories
- [ ] View categories
- [ ] Create category
- [ ] Edit category
- [ ] Delete category
- [ ] Manage hierarchy

### Orders
- [ ] View orders list
- [ ] View order details
- [ ] Update order status
- [ ] Filter/search orders

### UI/UX
- [ ] Responsive design works
- [ ] Loading indicators appear
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Dialogs open/close properly
- [ ] Forms validate input
- [ ] Buttons disabled during operations

---

## 📊 Test Data

### Seeded Products (from seed.ts)
1. **Labial Líquido Matte Longwear**
   - SKU: LAB-MAT-001
   - Price: $35,000
   - Brand: Bella Luna Pro
   - Category: Labios
   - Variants: 4 colors

2. **Base Líquida Cobertura Total**
   - SKU: BASE-LIQ-002
   - Price: $55,000 (10% discount)
   - Brand: Bella Luna Pro
   - Category: Rostro

3. **Sérum Hidratante Ácido Hialurónico**
   - SKU: SER-HID-003
   - Price: $75,000
   - Brand: Bella Luna Skin
   - Category: Hidratantes

### Seeded Categories
- Maquillaje (Labios, Rostro, Ojos)
- Skincare (Limpiadores, Hidratantes, Tratamientos)
- Cabello (Shampoo, Acondicionador, Tratamientos)
- Fragancias
- Uñas
- Accesorios

---

## 🎯 Next Steps

After testing, consider:
1. Implementing missing features (Create/Edit product forms)
2. Adding bulk operations
3. Implementing export functionality
4. Adding analytics/reports
5. Improving error handling
6. Adding user management
7. Implementing audit logs

---

## 📝 Notes

- All text in admin panel is in Spanish
- Currency format: Colombian Peso (COP)
- Date format: Local timezone
- Image storage: Supabase (check configuration)
- Authentication: JWT tokens in localStorage
