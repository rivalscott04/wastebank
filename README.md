# Bank Sampah Digital

Aplikasi web untuk mengelola bank sampah dengan React, TypeScript, dan Tailwind CSS.

## 🛠 Tech Stack

- **React** 18.3.1
- **TypeScript** 5.x
- **Vite** 5.x (Build Tool)
- **Tailwind CSS** 3.x
- **Shadcn/ui** (UI Components)
- **React Router DOM** 6.26.2
- **TanStack React Query** 5.56.2
- **React Hook Form** 7.53.0

## 📋 Prerequisites

```bash
# Check Node.js version (minimum 18.x)
node --version

# Check npm version (minimum 8.x)
npm --version
```

## 🚀 Installation

### 1. Clone & Setup
```bash
git clone <YOUR_REPO_URL>
cd bank-sampah-digital
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

### 3. Development Server
```bash
# Start development server
npm run dev

# Server runs on http://localhost:8080
```

### 4. Build for Production
```bash
# Build project
npm run build

# Preview build
npm run preview
```

## 🔧 Manual Tech Stack Installation

If you need to install packages manually:

```bash
# Core React & TypeScript
npm install react@^18.3.1 react-dom@^18.3.1
npm install -D typescript@^5.0.0 @types/react@^18.0.0 @types/react-dom@^18.0.0

# Build Tool
npm install -D vite@^5.0.0 @vitejs/plugin-react-swc@^3.0.0

# Tailwind CSS
npm install -D tailwindcss@^3.0.0 postcss@^8.0.0 autoprefixer@^10.0.0
npm install tailwindcss-animate@^1.0.7 tailwind-merge@^2.5.2

# UI Components (Shadcn/ui dependencies)
npm install @radix-ui/react-slot@^1.1.0
npm install @radix-ui/react-dialog@^1.1.2
npm install @radix-ui/react-label@^2.1.0
npm install @radix-ui/react-toast@^1.2.1
npm install @radix-ui/react-select@^2.1.1
npm install @radix-ui/react-checkbox@^1.1.1
npm install class-variance-authority@^0.7.1
npm install clsx@^2.1.1

# Routing & State Management
npm install react-router-dom@^6.26.2
npm install @tanstack/react-query@^5.56.2

# Form Handling
npm install react-hook-form@^7.53.0
npm install @hookform/resolvers@^3.9.0
npm install zod@^3.23.8

# Icons & Notifications
npm install lucide-react@^0.462.0
npm install sonner@^1.5.0
```

## 🎨 Shadcn/ui Setup

```bash
# Initialize shadcn/ui (if not already done)
npx shadcn@latest init

# Add specific components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add toast
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add textarea
npx shadcn@latest add skeleton
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn/ui components
│   ├── AdminSidebar.tsx
│   └── NasabahSidebar.tsx
├── pages/
│   ├── admin/
│   ├── nasabah/
│   ├── Login.tsx
│   └── Register.tsx
├── hooks/
├── lib/
└── App.tsx
```

## 🔐 Demo Accounts

**Admin:**
- Email: admin@example.com
- Password: password

**Nasabah:**
- Email: nasabah@example.com  
- Password: password

## 🐛 Common Installation Issues

### Port Already in Use
```bash
npm run dev -- --port 3001
```

### Clear Cache & Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Reinstall TypeScript
npm install -D typescript@latest
```

### Tailwind Not Working
```bash
# Rebuild Tailwind
npm run build

# Check tailwind.config.ts exists
```

## 🚀 Deploy

### Manual Deploy
```bash
npm run build
# Upload dist/ folder to your hosting
```

---

**Built with React + TypeScript + Tailwind CSS**
