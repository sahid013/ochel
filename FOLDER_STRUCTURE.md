# 📁 Ochel - Project Folder Structure

## Overview
This project follows a **feature-based architecture** combined with Next.js conventions for maximum clarity and scalability.

---

## 🗂️ Root Structure

```
ochel/
├── src/                      # All source code
├── public/                   # Static assets
├── .next/                    # Next.js build output (auto-generated)
├── node_modules/             # Dependencies (auto-generated)
└── configuration files       # package.json, tsconfig.json, etc.
```

---

## 📦 Source Directory (`src/`)

### **Current Structure:**
```
src/
├── app/                      # Next.js App Router (Pages & Routing)
├── components/               # React Components
├── contexts/                 # React Contexts (Global State)
├── hooks/                    # Custom React Hooks
├── lib/                      # Core Libraries & Utilities
├── services/                 # API & Business Logic
└── types/                    # TypeScript Type Definitions
```

### **Recommended Professional Structure:**
```
src/
├── app/                      # ⚡ Next.js App Router
│   ├── (auth)/              # Auth-related routes (grouped)
│   ├── (platform)/          # Main platform routes (grouped)
│   ├── api/                 # API endpoints
│   └── ...                  # Root routes
│
├── features/                 # 🎯 Feature Modules (NEW)
│   ├── auth/                # Authentication feature
│   ├── admin/               # Admin dashboard feature
│   ├── menu/                # Menu management feature
│   └── templates/           # Template system feature
│
├── shared/                   # 🔗 Shared Resources (NEW)
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Reusable hooks
│   ├── lib/                 # Core utilities
│   ├── services/            # Shared services
│   └── types/               # Shared TypeScript types
│
└── config/                   # ⚙️ Configuration (NEW)
    └── constants.ts         # App-wide constants
```

---

## 📖 Detailed Breakdown

### 1️⃣ **`app/` Directory** (Next.js Routing)

**Purpose:** Defines all routes and pages using Next.js App Router

```
app/
├── (auth)/                   # 🔐 Authentication Routes (Route Group)
│   ├── login/
│   │   └── page.tsx         # /login
│   ├── signup/
│   │   └── page.tsx         # /signup
│   └── reset-password/
│       └── page.tsx         # /reset-password
│
├── [slug]/                   # 🏪 Dynamic Restaurant Routes
│   ├── page.tsx             # /{restaurant-slug} (Public Menu)
│   └── admin/
│       └── page.tsx         # /{restaurant-slug}/admin
│
├── admin/                    # 🔄 Legacy Admin Redirect
│   └── page.tsx             # /admin → redirects to /{slug}/admin
│
├── logout/                   # 🚪 Logout Page
│   └── page.tsx
│
├── api/                      # 🌐 API Routes
│   └── upload/
│       └── route.ts         # /api/upload (Image uploads)
│
├── layout.tsx               # Root layout (wraps all pages)
├── page.tsx                 # / (Landing page - "Ochel")
└── globals.css              # Global styles
```

**Route Examples:**
- `/` → Landing page
- `/login` → Login page
- `/signup` → Signup page
- `/test-restaurant` → Public menu for "test-restaurant"
- `/test-restaurant/admin` → Admin panel for "test-restaurant"

---

### 2️⃣ **`components/` Directory** (Current Organization)

```
components/
├── admin/                    # 👨‍💼 Admin Panel Components
│   ├── menu/                # Menu management subcomponents
│   │   ├── translation/    # Translation-related components
│   │   ├── AddonsManagement.tsx
│   │   ├── CategoriesManagement.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── MenuItemsManagement.tsx
│   │   └── SubcategoriesManagement.tsx
│   ├── AdminHeader.tsx
│   ├── MenuManagementTab.tsx
│   ├── TemplateSelector.tsx
│   └── index.ts             # Exports
│
├── layout/                   # 🏗️ Layout Components
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── HamburgerNavigation.tsx
│   ├── LanguageSwitcher.tsx
│   ├── PageLayout.tsx
│   └── index.ts
│
├── menu/                     # 🍕 Menu Display Components
│   ├── MenuDisplay.tsx      # Main menu display
│   ├── MenuItemCard.tsx     # Individual menu item
│   ├── MenuItemSkeleton.tsx # Loading skeleton
│   ├── ComingSoonTemplate.tsx # Template placeholder
│   └── index.ts
│
├── providers/                # 🔌 React Context Providers
│   ├── ClientProviders.tsx
│   └── index.ts
│
├── ui/                       # 🎨 Reusable UI Components
│   ├── Alert.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ConfirmationModal.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   └── index.ts
│
├── DeliveryPopup.tsx        # Global delivery popup
└── index.ts                  # Main exports
```

---

### 3️⃣ **`contexts/` Directory** (Global State)

```
contexts/
├── AuthContext.tsx          # 🔐 Authentication state
├── LanguageContext.tsx      # 🌍 Language/translation state
└── index.ts                 # Exports
```

**Usage:** Import contexts in components that need global state
```tsx
import { useAuth } from '@/contexts/AuthContext';
```

---

### 4️⃣ **`hooks/` Directory** (Custom Hooks)

```
hooks/
├── useAsync.ts              # Async operation handling
├── useHeaderTexts.ts        # Dynamic header texts
├── useLocalStorage.ts       # LocalStorage wrapper
├── useRestaurant.ts         # Fetch restaurant data
├── useReservations.ts       # Reservation management
└── index.ts                 # Exports
```

**Usage:** Reusable logic extracted into hooks
```tsx
import { useRestaurant } from '@/hooks/useRestaurant';
```

---

### 5️⃣ **`lib/` Directory** (Core Utilities)

```
lib/
├── supabase.ts              # 🗄️ Supabase client configuration
├── storage.ts               # 📦 File storage utilities
├── cn.ts                    # 🎨 Class name utility
└── index.ts                 # Exports
```

**Purpose:** Core functionality used across the app

---

### 6️⃣ **`services/` Directory** (Business Logic)

```
services/
├── menuService.ts           # 🍽️ Menu CRUD operations
├── reservationService.ts    # 📅 Reservation handling
└── index.ts                 # Exports
```

**Purpose:** Encapsulates all API calls and business logic
- **menuService:** Categories, subcategories, menu items, addons
- **reservationService:** Reservation management

---

### 7️⃣ **`types/` Directory** (TypeScript Definitions)

```
types/
├── database.ts              # 🗄️ Supabase auto-generated types
├── index.ts                 # 📝 Custom app types (Restaurant, Reservation, etc.)
└── model-viewer.d.ts        # 3D model viewer types
```

**Types Defined:**
- `Restaurant` - Restaurant data structure
- `Reservation` - Reservation data
- `Menu Item, Category, Subcategory, Addon` - Menu entities

---

## 🎯 Feature-Based Organization (Recommended)

For better scalability, consider organizing by **features** instead of file types:

### **Proposed: `features/` Directory**

```
src/features/
├── auth/                     # 🔐 Authentication Feature
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── index.ts
│
├── admin/                    # 👨‍💼 Admin Dashboard Feature
│   ├── components/
│   │   ├── AdminHeader.tsx
│   │   ├── MenuManagementTab.tsx
│   │   └── TemplateSelector.tsx
│   ├── hooks/
│   │   └── useRestaurant.ts
│   └── index.ts
│
├── menu/                     # 🍕 Menu Management Feature
│   ├── components/
│   │   ├── MenuDisplay.tsx
│   │   ├── MenuItemCard.tsx
│   │   └── CategoriesManagement.tsx
│   ├── services/
│   │   └── menuService.ts
│   ├── types/
│   │   └── menu.types.ts
│   └── index.ts
│
└── templates/                # 🎨 Template System Feature
    ├── components/
    │   ├── TemplateSelector.tsx
    │   └── ComingSoonTemplate.tsx
    └── index.ts
```

**Benefits:**
- ✅ All related code is in one place
- ✅ Easy to find feature-specific logic
- ✅ Better for team collaboration
- ✅ Scales well as app grows

---

## 📂 Public Directory

```
public/
├── icons/                    # App icons
├── images/                   # Static images
│   ├── testimonial/         # User testimonials
│   └── ...
└── ...
```

---

## 🔍 Quick Reference - Find Things Fast

| **What I Need**              | **Where to Look**                          |
|------------------------------|--------------------------------------------|
| **Pages/Routes**             | `src/app/`                                 |
| **Login/Signup**             | `src/app/(auth)/` or `src/components/`     |
| **Admin Panel**              | `src/app/[slug]/admin/` + `src/components/admin/` |
| **Menu Components**          | `src/components/menu/`                     |
| **API Calls (Menu)**         | `src/services/menuService.ts`              |
| **Database Types**           | `src/types/`                               |
| **Supabase Config**          | `src/lib/supabase.ts`                      |
| **Authentication Logic**     | `src/contexts/AuthContext.tsx`             |
| **Reusable Hooks**           | `src/hooks/`                               |
| **UI Components**            | `src/components/ui/`                       |
| **Styles**                   | `src/app/globals.css`                      |
| **Static Assets**            | `public/`                                  |

---

## 🚀 Migration Plan (Current → Feature-Based)

If you want to migrate to the feature-based structure:

1. **Create `features/` directory**
2. **Move auth-related code** → `features/auth/`
3. **Move admin code** → `features/admin/`
4. **Move menu code** → `features/menu/`
5. **Keep shared code** in `src/shared/`
6. **Update imports** throughout the codebase

**Would you like me to do this migration?** Let me know!

---

## 📝 Best Practices

1. **One component per file** - Keep files focused
2. **Co-locate related code** - Feature folders keep related code together
3. **Use barrel exports** - `index.ts` files for clean imports
4. **Absolute imports** - Use `@/` instead of relative paths
5. **Type everything** - Leverage TypeScript for better DX

---

## 📞 Need Help?

- **Can't find a component?** Check `src/components/[feature-name]/`
- **Need to add API logic?** Add to `src/services/`
- **Creating new types?** Add to `src/types/index.ts`
- **New page?** Add to `src/app/`

---

**Last Updated:** $(date +%Y-%m-%d)
**Version:** 1.0
