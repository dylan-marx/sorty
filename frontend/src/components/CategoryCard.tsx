import React, { useEffect } from 'react';
import '../style/CategoryCard.css'

interface CategoryCardProps {
  registerDropHandler: (id: string, handler: (event: any) => void) => void;
  hovered?: boolean;
  text?: string;
}

function CategoryCard({ registerDropHandler, hovered, text }: CategoryCardProps) {
  useEffect(() => {
    if (text) {
      const onDrop = (event: MouseEvent) => {
        console.log(`FOUND => ${text}`);
        // Add your drop logic here
      };
      
      registerDropHandler(text, onDrop);
    }
  }, [registerDropHandler, text]);

  return (
    <div className='category drop-target' data-category-text={text}>
      {text}
    </div>
  );
}

export default CategoryCard;
