# Glee Threads - T-Shirt E-commerce Application

## 🎯 Project Overview
A fully functional t-shirt e-commerce application with MySQL/MariaDB backend, user authentication, product management with sizes and availability tracking. Specializing in custom and ready-made t-shirts for men.

## 🗄️ Database Setup

### Connection Details
- **Database**: `dress_shop`
- **Host**: localhost
- **User**: root
- **Password**: 8220
- **Port**: 3306

### Database Schema
The database includes the following tables:
- `users` - User accounts with authentication
- `categories` - T-shirt categories (Graphic, Plain, Oversized, Premium)
- `products` - T-shirt products with details
- `sizes` - Available sizes (XS, S, M, L, XL, XXL)
- `product_inventory` - Stock levels for each product/size combination
- `product_images` - Additional product images
- `cart_items` - Shopping cart items

### Sample Data
- 4 categories of t-shirts
- 8 t-shirt products with descriptions, materials, and care instructions
- Size availability for each product
- Admin account: `admin@dressshop.com` (password: admin123)

## 🚀 Features

### Authentication & Authorization
- User registration and login
- JWT token-based authentication
- Protected routes (cart requires login)
- Role-based access (user/admin)

### Product Management
- Browse t-shirts by category
- View detailed product information
- Check size availability in real-time
- Material and care instructions
- High-quality product images

### Shopping Cart
- Add items to cart with size selection
- Quantity management
- View cart with price calculations
- Remove items from cart

### Size & Availability
- Real-time stock tracking by size
- Visual size selector with availability status
- Prevents adding out-of-stock items

## 📁 Project Structure

```
Ecommerce/
├── database/
│   └── schema.sql              # Database schema and seed data
├── src/
│   ├── app/
│   │   ├── api/                # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   ├── login/     # POST /api/auth/login
│   │   │   │   └── register/  # POST /api/auth/register
│   │   │   ├── products/      # Product endpoints
│   │   │   │   ├── route.ts   # GET /api/products
│   │   │   │   └── [id]/      # GET /api/products/:id
│   │   │   ├── categories/    # GET /api/categories
│   │   │   └── cart/          # Cart endpoints (GET, POST, DELETE)
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── products/          # Products listing & detail pages
│   │   └── cart/              # Shopping cart page
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation with auth state
│   │   └── Footer.tsx         # Footer component
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context provider
│   ├── lib/
│   │   └── db.ts              # MySQL connection pool
│   └── types/
│       └── product.ts         # TypeScript interfaces
└── .env.local                 # Environment variables
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register
Body: { email, password, name }

POST /api/auth/login
Body: { email, password }
Returns: { token, user }
```

### Products
```
GET /api/products
Query: ?category=slug&search=query

GET /api/products/:id
Returns: Product with sizes and availability
```

### Categories
```
GET /api/categories
Returns: List of all categories
```

### Cart (Requires Authentication)
```
GET /api/cart
Headers: Authorization: Bearer <token>

POST /api/cart
Headers: Authorization: Bearer <token>
Body: { product_id, size_id, quantity }

DELETE /api/cart?id=<cart_item_id>
Headers: Authorization: Bearer <token>
```

## 🛠️ Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MySQL/MariaDB
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Database Client**: mysql2

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
mariadb -u root -p8220 < database/schema.sql
```

### 3. Configure Environment
The `.env.local` file is already configured with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=8220
DB_NAME=dress_shop
NEXTAUTH_SECRET=your-super-secret-key
JWT_SECRET=your-jwt-secret-key
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 📝 Usage Guide

### For Users
1. **Register/Login**: Create an account or login
2. **Browse T-Shirts**: View all t-shirts or filter by category
3. **View Details**: Click on a t-shirt to see details and sizes
4. **Select Size**: Choose your size (shows availability)
5. **Add to Cart**: Select quantity and add to cart
6. **Checkout**: View cart and proceed to checkout

### Testing
- Create a new account via `/register`
- Or use admin account: `admin@dressshop.com` / `admin123`

## 🔐 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for session management
- Protected API routes with token verification
- SQL injection prevention with prepared statements
- XSS protection with Next.js built-in sanitization

## 📊 Database Queries Examples

### Check Product Availability
```sql
SELECT p.name, s.name as size, pi.quantity
FROM products p
JOIN product_inventory pi ON p.id = pi.product_id
JOIN sizes s ON pi.size_id = s.id
WHERE p.id = 1;
```

### View User Cart
```sql
SELECT p.name, s.name as size, ci.quantity, p.price
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
JOIN sizes s ON ci.size_id = s.id
WHERE ci.user_id = 1;
```

## 🎨 Customization

### Change Brand Colors
Edit Tailwind classes in components:
- Primary: `pink-600` → your color
- Hover states: `pink-700` → your hover color

### Add More Sizes
```sql
INSERT INTO sizes (name, display_order) VALUES ('XXXL', 7);
```

### Add Products
```sql
INSERT INTO products (...) VALUES (...);
INSERT INTO product_inventory (product_id, size_id, quantity, sku) VALUES (...);
```

## 🚀 Next Steps

- [ ] Implement order placement
- [ ] Add payment gateway integration
- [ ] Create admin dashboard
- [ ] Add product reviews
- [ ] Implement wishlist
- [ ] Email notifications
- [ ] Order history
- [ ] Product recommendations
- [ ] Search functionality
- [ ] Image upload for products

## 📞 Support

For issues or questions, check:
- Database connection in `.env.local`
- MariaDB service is running
- Tables are created properly
- JWT_SECRET is set

## 🎉 Success!

Your t-shirt shop is now running with:
✅ MySQL/MariaDB backend
✅ User authentication
✅ Product catalog with sizes
✅ Real-time availability tracking
✅ Shopping cart functionality
✅ Responsive design
