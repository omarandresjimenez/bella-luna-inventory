# 🧪 Bella Luna Inventory - Complete Testing Checklist

**Last Updated:** 2026-02-10 10:39:21  
**Status:** Ready for Testing  
**Servers:** ✅ Running

---

## 🚀 Server Status

- **Backend API:** http://localhost:3000 ✅ Running
- **Frontend App:** http://localhost:5173 ✅ Running
- **Health Check:** http://localhost:3000/api/health ✅ Responding

---

## 📝 Recent Changes Applied

### Code Quality Improvements
1. ✅ **Dependency Injection** - AdminProductController now uses constructor injection
2. ✅ **Standardized API Responses** - Using `sendSuccess` and `sendError` utilities
3. ✅ **Better Error Handling** - Proper error type checking with `instanceof Error`
4. ✅ **Type Safety** - Replaced `any` with `Record<string, unknown>`
5. ✅ **Route Cleanup** - Removed legacy routes, added address routes

### Route Changes
- ✅ Added `/api/addresses` route
- ✅ Removed legacy `/api/products`, `/api/categories`, `/api/suppliers` routes
- ✅ All routes now use public routes or admin routes

---

## 🏪 STOREFRONT TESTING

### 1. Homepage Test
**URL:** http://localhost:5173

**Test Steps:**
1. Open http://localhost:5173 in your browser
2. Verify page loads without errors
3. Check for:
   - [ ] Hero section displays
   - [ ] Featured products are visible
   - [ ] Category navigation works
   - [ ] Images load properly
   - [ ] No console errors

**Expected Result:**
- Clean, professional storefront
- Products displayed with images
- Navigation menu with categories
- Responsive design

---

### 2. Product Browsing
**URL:** http://localhost:5173

**Test Steps:**
1. Click on a category from the navigation
2. Verify products in that category display
3. Click on a product to view details
4. Check product page shows:
   - [ ] Product images (with gallery if multiple)
   - [ ] Product name and description
   - [ ] Price
   - [ ] Add to cart button
   - [ ] Variant selection (if applicable)

**Expected Result:**
- Category pages show filtered products
- Product detail pages show complete information
- Images are clear and properly sized

---

### 3. Shopping Cart
**URL:** http://localhost:5173/cart

**Test Steps:**
1. Add a product to cart from product page
2. Navigate to cart page
3. Verify:
   - [ ] Product appears in cart
   - [ ] Quantity can be adjusted
   - [ ] Subtotal calculates correctly
   - [ ] Remove item works
   - [ ] Proceed to checkout button visible

**Expected Result:**
- Cart updates in real-time
- Calculations are accurate
- UI is responsive

---

### 4. Customer Authentication
**URLs:** 
- Login: http://localhost:5173/login
- Register: http://localhost:5173/register

**Test Steps:**
1. Click "Register" or navigate to register page
2. Create a new customer account
3. Verify email validation
4. Complete registration
5. Test login with new credentials
6. Verify:
   - [ ] Registration form validates input
   - [ ] Login redirects to appropriate page
   - [ ] User session persists
   - [ ] Logout works

**Expected Result:**
- Smooth registration flow
- Secure authentication
- Proper session management

---

### 5. Checkout Process
**URL:** http://localhost:5173/checkout

**Test Steps:**
1. Add items to cart
2. Proceed to checkout
3. Fill in shipping information
4. Select delivery method
5. Complete order
6. Verify:
   - [ ] Form validation works
   - [ ] Address can be saved
   - [ ] Order summary is accurate
   - [ ] Order confirmation appears

**Expected Result:**
- Intuitive checkout flow
- All information captured correctly
- Order created successfully

---

### 6. Order History
**URL:** http://localhost:5173/orders

**Test Steps:**
1. Login as customer
2. Navigate to orders page
3. Verify:
   - [ ] Past orders are listed
   - [ ] Order details can be viewed
   - [ ] Order status is displayed
   - [ ] Order items are shown

**Expected Result:**
- Complete order history
- Clear order status
- Detailed order information

---

## 🔐 ADMIN SECTION TESTING

### 1. Admin Login
**URL:** http://localhost:5173/admin

**Credentials:**
- Email: `admin@bellaluna.com`
- Password: `admin123`

**Test Steps:**
1. Navigate to http://localhost:5173/admin
2. Should redirect to /admin/login
3. Enter credentials
4. Click "Iniciar Sesión"
5. Verify:
   - [ ] Login succeeds
   - [ ] Redirects to admin dashboard
   - [ ] Token stored in localStorage
   - [ ] Invalid credentials show error

**Expected Result:**
- Successful authentication
- Redirect to dashboard
- Error handling for wrong credentials

---

### 2. Admin Dashboard
**URL:** http://localhost:5173/admin

**Test Steps:**
1. After login, observe dashboard
2. Verify statistics cards show:
   - [ ] Total Products count
   - [ ] Orders count
   - [ ] Categories count
3. Check:
   - [ ] Numbers are accurate
   - [ ] Loading states appear briefly
   - [ ] No errors in console

**Expected Result:**
- Dashboard displays current statistics
- Clean, professional layout
- Fast loading

---

### 3. Products Management
**URL:** http://localhost:5173/admin/products

**Test Steps:**

#### 3.1 View Products List
1. Navigate to Products page
2. Verify:
   - [ ] All products listed in table
   - [ ] Columns: SKU, Nombre, Marca, Precio, Estado, Acciones
   - [ ] Product images display (if available)
   - [ ] Status chips show correctly (Activo/Inactivo)

#### 3.2 Search Products
1. Use search field
2. Type product name or SKU
3. Verify:
   - [ ] Results filter in real-time
   - [ ] Search is case-insensitive
   - [ ] Clear search shows all products

#### 3.3 Upload Product Images
1. Click image icon (📷) for a product
2. Image dialog opens
3. Select or drag-drop image files
4. Click "Subir X imagen(es)"
5. Verify:
   - [ ] Files preview before upload
   - [ ] Upload progress shows
   - [ ] Images appear after upload
   - [ ] Can upload multiple images

#### 3.4 Set Primary Image
1. Open image dialog for product with multiple images
2. Click star icon on non-primary image
3. Verify:
   - [ ] Star fills with color
   - [ ] Previous primary star becomes outlined
   - [ ] Product list updates with new primary image

#### 3.5 Delete Product Image
1. Open image dialog
2. Click delete button on an image
3. Verify:
   - [ ] Image is removed
   - [ ] Remaining images still display
   - [ ] If primary deleted, another becomes primary

#### 3.6 Delete Product
1. Click delete icon (🗑️) for a product
2. Confirmation dialog appears
3. Click "Eliminar"
4. Verify:
   - [ ] Confirmation dialog shows product name
   - [ ] Cancel button works
   - [ ] Product disappears from list
   - [ ] Dashboard count updates

**Expected Result:**
- Full CRUD functionality works
- Image management is smooth
- UI is responsive and intuitive

---

### 4. Categories Management
**URL:** http://localhost:5173/admin/categories

**Test Steps:**

#### 4.1 View Categories
1. Navigate to Categories page
2. Verify:
   - [ ] All categories listed
   - [ ] Parent-child relationships visible
   - [ ] Category images display
   - [ ] Featured status shown

#### 4.2 Create Category
1. Click "Nueva Categoría" or equivalent button
2. Fill in category details:
   - Name
   - Slug
   - Description
   - Parent category (optional)
   - Featured status
3. Save category
4. Verify:
   - [ ] Category appears in list
   - [ ] Can upload category image
   - [ ] Hierarchy is correct

#### 4.3 Edit Category
1. Click edit icon for a category
2. Modify details
3. Save changes
4. Verify:
   - [ ] Changes persist
   - [ ] Storefront reflects changes

#### 4.4 Delete Category
1. Click delete icon
2. Confirm deletion
3. Verify:
   - [ ] Category removed
   - [ ] Products in category handled correctly

**Expected Result:**
- Category hierarchy works
- Images upload successfully
- Changes reflect on storefront

---

### 5. Orders Management
**URL:** http://localhost:5173/admin/orders

**Test Steps:**

#### 5.1 View Orders List
1. Navigate to Orders page
2. Verify:
   - [ ] All orders listed
   - [ ] Order details visible (number, customer, date, total, status)
   - [ ] Can sort/filter orders
   - [ ] Pagination works (if many orders)

#### 5.2 View Order Details
1. Click on an order
2. Verify:
   - [ ] Customer information shown
   - [ ] Order items listed
   - [ ] Shipping address displayed
   - [ ] Order total calculated correctly
   - [ ] Current status visible

#### 5.3 Update Order Status
1. Select an order
2. Change status (e.g., Pending → Processing → Completed)
3. Add admin notes (optional)
4. Save changes
5. Verify:
   - [ ] Status updates
   - [ ] Customer can see updated status
   - [ ] Admin notes saved

#### 5.4 Cancel Order
1. Select an order
2. Click cancel order
3. Confirm cancellation
4. Verify:
   - [ ] Order status changes to Cancelled
   - [ ] Customer notified (if email configured)

**Expected Result:**
- Complete order management
- Status workflow is clear
- Customer communication works

---

## 🔍 API ENDPOINT TESTING

### Public Endpoints
```bash
# Get all products
GET http://localhost:3000/api/products

# Get product by slug
GET http://localhost:3000/api/products/:slug

# Get all categories
GET http://localhost:3000/api/categories

# Get category by slug
GET http://localhost:3000/api/categories/:slug
```

### Admin Endpoints (Require Authentication)
```bash
# Login
POST http://localhost:3000/api/auth/login
Body: { "email": "admin@bellaluna.com", "password": "admin123" }

# Get all products (admin)
GET http://localhost:3000/api/admin/products
Headers: { "Authorization": "Bearer <token>" }

# Upload product images
POST http://localhost:3000/api/admin/products/:productId/images
Headers: { "Authorization": "Bearer <token>" }
Body: FormData with images

# Set primary image
PATCH http://localhost:3000/api/admin/products/:productId/images/:imageId/primary
Headers: { "Authorization": "Bearer <token>" }

# Get all orders
GET http://localhost:3000/api/admin/orders
Headers: { "Authorization": "Bearer <token>" }

# Update order status
PUT http://localhost:3000/api/admin/orders/:orderId/status
Headers: { "Authorization": "Bearer <token>" }
Body: { "status": "PROCESSING", "adminNotes": "Order is being prepared" }
```

---

## 🐛 Common Issues & Troubleshooting

### Issue: "Cannot connect to API"
**Solution:**
- Check backend server is running: `npm run dev` in root directory
- Verify port 3000 is not blocked
- Check `.env` file has correct configuration

### Issue: "Products not loading"
**Solution:**
- Check browser console for errors
- Verify API endpoint returns data: http://localhost:3000/api/products
- Run database seed if no data: `npm run db:seed`

### Issue: "Images not uploading"
**Solution:**
- Check Supabase credentials in `.env`
- Verify file size is under 5MB
- Check file type is JPG, PNG, or WebP
- Check browser console for errors

### Issue: "Admin login fails"
**Solution:**
- Verify credentials: `admin@bellaluna.com` / `admin123`
- Check if user exists in database
- Run seed if needed: `npm run db:seed`
- Check browser console for API errors

### Issue: "Cart not persisting"
**Solution:**
- Check localStorage is enabled
- Verify cart API endpoints work
- Check browser console for errors

---

## ✅ Testing Completion Checklist

### Storefront
- [ ] Homepage loads and displays correctly
- [ ] Product browsing works (categories, search)
- [ ] Product detail pages show complete info
- [ ] Shopping cart functions properly
- [ ] Customer registration works
- [ ] Customer login/logout works
- [ ] Checkout process completes
- [ ] Order confirmation displays
- [ ] Order history accessible

### Admin Panel
- [ ] Admin login works
- [ ] Dashboard displays statistics
- [ ] Products list loads
- [ ] Product search/filter works
- [ ] Image upload works
- [ ] Set primary image works
- [ ] Delete image works
- [ ] Delete product works
- [ ] Categories management works
- [ ] Orders list displays
- [ ] Order details viewable
- [ ] Order status update works

### API
- [ ] Health check responds
- [ ] Public product endpoints work
- [ ] Public category endpoints work
- [ ] Admin authentication works
- [ ] Admin product endpoints work
- [ ] Admin order endpoints work
- [ ] Error responses are proper
- [ ] CORS configured correctly

### Performance
- [ ] Pages load quickly (< 2 seconds)
- [ ] Images load efficiently
- [ ] No memory leaks
- [ ] API responses are fast

### Security
- [ ] Admin routes protected
- [ ] JWT tokens working
- [ ] Password hashing works
- [ ] File upload validation works
- [ ] SQL injection protected

---

## 📊 Test Data

### Seeded Data Available
- **Admin User:** admin@bellaluna.com / admin123
- **Products:** 3 sample products (Labial, Base, Sérum)
- **Categories:** 6+ categories with subcategories
- **Attributes:** Color, Tamaño, Presentación

### Create Test Data
If you need more test data:
```bash
# Run seed script
npm run db:seed

# Or manually create via admin panel
```

---

## 🎯 Next Steps After Testing

1. **Fix any bugs found** during testing
2. **Optimize performance** if needed
3. **Add missing features** (if any identified)
4. **Improve UX** based on testing feedback
5. **Prepare for production** deployment

---

## 📞 Support

If you encounter issues during testing:
1. Check browser console (F12)
2. Check backend terminal logs
3. Verify database connection
4. Check `.env` configuration
5. Review error messages carefully

---

**Happy Testing! 🚀**
