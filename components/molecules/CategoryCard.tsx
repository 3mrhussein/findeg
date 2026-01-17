import React from 'react';
import type { Category } from '../../types';
import { useTranslation } from '../../hooks';

interface CategoryCardUIProps {
  category: Category;
  name: string;
  description: string;
}

export const CategoryCardUI: React.FC<CategoryCardUIProps> = ({ category, name, description }) => {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
      <img src={category.imageUrl} alt={category.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
        <p className="text-white/90">{description}</p>
      </div>
    </div>
  );
};

// FIX: Add container component to handle logic and provide props to UI component.
interface CategoryCardProps {
    category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    const { t } = useTranslation();
    
    // Construct translation keys dynamically. Note: This assumes a consistent naming convention.
    const nameKey = `category_${category.name.toLowerCase().replace(/\s/g, '_')}_title`;
    const descKey = `category_${category.name.toLowerCase().replace(/\s/g, '_')}_desc`;
    
    // Use translated strings, with fallback to the original category data.
    const name = t(nameKey as any) || category.name;
    const description = t(descKey as any) || category.description;

    return <CategoryCardUI category={category} name={name} description={description} />;
};
