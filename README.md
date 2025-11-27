# Ochel Menu System

A powerful, full-stack digital menu management system built with Next.js and Supabase.

## 🚀 Features

- **Digital Menu Management**: Comprehensive system for managing categories, subcategories, menu items, and addons.
- **3D Model Support**: Showcase dishes with interactive 3D models (.glb and .usdz support for AR).
- **Multi-language Support**: Built-in support for English, French, Italian, and Spanish.
- **Multiple Templates**: Choose from various elegant templates to display your menu.
- **Real-time Updates**: Powered by Supabase for instant menu updates.
- **Responsive Design**: Optimized for all devices, from mobile phones to desktop screens.
- **Demo Mode**: Try the menu editor without signing up.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **TypeScript**: Full type safety
- **Deployment**: Vercel-ready

## 📋 Database Schema

The application uses the following core tables:

- `restaurants`: Stores restaurant profiles and settings.
- `categories`: Menu categories (e.g., Starters, Mains).
- `subcategories`: Sub-groupings within categories.
- `menu_items`: Individual dishes with prices, images, and 3D models.
- `addons`: Extra options or supplements for items.

## 🔗 Routes

- `/` - Landing page with Demo Menu Editor.
- `/login` - Restaurant owner login.
- `/signup` - New account registration.
- `/[slug]` - Public menu page for a specific restaurant.
- `/admin` - Dashboard for managing the menu.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Customization

Restaurants can customize their menu appearance:
- **Primary & Accent Colors**
- **Fonts** (Forum, Satoshi, EB Garamond, etc.)
- **Templates** (Classic Dark, Modern, etc.)

## 🤝 Contributing

The codebase is structured for scalability:
- `src/services/menu/`: Modular services for menu data.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks for data fetching and state.