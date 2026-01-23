# Platform Tools Creation

A powerful visual editor for creating and managing web components with drag-and-drop functionality. Built with Next.js, React, and TypeScript.

## 🚀 Features

- **Visual Component Editor**: Drag-and-drop interface for building web components
- **Live Preview**: Real-time preview of your creations
- **Component Library**: Pre-built components for rapid development
- **HTML Generation**: Convert designs to production-ready HTML
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Theme Support**: Light/dark mode with custom theming
- **TypeScript**: Full type safety and excellent developer experience

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.17 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Git**: Version control system

### Checking Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check git version
git --version
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/LuuNguyen0811/hipvan_canvas_drag.git
cd hipvan_canvas_drag
```

### 2. Install Dependencies

Choose your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm (recommended)
pnpm install
```

### 3. Start Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── editor/            # Editor pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── editor/           # Editor-specific components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── theme-provider.tsx # Theme provider
├── lib/                   # Utility libraries
│   ├── converter/        # HTML/component conversion logic
│   ├── generator/        # Component generation
│   ├── store/           # Zustand state management
│   └── types/           # TypeScript type definitions
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory for environment variables:

```env
# Add your environment variables here
# NEXT_PUBLIC_API_URL=https://api.example.com
```

### Tailwind CSS

The project uses Tailwind CSS v4 with custom configuration. Styles are defined in `app/globals.css`.

### shadcn/ui Components

UI components are configured in `components.json`. To add new components:

```bash
npx shadcn@latest add [component-name]
```

## 🚀 Deployment

### Vercel (Recommended)

This project is pre-configured for Vercel deployment:

#### Option 1: Automatic Deployment
1. Push to `main` branch
2. Vercel automatically deploys via GitHub integration

#### Option 2: Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Other Platforms

The project can be deployed to any platform supporting Next.js:

- **Netlify**: Connect your GitHub repository
- **Railway**: Use the Next.js template
- **Docker**: Build and deploy using Docker

## 🧪 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

### Component Development

1. Create components in the appropriate directory
2. Use TypeScript interfaces for props
3. Implement responsive design
4. Add proper accessibility attributes

### State Management

- Use Zustand for global state
- Keep component state local when possible
- Implement proper state synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

**Build fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**TypeScript errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

### Getting Help

- Check existing issues on GitHub
- Review the deployment logs
- Ensure all dependencies are installed correctly

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs)
