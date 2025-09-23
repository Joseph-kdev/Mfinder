# Mfinder - Movie Recommendation Web App

Mfinder is a modern, responsive movie recommendation web app built with React and TypeScript. It leverages The Movie Database (TMDB) API to provide users with an intuitive way to explore, search, and discover movies.

## Live Preview
[Mfinder](https://mfinder.vercel.app/)

## Features

- **Movie Browsing**: Explore movies by genre with filtering capabilities.
- **Advanced Search**: Debounced search functionality to find movies by title or keywords with real-time results
- **Movie Details**: Comprehensive movie pages including trailers, cast information, ratings, runtime, and genres
- **Similar Movies**: "You may also like" recommendations based on TMDB's similarity algorithm
- **User Authentication**: Secure sign-in and sign-up powered by Clerk auth.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices using Tailwind CSS
- **Modern UI**: Polished user interface featuring smooth animations with Motion (formerly Framer Motion), complemented by Shadcn UI components for consistent, reusable design patterns and styling.

## Technologies

- **React** 
- **TypeScript**
- **TanStack/React Query**
- **React Router**
- **Tailwind CSS** 
- **Shadcn UI**
- **Motion(Framer motion)**
- **Clerk**
- **Vitest**
- **React Testing Library**
- **ESLint**
- **Github Actions**

## Wireframes
[View Figma Designs]([<figma-link>](https://www.figma.com/design/KiFWJ01dk7TOcAoHX1Vmvu/mfinder?node-id=0-1&t=f6EpBXCPEc4HxC00-1))

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, dialogs, etc.)
│   ├── MovieList.tsx   # Movie grid display component
│   ├── Search.tsx      # Search dialog component
│   └── ...
├── pages/              # Route-based page components
│   ├── Home.tsx        # Main browsing page
│   ├── MovieDetails.tsx # Individual movie detail page
│   └── ...
├── services/           # API service functions
│   └── movies.ts       # TMDB API integration
├── types.ts            # TypeScript type definitions
└── main.tsx            # App entry point with providers
```

## CI/CD Pipeline

Mfinder uses GitHub Actions for continuous integration and deployment with an automated pipeline that ensures code quality and seamless deployment.

### Pipeline Overview
- **Triggers**: Automatically runs on pushes to `development` and `production` branches
- **Jobs**:
  - **Build & Test**: Runs linting, unit tests, and builds the application
  - **Deploy**: Deploys to Vercel upon successful build and test completion

### Pipeline Steps
1. **Setup**: Node.js 20 environment with npm caching
2. **Dependencies**: Install project dependencies
3. **Linting**: Run ESLint for code quality checks
4. **Testing**: Execute unit tests with Vitest
5. **Build**: Create production build
6. **Deploy**: Automatic deployment to Vercel for development/production environments

## Installation

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn package manager
- TMDB API key (get one at [TMDB](https://www.themoviedb.org/settings/api))
- Clerk account for authentication

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mfinder.git
   cd mfinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_TMDB_KEY=your_tmdb_api_key_here
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the app running.