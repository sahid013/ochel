# Ochel Reservation System

A beautiful, full-stack restaurant reservation system built with Next.js and Supabase.

## 🚀 Features

- **Beautiful Modern UI**: Elegant design with Tailwind CSS
- **Complete Reservation System**: Customers can book tables online
- **Real-time Database**: Powered by Supabase PostgreSQL
- **Customer Management**: View and manage personal reservations
- **Admin Dashboard**: Restaurant staff can manage all reservations
- **Responsive Design**: Works perfectly on desktop and mobile
- **TypeScript**: Fully type-safe application

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready for implementation)
- **TypeScript**: Full type safety
- **Deployment**: Vercel-ready

## 📋 Database Schema

The application uses a single `reservations` table with the following structure:

```sql
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0 AND guests <= 20),
    special_requests TEXT,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 User Flows

### Customer Experience
1. **Browse**: View restaurant information and features
2. **Reserve**: Fill out the reservation form with details
3. **Confirm**: Receive instant confirmation with reservation ID
4. **Manage**: Look up existing reservations by email
5. **Cancel**: Cancel reservations if needed

### Admin Experience
1. **Dashboard**: View daily statistics and reservation counts
2. **Filter**: Filter reservations by date, status, or search terms
3. **Manage**: Update reservation status (confirmed → completed/cancelled)
4. **Monitor**: Track total guests expected per day

## 🔗 Routes

- `/` - Main reservation page for customers
- `/admin` - Admin dashboard for restaurant staff

## 📱 Pages Overview

### Main Page (`/`)
- Hero section with restaurant information
- Reservation form with validation
- Customer reservation lookup
- Restaurant features showcase
- Contact information and hours

### Admin Page (`/admin`)
- Reservation statistics dashboard
- Advanced filtering and search
- Reservation management tools
- Daily guest count tracking
- Status update capabilities

## 🛡️ Security Features

- **Row Level Security (RLS)**: Enabled on Supabase tables
- **Input Validation**: Client and server-side validation
- **Type Safety**: Full TypeScript implementation
- **Environment Variables**: Secure credential management

## 🚀 Getting Started

The application is already set up and ready to run! 

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (already configured)

### Installation
The dependencies are already installed. Just run:

```bash
npm run dev
```

### Access Points
- **Customer Interface**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## 📊 Supabase Configuration

The application is connected to your Supabase project:
- **Project ID**: `jhugrvpaizlzeemazuna`
- **Region**: `eu-west-3`
- **Database**: PostgreSQL 17

### Database Tables Created
- ✅ `reservations` table with full schema
- ✅ Indexes for performance optimization
- ✅ Row Level Security policies
- ✅ Automatic timestamp triggers

## 🎨 Design Features

- **Color Palette**: Warm amber and orange gradients
- **Typography**: Modern font stack with proper hierarchy
- **Animations**: Smooth transitions and hover effects
- **Icons**: Emoji-based icons for universal appeal
- **Layout**: Responsive grid system

## 🔄 Future Enhancements

Ready-to-implement features:
- User authentication system
- Email notifications for reservations
- SMS confirmations
- Table availability checking
- Menu integration
- Payment processing
- Multi-location support
- Waitlist management

## 🐛 Troubleshooting

If you encounter any issues:

1. **Server won't start**: Check if port 3000 is available
2. **Database errors**: Verify Supabase connection
3. **Build errors**: Run `npm install` to ensure all dependencies
4. **Styling issues**: Check if Tailwind CSS is properly configured

## 📄 Environment Variables

The application uses these Supabase credentials (already configured):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

The codebase is well-structured for easy enhancement:
- Modular component design
- Clear separation of concerns
- Comprehensive TypeScript types
- Reusable utility functions

---

## 🎉 What's Included

✅ **Complete Next.js Setup**: Modern React application with TypeScript
✅ **Supabase Integration**: Full database connectivity and operations  
✅ **Beautiful UI**: Professional restaurant website design
✅ **Reservation System**: End-to-end booking functionality
✅ **Admin Dashboard**: Management interface for staff
✅ **Responsive Design**: Mobile-friendly interface
✅ **Type Safety**: Full TypeScript implementation
✅ **Database Schema**: Production-ready table structure
✅ **CRUD Operations**: Create, read, update, delete reservations

Your restaurant reservation system is now ready for production use! 🚀