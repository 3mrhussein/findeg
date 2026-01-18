/**
 * Presentation Layer: UI Adapter
 *
 * This adapter pattern allows us to swap UI component libraries easily.
 *
 * How it works:
 * 1. Define a common interface for UI components
 * 2. Create implementations for different libraries (shadcn, Material-UI, etc.)
 * 3. Use the adapter in components instead of direct library imports
 *
 * To switch libraries:
 * - Create a new adapter implementation
 * - Update the UI_CONFIG to use the new adapter
 * - All components will automatically use the new library
 */

import React from "react";

/**
 * Common interface for Button component
 * This is what all component libraries should implement
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  shape?: "default" | "circle";
}

export interface IUIAdapter {
  Button: React.ComponentType<ButtonProps>;
  // Add more component interfaces as needed
  // Input: React.ComponentType<InputProps>;
  // Card: React.ComponentType<CardProps>;
  // etc.
}

/**
 * Default/Custom UI Adapter
 * This uses the existing custom components
 */
import { Button as CustomButton } from "@/presentation/shared/ui/button";

export const CustomUIAdapter: IUIAdapter = {
  Button: CustomButton,
  // Add other components as you migrate them
};

/**
 * Example: Shadcn UI Adapter (commented out - uncomment when you want to use it)
 *
 * import { Button as ShadcnButton } from '@/components/ui/button';
 *
 * export const ShadcnUIAdapter: IUIAdapter = {
 *   Button: ShadcnButton,
 * };
 */

/**
 * UI Configuration
 * Change this to switch between different UI libraries
 */
export const UI_CONFIG = {
  adapter: CustomUIAdapter,
  // To switch to shadcn: adapter: ShadcnUIAdapter,
  // To switch to Material-UI: adapter: MaterialUIAdapter,
};

/**
 * Helper function to get UI components
 * Use this in your components instead of direct imports
 */
export function useUI() {
  return UI_CONFIG.adapter;
}
