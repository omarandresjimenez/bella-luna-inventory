/**
 * Test data configuration
 * Define test users, products, and other test data here
 */

export const testUsers = {
  customer: {
    email: 'customer@example.com',
    password: 'password123',
    name: 'Test Customer',
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
  },
};

export const testProducts = {
  sample: {
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    category: 'Electronics',
  },
};

export const testAddresses = {
  home: {
    street: '123 Main Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country',
  },
  work: {
    street: '456 Office Blvd',
    city: 'Work City',
    state: 'Work State',
    zipCode: '54321',
    country: 'Work Country',
  },
};

export const testCategories = {
  electronics: {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
  },
  clothing: {
    name: 'Clothing',
    description: 'Apparel and fashion items',
  },
};

/**
 * Test timeouts (in milliseconds)
 */
export const timeouts = {
  short: 15000,      // Quick operations (increased from 5000)
  medium: 30000,     // Standard operations (increased from 10000)
  long: 60000,       // Slow operations or network requests (increased from 30000)
};

/**
 * URLs for navigation
 */
export const urls = {
  home: '/',
  login: '/login',
  register: '/register',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  favorites: '/favorites',
  products: '/products',
  admin: '/admin',
  adminLogin: '/admin/login',
  adminProducts: '/admin/products',
  adminCategories: '/admin/categories',
  adminAttributes: '/admin/attributes',
};

/**
 * Selectors for common elements
 */
export const selectors = {
  // Navigation
  userMenu: '[data-testid="user-menu-button"]',
  logoutBtn: 'text=Cerrar sesión',
  
  // Products
  productCard: '[data-testid="product-card"]',
  favoriteBtn: '[data-testid="favorite-btn"]',
  addToCartBtn: 'button:has-text("Agregar al carrito")',
  
  // Cart
  cartItem: '[data-testid="cart-item"]',
  removeFromCartBtn: 'button:has-text("Eliminar")',
  checkoutBtn: 'button:has-text("Proceder al pago")',
  
  // Forms
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  submitBtn: 'button[type="submit"]',
  
  // Messages
  successAlert: '[role="alert"]:has-text("éxito|creado|guardado|actualizado")',
  errorAlert: '[role="alert"]:has-text("error|Error|validación")',
  
  // Modals
  confirmBtn: 'button:has-text("Confirmar")',
  cancelBtn: 'button:has-text("Cancelar")',
  closeBtn: 'button[aria-label="Cerrar"]',
};

/**
 * Test data for different scenarios
 */
export const scenarios = {
  validLogin: {
    email: testUsers.customer.email,
    password: testUsers.customer.password,
  },
  invalidLogin: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  validRegistration: {
    email: `customer${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
  },
};
