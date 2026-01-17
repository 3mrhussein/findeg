# FindEg.com - Modern E-commerce Platform

FindEg.com is a modern, trendy e-commerce web application specializing in stationary, kids' toys, and school supplies. This project serves as a comprehensive brand kit and a fully functional storefront, built with a focus on great UI/UX, reusability, and cutting-edge web technologies.

## Key Features

- **Theming:** Supports both **Light** and **Dark** modes, with a centralized and easily configurable theme system.
- **Internationalization (i18n):** Full support for English (`en`) and Arabic (`ar`), including Right-to-Left (RTL) layout adjustments.
- **Atomic Design Structure:** Components are structured following atomic design principles (atoms, molecules, organisms) for maximum reusability and maintainability.
- **AI-Powered Image Generation:** Integrates the Gemini API to allow users to generate product ideas and visuals based on text prompts.
- **Comprehensive E-commerce Flow:**
    - **Dismissible Announcement Bar:** A promotional bar at the top of the site.
    - **Dynamic Mega Menu:** A creative, multi-level navigation menu.
    - **Full-Fledged Search:** Site-wide product search with a dedicated results page.
    - **Advanced Shop Page:** A full-featured shopping page with responsive, collapsible filters (modal on mobile), multiple sorting options, grid/list view toggles, client-side pagination, and an integrated FAQ section.
    - **Detailed Product Page:** Includes an image gallery, variant selection, scroll-spy navigation, and an interactive customer review system.
    - **"About Us" Page:** A dedicated page to share the company's story, mission, and a contact form.
    - **Shopping Cart:** A sleek, slide-out cart drawer.
    - **Multi-Step Checkout & Registration:** User-friendly forms for checkout and signing up.
- **User Privacy & Control:**
    - **Advanced Cookie Consent:** A detailed cookie consent banner with "Accept All", "Reject All", and "Settings" options.
    - **Cookie Settings Modal:** A modal allowing users to granularly control cookie categories.
    - **Footer Access:** Users can modify their cookie settings at any time from the site footer.
- **User Support:**
    - **Site-wide Chatbot:** A fixed-position chatbot icon that opens a chat window for user support on all pages.
- **Responsive Design:** Fully responsive layout that works seamlessly across desktops, tablets, and mobile devices.
- **Accessibility:** Designed with accessibility in mind, ensuring high contrast ratios and proper ARIA attributes.

---

## Brand Kit

The FindEg.com brand is designed to be modern, playful, and trustworthy.

### Colors

The color palette is built around a vibrant Teal primary color and a warm Amber secondary color, ensuring high contrast and accessibility (WCAG AA compliant).

| Role               | Light Mode                               | Dark Mode                                | Tailwind Variable         |
| ------------------ | ---------------------------------------- | ---------------------------------------- | ------------------------- |
| **Primary**        | `rgb(20 184 166)` (#14b8a6)              | `rgb(20 184 166)` (#14b8a6)              | `colors.primary`          |
| **Secondary**      | `rgb(245 158 11)` (#f59e0b)              | `rgb(251 191 36)` (#fbbf24)              | `colors.secondary`        |
| **Background**     | `rgb(255 255 255)` (#ffffff)             | `rgb(17 24 39)` (#111827)                | `colors.background`       |
| **Foreground**     | `rgb(17 24 39)` (#111827)                | `rgb(243 244 246)` (#f3f4f6)             | `colors.foreground`       |
| **Card Background**| `rgb(255 255 255)` (#ffffff)             | `rgb(31 41 55)` (#1f2937)                | `colors.card`             |
| **Muted Text**     | `rgb(107 114 128)` (#6b7280)             | `rgb(156 163 175)` (#9ca3af)             | `colors.muted-foreground` |

### Typography

- **Font Family:** `Poppins` (sans-serif)
- **Weights Used:** 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

### Logo

The logo combines a stylized pencil icon with custom, handwritten-style typography for the brand name, using the secondary color as an accent.

---

## Tech Stack

- **Frontend:** React
- **Styling:** Tailwind CSS with a custom theme configuration
- **AI Integration:** Google Gemini API (`@google/genai`) for image generation.
- **State Management:** React Context API for global state (Theme, Language, Cart).
- **Internationalization:** Custom i18n solution.

## Project Structure

The project follows a modular and scalable file structure:

```
/
├── components/           # Reusable UI components
│   ├── atoms/            # Basic building blocks (Icon, Price, Rating, etc.)
│   ├── molecules/        # Groups of atoms (ProductCard, FilterSidebar, etc.)
│   ├── organisms/        # Complex components (Header, Footer, ImageGenerator)
│   ├── layout/           # Layout helpers (Container, Grid)
│   └── ui/               # Unstyled, reusable UI primitives (shadcn/ui style)
├── constants.tsx         # Static data, mock products, navigation schema, icons
├── contexts/             # React Context providers (Theme, Language, Cart)
├── hooks/                # Custom React hooks (useTheme, useCart, etc.)
├── pages/                # Top-level page components (HomePage, AboutPage, etc.)
├── services/             # API service integrations (e.g., Gemini)
├── stories/              # Storybook component examples (optional)
├── theme.ts              # Theme configuration (colors, shadows, gradients)
├── types.ts              # TypeScript type definitions
├── i18n.ts               # Translation strings
├── App.tsx               # Main application component with routing
└── index.tsx             # Application entry point
```

---

## Development Guidelines

To ensure the codebase remains clean, scalable, and easy for multiple developers to work on, we follow a few key principles.

### 1. Container/UI Component Pattern

This pattern separates a component's logic from its presentation. Almost every component that involves state, context, or side effects is split into two components, often within the same file:

-   **Container/Logic Component (e.g., `ProductCard`):**
    -   This is the "smart" component.
    -   It handles all logic: state management (`useState`), data fetching, context (`useTranslation`, `useCart`), and event handlers.
    -   It does **not** render any complex JSX. Its only job is to gather data and functions and pass them as props to its corresponding UI component.
    -   This is the main component you import into other parts of the app.

-   **UI/Presentational Component (e.g., `ProductCardUI`):**
    -   This is the "dumb" component.
    -   It contains all the JSX and styling.
    -   It receives all its data and functions as props from its container.
    -   It should **never** contain hooks for state or context.
    -   This makes it highly reusable and easy to test visually (e.g., in Storybook).

### 2. Contribution Workflow

When adding a new feature or component, please follow these steps:

1.  **Define Types:** Add any new TypeScript types to `types.ts`.
2.  **Add Constants:** If the feature uses static data (e.g., mock reviews, navigation links), add it to `constants.tsx`.
3.  **Create Components:**
    -   Create your new component file(s) in the appropriate `components/` subdirectory (`atoms`, `molecules`, etc.).
    -   Follow the **Container/UI Pattern** described above if the component has any logic.
4.  **Add Translations:** Add all user-facing strings to `i18n.ts` for both English (`en`) and Arabic (`ar`).
5.  **Integrate:** Import and use your new component in the relevant page or organism.