# Glee Threads - T-Shirt E-commerce Application

A modern t-shirt e-commerce application built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Features

- 🛍️ Premium t-shirt catalog
- 🎨 Custom t-shirt design options
- 🛒 Shopping cart functionality
- 📱 Fully responsive design
- ⚡ Fast performance with Next.js App Router
- 🎨 Beautiful black & white UI with Tailwind CSS
- 🔍 Product search functionality
- 👔 Size selection (S, M, L, XL, XXL)
- 🏪 Admin panel for product management
- 🇮🇳 Indian localization (₹, GST, UPI, COD)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** React 19
- **Icons:** Custom SVG icons

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
Ecommerce/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── cart/            # Shopping cart page
│   │   ├── products/        # Products listing page
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── Footer.tsx       # Footer component
│   │   └── ProductCard.tsx  # Product card component
│   ├── lib/                 # Utilities and data
│   │   └── products.ts      # Product data
│   └── types/               # TypeScript types
│       └── product.ts       # Product type definitions
├── public/                  # Static assets
└── package.json
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
