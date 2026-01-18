import HomePage from '@/presentation/components/server/templates/HomePage';

/**
 * Shop Root Page
 * 
 * This file serves as the entry point for the shop's home page route (/).
 * 
 * Architecture Note:
 * In this project, we separate the Next.js Route definition (this file) from the
 * UI implementation (the Template). This pattern allows us to:
 * 1. Keep route files clean and focused on Next.js specific configuration (metadata, params).
 * 2. Reuse the UI logic (Template) in other contexts if needed (e.g., Storybook, tests).
 * 3. Clearly distinguish between "Routing" concerns and "Rendering" concerns.
 * 
 * The `HomePage` template handles the actual layout and data fetching for the home screen.
 */
export default function Page() {
  return <HomePage />;
}
