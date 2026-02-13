# CSV Export Feature for Admin Products

## Overview
A new "Download CSV" button has been added to the admin products page that allows admins to export all products with their complete data as a CSV file.

## Features
- ✅ Exports all products with complete information
- ✅ Includes all attributes as columns
- ✅ Properly escapes CSV special characters
- ✅ Uses current date in filename
- ✅ Requires admin authentication
- ✅ Seamless download experience

## Changes Made

### Backend Changes

#### 1. AdminProductController.ts
**New Method:** `exportProductsCSV()`
- Location: `src/interface/controllers/AdminProductController.ts`
- Fetches all products with related data (categories, variants, attributes, images)
- Collects all unique attributes from variants
- Generates CSV with:
  - Base columns: SKU, Name, Description, Brand, Price, Cost, Discount %, Categories, Active, Featured, Stock Tracking
  - Dynamic attribute columns for each unique attribute found in variants
- Properly escapes CSV special characters (commas, quotes, newlines)
- Sets appropriate response headers for file download

#### 2. admin-product.routes.ts
**New Route:** `GET /api/admin/products/export/csv`
- Location: `src/interface/routes/admin-product.routes.ts`
- Route is placed BEFORE the `/:id` route to prevent parameter matching conflicts
- Requires authentication and admin role via middleware

### Frontend Changes

#### 1. ProductsPage.tsx
**New Import:** 
- Added `FileDownloadIcon` from `@mui/icons-material`

**New Handler Function:** `handleDownloadCSV()`
- Fetches CSV from API endpoint
- Handles authentication token from localStorage
- Triggers automatic browser download with timestamped filename
- Error handling with user feedback

**UI Updates:**
- Added "Descargar CSV" button next to "Nuevo Producto" button
- Uses outlined button variant to distinguish from primary action
- Displays file download icon

## CSV File Structure

### Columns (in order)
1. **SKU** - Product SKU identifier
2. **Nombre** - Product name
3. **Descripción** - Product description
4. **Marca** - Brand
5. **Precio Base** - Base price
6. **Costo Base** - Base cost
7. **Descuento %** - Discount percentage
8. **Categorías** - Category names (semicolon-separated)
9. **Activo** - Active status (Sí/No)
10. **Destacado** - Featured status (Sí/No)
11. **Tracking Stock** - Stock tracking enabled (Sí/No)
12. **[Attribute Name]** - One column per unique attribute found (e.g., Color, Size, etc.)

### Example CSV Output
```csv
SKU,Nombre,Descripción,Marca,Precio Base,Costo Base,Descuento %,Categorías,Activo,Destacado,Tracking Stock,Color,Tamaño
SKU001,Producto A,Una descripción,Marca X,99.99,45.00,10,Maquillaje; Labios,Sí,No,Sí,Rojo,M
SKU002,Producto B,Otra descripción,Marca Y,149.99,65.00,15,Skincare,Sí,Sí,No,Azul,L
```

## API Endpoint

### GET /api/admin/products/export/csv
**Authentication:** Required (Bearer token)
**Authorization:** Admin role required
**Content-Type:** text/csv; charset=utf-8
**Response:** CSV file download

**Error Handling:**
- Returns appropriate error messages if authentication fails
- Returns 500 error with descriptive message if export fails

## Frontend Token Handling
The download function attempts to get the authentication token from:
1. `localStorage.getItem('adminToken')` - Admin-specific token
2. Falls back to `localStorage.getItem('token')` - General auth token

## Usage Instructions

### For Admins
1. Navigate to Admin > Productos (Products)
2. Click "Descargar CSV" button
3. A CSV file will automatically download with filename: `productos-YYYY-MM-DD.csv`
4. Open in Excel, Google Sheets, or any spreadsheet application

### For Developers
The CSV export endpoint can be called directly:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/products/export/csv > productos.csv
```

## Filename Format
Downloaded files use the format: `productos-{YYYY-MM-DD}.csv`

Example: `productos-2026-02-12.csv`

## Character Encoding
- CSV is encoded in UTF-8 with BOM for proper character support
- Special Spanish characters (ñ, á, é, í, ó, ú) are properly handled
- Decimal numbers use standard format

## Error Handling
- Network errors show: "Error al descargar el CSV"
- Logged to console for debugging
- User receives friendly alert message

## Performance Considerations
- Loads all products into memory for processing
- Suitable for catalogs with up to several thousand products
- Consider implementing pagination if catalog exceeds 10,000 items

## Future Enhancements
- [ ] Add filtering options (by category, brand, status)
- [ ] Add column selection interface
- [ ] Support for Excel (.xlsx) format
- [ ] Scheduled exports
- [ ] Email delivery of exports
- [ ] Include images as separate file
- [ ] Include variant-level pricing information
