// UI компонент Card

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white shadow-sm rounded-xl border border-gray-100 
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} 
        ${className}`}
    >
      {children}
    </div>
  );
}
