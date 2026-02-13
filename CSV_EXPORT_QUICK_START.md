# CSV Export - Quick Start Guide

## Overview
The admin products page now includes a **Download CSV** button that exports all products and their attributes as a CSV file.

## How to Use

### Step 1: Navigate to Products Admin Page
1. Log in as an admin
2. Go to **Admin Dashboard > Productos**

### Step 2: Click Download Button
- Look for the **"Descargar CSV"** button in the top right area
- It's located next to the "Nuevo Producto" button

### Step 3: File Downloads
- The CSV file will automatically download to your default downloads folder
- Filename format: `productos-YYYY-MM-DD.csv`
- Example: `productos-2026-02-12.csv`

### Step 4: Open in Spreadsheet
Open the downloaded CSV file with:
- Microsoft Excel
- Google Sheets
- LibreOffice Calc
- Apple Numbers
- Any text editor

## CSV File Contents

### What's Included
✅ All products in your catalog
✅ All product attributes (SKU, Name, Price, Cost, etc.)
✅ Dynamic attribute columns (Color, Size, etc.)
✅ Category information
✅ Stock tracking status
✅ Active/Featured status

### Column Structure
The CSV contains:
- **Nombre** - Product name
- **SKU** - Product identifier
- **Descripción** - Product description  
- **Marca** - Brand
- **Precio Base** - Base selling price
- **Costo Base** - Base cost
- **Descuento %** - Discount percentage
- **Categorías** - All categories the product belongs to
- **Activo** - Whether product is active (Sí/No)
- **Destacado** - Whether product is featured (Sí/No)
- **Tracking Stock** - Whether stock is tracked (Sí/No)
- **[Attribute Columns]** - One column per attribute (Color, Tamaño, etc.)

## Common Uses

### 📊 Data Analysis
- Analyze pricing across categories
- Track inventory and costs
- Review product mix
- Identify missing data

### 📋 Data Import/Export
- Back up your product data
- Share product list with suppliers
- Create reports for management
- Prepare data for other systems

### 🔄 Bulk Updates
- Download CSV
- Make changes in Excel
- Import back to system (future feature)

### 📤 Sharing
- Email product list to team
- Share with external stakeholders
- Create printable reports

## File Format

### Encoding
- UTF-8 encoding
- Proper handling of Spanish characters (ñ, á, é, í, ó, ú)
- Safe for all spreadsheet applications

### Special Characters
- Commas within values are properly escaped
- Quotes are properly escaped
- Line breaks are preserved
- Numbers are formatted as numbers for calculations

### Example Data
```
Nombre,SKU,Descripción,Marca,Precio Base,Activo,Color,Tamaño
Lipstick Rojo,SKU001,Labial rojo intenso,Marca X,45.99,Sí,Rojo,Normal
Sérum Facial,SKU002,Sérum antienvejecimiento,Marca Y,89.99,Sí,Transparente,30ml
```

## Troubleshooting

### Issue: File won't download
- ✅ Check internet connection
- ✅ Check browser pop-up blocker settings
- ✅ Verify you're logged in as admin
- ✅ Try a different browser

### Issue: File is empty
- ✅ Check if you have products in the system
- ✅ Verify file didn't open as text (check file extension)
- ✅ Refresh page and try again

### Issue: Special characters appear wrong
- ✅ Open file with UTF-8 encoding setting
- ✅ In Excel: Data > Text to Columns > UTF-8
- ✅ Use Google Sheets (automatic UTF-8)

### Issue: Numbers have extra decimals
- ✅ Format columns as "Number" in your spreadsheet
- ✅ Adjust decimal places as needed
- ✅ This is normal for prices stored in database

## Tips & Tricks

### 📌 Regular Exports
- Export monthly for record-keeping
- Keep copies for audit trails
- Helps track product changes over time

### 🔍 Finding Issues
- Sort by "Activo" to see inactive products
- Filter by "Tracking Stock" = "No" to find non-tracked items
- Look for empty cells in important columns

### 🎯 Using with Excel
1. Download CSV
2. Open in Excel
3. Data will auto-organize into columns
4. Use filters to analyze data
5. Create pivot tables for summaries

### 📊 Sharing Reports
1. Download CSV
2. Open in Google Sheets
3. Create charts and summaries
4. Share link with team
5. Anyone can view without leaving site

## Permissions Required
- Must be logged in as admin
- Admin token required
- Only admins can access this feature

## File Size
- Depends on number of products and attributes
- Typically 50-500 KB for most catalogs
- Larger catalogs may be 1-10 MB

## Support
If you encounter issues:
1. Check browser console for error messages
2. Verify admin credentials
3. Try downloading again
4. Contact system administrator if persistent

## Future Features
Coming soon:
- [ ] Filter products before export
- [ ] Select specific columns
- [ ] Export as Excel (.xlsx)
- [ ] Scheduled automatic exports
- [ ] Email export delivery
