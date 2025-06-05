"use client";

import {
  FcIdea,
  FcMindMap,         // NEW icon for Intermediate Level
  FcConferenceCall
} from "react-icons/fc";

import { IconType } from 'react-icons'
import { Category } from "@prisma/client"
import { CategoryItem } from './CategoryItem';

interface CategoriesProps {
  items: Category[]
}

// Updated icon map with a new icon for Intermediate Level
const iconMap: Record<Category["name"], IconType> = {
  "Beginner Level": FcIdea,
  "Intermediate Level": FcMindMap, // 🔁 Replaced FcComboChart with FcMindMap
  "Advanced Level": FcConferenceCall,
};

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => {
        const Icon = iconMap[item.name.trim().replace(/\s+/g, ' ')];
        return (
          <CategoryItem
            key={item.id}
            label={item.name}
            icon={Icon}
            value={item.id}
          />
        );
      })}
    </div>
  );
}
