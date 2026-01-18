/**
 * Category Card Molecule (Server Component)
 */

import React from 'react';
import { CategoryEntity } from '@/application/repositories/ICategoryRepository';

interface CategoryCardProps {
    category: CategoryEntity;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
      {category.image && (
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-8 w-full">
        <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
        {category.description && (
          <p className="text-white/80 line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {category.description}
          </p>
        )}
      </div>
    </div>
  );
};
