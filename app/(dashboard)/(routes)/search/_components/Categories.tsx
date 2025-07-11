"use client";

import {
  FcIdea,
  FcMindMap,
  FcWorkflow,
  FcSurvey,
  FcVoicePresentation
} from "react-icons/fc";

import { IconType } from 'react-icons';
import { Category } from "@prisma/client";
import { CategoryItem } from './CategoryItem';

interface CategoriesProps {
  items: Category[]
}

// Custom icons for each module name
const iconMap: Record<string, IconType> = {
  "Modules 1": FcIdea,                  // Intro/Creative thinking
  "Modules 2": FcMindMap,               // Intermediate/Structuring
  "Modules 3": FcWorkflow,              // Process/Advanced topics
  "Modules 4": FcSurvey,                // Evaluation/Reflection
  "Modules 5": FcVoicePresentation      // Final/Presentation skills
};

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
      {items.map((item) => {
        const normalizedName = item.name.trim().replace(/\s+/g, ' ');
        const Icon = iconMap[normalizedName];

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
};
