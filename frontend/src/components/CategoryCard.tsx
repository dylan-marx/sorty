import React, { useEffect, useRef } from 'react';
import '../style/CategoryCard.css'

interface CategoryCardProps {
  registerDropHandler: (id: string, handler: (event: any) => void) => void;
  text?: string;
  id?: string;
}

function CategoryCard({ registerDropHandler, text }: CategoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (text && cardRef.current) {
      const onDrop = (event: DragEvent) => {
        console.log(`FOUND => ${text}`);
        if (cardRef.current) {

          cardRef.current.classList.remove('hover-add');

        }
      };
      
      registerDropHandler(text, onDrop);
    }
  }, [registerDropHandler, text]);

  return (
    <div ref={cardRef} className='category drop-target' data-category-text={text}>
      {text}
    </div>
  );
}

export default CategoryCard;
