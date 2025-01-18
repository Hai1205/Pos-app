import React from 'react';
import { MenuItem } from './MenuItem';

export function MenuList({ 
  items, 
  onAddToCart, 
  onShowDetails, 
  topProducts = [] 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-4">
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
          onShowDetails={onShowDetails}
          isTopProduct={topProducts.some(topItem => topItem.product__id === item.id)}
        />
      ))}
    </div>
  );
}