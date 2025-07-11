import React, { useEffect, useRef } from 'react';
import '../style/CategoryCard.css'

interface CategoryCardProps {
  registerDropHandler: (id: string, handler: (event: any) => void) => void;
  text?: string;
  id?: string;
  columnName?: string;
  currentCellData?: {
    id: string;
    row_number: number;
    column_name: string;
    cell_value: string;
  };
}

function CategoryCard({ 
  registerDropHandler, 
  id, 
  columnName, 
  text, 
  currentCellData 
}: CategoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const sendClassification = async (category: string) => {
    try {
      const classificationData = {
        id: currentCellData?.id || id,
        row_number: currentCellData?.row_number,
        column_name: currentCellData?.column_name || columnName,
        category: category
      };

      console.log('Sending classification:', classificationData);

      const response = await fetch('http://localhost:5000/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classificationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Classification result:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending classification:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (text && cardRef.current) {
      const onDrop = async (event: DragEvent) => {
        event.preventDefault();
        
        console.log(`Dropped on category: ${text}`);
        
        if (cardRef.current) {
          cardRef.current.classList.remove('hover-add');
        }

        try {
          await sendClassification(text);
          console.log(`Successfully classified as: ${text}`);

        } catch (error) {
          console.error('Failed to send classification:', error);
        }
      };

      const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        if (cardRef.current) {
          cardRef.current.classList.add('hover-add');
        }
      };

      const onDragLeave = (event: DragEvent) => {
        if (cardRef.current) {
          cardRef.current.classList.remove('hover-add');
        }
      };


      registerDropHandler(text, onDrop);

      // Add event listeners for visual feedback
      const cardElement = cardRef.current;
      cardElement.addEventListener('dragover', onDragOver);
      cardElement.addEventListener('dragleave', onDragLeave);
      cardElement.addEventListener('drop', onDrop);

      return () => {
        if (cardElement) {
          cardElement.removeEventListener('dragover', onDragOver);
          cardElement.removeEventListener('dragleave', onDragLeave);
          cardElement.removeEventListener('drop', onDrop);
        }
      };
    }
  }, [registerDropHandler, text, id, columnName, currentCellData]);

  return (
    <div 
      ref={cardRef} 
      className='category drop-target' 
      data-category-text={text}
    >
      {text}
    </div>
  );
}

export default CategoryCard;