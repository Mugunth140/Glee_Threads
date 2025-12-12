# 🎉 Glee Threads - Quick Start Guide

## ✅ What's Been Completed

Your dress shop e-commerce application is now fully functional with:

### 🗄️ **Database (MariaDB/MySQL)**
- ✅ Database `dress_shop` created
- ✅ 8 tables with relationships
- ✅ 8 sample dress products
- ✅ 4 categories (Evening, Casual, Party, Summer)
- ✅ 6 sizes (XS, S, M, L, XL, XXL)
- ✅ Stock tracking per product/size
- ✅ Admin user pre-created

### 🔐 **Authentication & Authorization**
- ✅ User registration (POST /api/auth/register)
- ✅ User login with JWT (POST /api/auth/login)
- ✅ Protected routes
- ✅ Auth context for frontend
- ✅ Password hashing with bcrypt

### 🛍️ **Product Features**
- ✅ Product listing with categories
- ✅ Product detail pages
- ✅ Size selection with availability
- ✅ Material and care instructions
- ✅ Real-time stock tracking

### 🛒 **Shopping Cart**
- ✅ Add to cart with size selection
- ✅ View cart items
- ✅ Remove items
- ✅ Quantity management

### 🎨 **UI/UX**
- ✅ Responsive design
- ✅ Pink theme for dress shop
- ✅ Login/Register pages
- ✅ Protected cart (requires login)
- ✅ User greeting in navbar

## 🚀 Application is Running

**URL**: http://localhost:3000

## 🧪 Test the Application

### 1. **Test Registration**
- Go to http://localhost:3000/register
- Create a new account
- You'll be auto-logged in and redirected to products

### 2. **Test Login with Admin Account**
- Go to http://localhost:3000/login
- Email: `admin@dressshop.com`
- Password: `admin123`

### 3. **Browse Products**
- Go to http://localhost:3000/products
- Filter by category (Evening, Casual, Party, Summer)
- See size availability badges (green = in stock)

### 4. **View Product Details**
- Click on any dress
- Select a size
- See stock levels for that size
- Adjust quantity
- Add to cart (requires login)

### 5. **Shopping Cart**
- Must be logged in
- Add items with different sizes
- View cart at http://localhost:3000/cart

## 📊 Database Access

### View Data in MySQL
```bash
mariadb -u root -p8220

USE dress_shop;

-- View all products
SELECT * FROM products;

-- Check inventory by product
SELECT p.name, s.name as size, pi.quantity, pi.sku
FROM products p
JOIN product_inventory pi ON p.id = pi.product_id
JOIN sizes s ON pi.size_id = s.id
ORDER BY p.id, s.display_order;

-- View categories
SELECT * FROM categories;

-- View users
SELECT id, email, name, role FROM users;
```

## 🔌 API Testing

### Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dressshop.com","password":"admin123"}'
```

### Get Products
```bash
curl http://localhost:3000/api/products

# Filter by category
curl http://localhost:3000/api/products?category=evening-dresses
```

### Get Product Details
```bash
curl http://localhost:3000/api/products/1
```

### Add to Cart (requires token)
```bash
TOKEN="your-jwt-token-here"
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id":1,"size_id":3,"quantity":2}'
```

## 📝 Sample Products in Database

1. **Elegant Black Evening Gown** - $299.99 (Evening Dresses)
2. **Floral Summer Maxi Dress** - $89.99 (Summer Dresses)
3. **Red Cocktail Dress** - $149.99 (Party Dresses)
4. **Blue Casual Sundress** - $69.99 (Casual Dresses)
5. **White Lace Evening Dress** - $249.99 (Evening Dresses)
6. **Yellow Midi Dress** - $79.99 (Casual Dresses)
7. **Navy Blue Party Dress** - $179.99 (Party Dresses)
8. **Pink Floral Dress** - $99.99 (Summer Dresses)

Each dress has multiple sizes with varying availability!

## 🎯 Key Features to Explore

### Size Availability
- Each product shows size badges
- Green badge = in stock
- Gray badge = out of stock
- Can't select out-of-stock sizes
- Stock count displayed when size selected

### Authentication Flow
- Register → Auto login → Redirect to products
- Login → Redirect to products
- Protected cart (must login to access)
- User name shown in navbar when logged in
- Logout button available

### Responsive Design
- Works on mobile, tablet, desktop
- Mobile menu for navigation
- Touch-friendly size selection

## 📁 Important Files

### Configuration
- `.env.local` - Database & auth configuration
- `database/schema.sql` - Database structure & seed data

### API Routes
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/register/route.ts` - Registration endpoint
- `src/app/api/products/route.ts` - Products list
- `src/app/api/products/[id]/route.ts` - Product details
- `src/app/api/categories/route.ts` - Categories
- `src/app/api/cart/route.ts` - Cart operations

### Frontend Pages
- `src/app/login/page.tsx` - Login form
- `src/app/register/page.tsx` - Registration form
- `src/app/products/page.tsx` - Products listing
- `src/app/products/[id]/page.tsx` - Product detail
- `src/app/cart/page.tsx` - Shopping cart

### Core Components
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/components/Navbar.tsx` - Navigation with auth
- `src/lib/db.ts` - Database connection

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Start if not running
sudo systemctl start mariadb

# Test connection
mariadb -u root -p8220 -e "USE dress_shop; SELECT COUNT(*) FROM products;"
```

### JWT Token Issues
- Check `.env.local` has JWT_SECRET set
- Make sure token is sent in Authorization header
- Token format: `Bearer <your-token>`

### Products Not Loading
- Check database has data: `SELECT COUNT(*) FROM products;`
- Check API endpoint: http://localhost:3000/api/products
- Open browser console for errors

## 🎉 You're All Set!

Your dress shop is fully functional with:
- ✅ Database backend
- ✅ User authentication
- ✅ Product catalog
- ✅ Size selection
- ✅ Stock tracking
- ✅ Shopping cart
- ✅ Responsive design

**Start shopping at**: http://localhost:3000
