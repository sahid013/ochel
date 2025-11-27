# 🚀 Ochel - Developer Quick Reference Guide

## 📋 Common Tasks & Where to Find Things

### 🔍 **"I need to..."**

---

### **1. Add a New Page/Route**

**Location:** `src/app/`

**Examples:**
```bash
# Add a new page
src/app/about/page.tsx          # Creates /about route

# Add a dynamic route
src/app/[slug]/page.tsx         # /{restaurant-slug}

# Add a nested route
src/app/dashboard/settings/page.tsx  # /dashboard/settings
```

**Template:**
```tsx
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>My New Page</div>;
}
```

---

### **2. Create/Edit a Component**

**Locations:**
- **Admin components:** `src/components/admin/`
- **Menu components:** `src/components/menu/`
- **UI components:** `src/components/ui/`
- **Layout components:** `src/components/layout/`

**Example:**
```tsx
// src/components/ui/MyButton.tsx
export function MyButton({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

**Don't forget to export:**
```tsx
// src/components/ui/index.ts
export { MyButton } from './MyButton';
```

---

### **3. Add Authentication Logic**

**Location:** `src/contexts/AuthContext.tsx`

**Hook to use auth:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

---

### **4. Add/Modify Menu Data (Categories, Items, etc.)**

**Service:** `src/services/menuService.ts`

**Examples:**
```tsx
import { menuService } from '@/services/menuService';

// Create category
const category = await menuService.createCategory({
  title: 'Desserts',
  restaurant_id: 'abc-123',
  // ...
});

// Get all menu items
const items = await menuService.getAllMenuItems(restaurantId);
```

---

### **5. Add a Custom Hook**

**Location:** `src/hooks/`

**Template:**
```tsx
// src/hooks/useMyFeature.ts
import { useState, useEffect } from 'react';

export function useMyFeature() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Your logic here
  }, []);
  
  return { data };
}
```

**Export it:**
```tsx
// src/hooks/index.ts
export { useMyFeature } from './useMyFeature';
```

---

### **6. Add TypeScript Types**

**Location:** `src/types/index.ts`

**Example:**
```tsx
// src/types/index.ts
export interface MyNewType {
  id: string;
  name: string;
  createdAt: Date;
}
```

**Usage:**
```tsx
import { MyNewType } from '@/types';
```

---

### **7. Configure Supabase**

**Location:** `src/lib/supabase.ts`

**Environment variables:** `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

### **8. Add Global Styles**

**Location:** `src/app/globals.css`

**Add Tailwind classes or custom CSS here**

---

### **9. Upload Images/Files**

**API Route:** `src/app/api/upload/route.ts`

**Component:** `src/components/admin/menu/ImageUpload.tsx`

**Usage:**
```tsx
import ImageUpload from '@/components/admin/menu/ImageUpload';

<ImageUpload
  onUploadComplete={(url) => console.log(url)}
  currentImage={existingImageUrl}
/>
```

---

### **10. Add Translation/Multi-language Support**

**Context:** `src/contexts/LanguageContext.tsx`

**Hook:**
```tsx
import { useTranslation } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();
  
  return <h1>{t('welcome.title')}</h1>;
}
```

---

## 🗂️ File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Component** | PascalCase | `MyComponent.tsx` |
| **Hook** | camelCase with `use` prefix | `useMyHook.ts` |
| **Service** | camelCase with `Service` suffix | `menuService.ts` |
| **Type/Interface** | PascalCase | `User`, `Restaurant` |
| **Page** | `page.tsx` | `src/app/about/page.tsx` |
| **API Route** | `route.ts` | `src/app/api/users/route.ts` |
| **Layout** | `layout.tsx` | `src/app/layout.tsx` |

---

## 📦 Import Path Aliases

Use `@/` for absolute imports:

```tsx
// ✅ Good
import { Button } from '@/components/ui/Button';
import { menuService } from '@/services/menuService';
import { Restaurant } from '@/types';

// ❌ Avoid
import { Button } from '../../../components/ui/Button';
```

---

## 🎨 Component Structure Best Practices

```tsx
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui';
import { menuService } from '@/services';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

// 3. Component
export default function MyComponent({ title, onSave }: MyComponentProps) {
  // 4. Hooks
  const [data, setData] = useState(null);

  // 5. Functions
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Save</Button>
    </div>
  );
}
```

---

## 🛠️ Common Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🗄️ Database Operations (Supabase)

### **Query Data:**
```tsx
const { data, error } = await supabase
  .from('restaurants')
  .select('*')
  .eq('slug', 'my-restaurant')
  .single();
```

### **Insert Data:**
```tsx
const { data, error } = await supabase
  .from('restaurants')
  .insert({
    name: 'My Restaurant',
    slug: 'my-restaurant',
    owner_id: userId,
  });
```

### **Update Data:**
```tsx
const { data, error } = await supabase
  .from('restaurants')
  .update({ name: 'Updated Name' })
  .eq('id', restaurantId);
```

### **Delete Data:**
```tsx
const { error } = await supabase
  .from('restaurants')
  .delete()
  .eq('id', restaurantId);
```

---

## 🔐 Protected Routes

To protect a route, check authentication in the page:

```tsx
// src/app/protected/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <div>Loading...</div>;

  return <div>Protected Content</div>;
}
```

---

## 📊 State Management

| Scope | Solution | Location |
|-------|----------|----------|
| **Global App State** | React Context | `src/contexts/` |
| **Component State** | `useState` | Inside component |
| **Server State** | Supabase + React Query | `src/services/` |
| **Form State** | `useState` or form libraries | Inside component |

---

## 🧪 Testing (Future)

When adding tests:
- **Unit tests:** Next to the component (`MyComponent.test.tsx`)
- **Integration tests:** `__tests__/` folder
- **E2E tests:** `e2e/` folder (root level)

---

## 📝 Code Comments

```tsx
// ✅ Good - Explains WHY
// Use timeout to prevent infinite hanging on slow connections
const timeout = setTimeout(() => reject(), 5000);

// ❌ Bad - Explains WHAT (obvious from code)
// Set timeout to 5000
const timeout = setTimeout(() => reject(), 5000);
```

---

## 🚨 Common Pitfalls

1. **Importing without alias:**
   - ❌ `import { Button } from '../../../components/ui'`
   - ✅ `import { Button } from '@/components/ui'`

2. **Not handling async errors:**
   ```tsx
   // ❌ Bad
   const data = await fetchData();

   // ✅ Good
   try {
     const data = await fetchData();
   } catch (error) {
     console.error('Failed:', error);
   }
   ```

3. **Missing TypeScript types:**
   ```tsx
   // ❌ Bad
   function MyComponent({ data }) { ... }

   // ✅ Good
   interface Props {
     data: Restaurant;
   }
   function MyComponent({ data }: Props) { ... }
   ```

---

## 🎯 Next Steps

1. **Read:** `FOLDER_STRUCTURE.md` for full structure details
2. **Check:** `PROJECT_TREE.txt` for visual file tree
3. **Reference:** This guide for common tasks

---

**Happy Coding! 🚀**

*Last Updated: 2025-01-12*
