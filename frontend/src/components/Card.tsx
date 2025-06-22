import React, { useState } from 'react';
import '../style/Card.css';

interface CardType {
    text: string,
}

function Card({text}: CardType) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = () => {
        setIsDragging(true);
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    return (
        <div className="Card scrollable" draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <p className='text'>{text}</p>
        </div>
    );
}

export default Card;