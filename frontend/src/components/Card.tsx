import React, { CSSProperties, useRef, useState } from 'react';
import '../style/Card.css';

interface CardType {
    text: string,
    onDragStart?: (event: MouseEvent | TouchEvent) => void;
    onDragEnd?: (event: MouseEvent | TouchEvent) => void;
    onDrop?: (dropTarget: Element, event: MouseEvent | TouchEvent) => void;
    className?: string;
}

interface Position {
  x: number;
  y: number;
}

function Card({text, onDragStart, onDragEnd, onDrop, className=''}: CardType) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setDragOffset({ x: offsetX, y: offsetY });
        dragStartPos.current = { x: e.clientX, y: e.clientY };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
        const X = e.clientX - dragStartPos.current.x;
        const Y = e.clientY - dragStartPos.current.y;

        if (!isDragging && (Math.abs(X) > 10 || Math.abs(Y) > 10)) {
            setIsDragging(true);
            onDragStart?.(e);
        }

        if (isDragging || Math.abs(X) > 10 || Math.abs(Y) > 10) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (isDragging) {
        // check drop target
        const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
        const dropTarget = elementsBelow.find(el => el.classList.contains('drop-target'));
        
        if (dropTarget) {
            onDrop?.(dropTarget, e);
        }
        
        onDragEnd?.(e);
        }

        setIsDragging(false);
        setPosition({ x: 0, y: 0 });
    };

    const cardStyle: CSSProperties = {
        position: isDragging ? 'fixed' : 'relative',
        left: isDragging ? `${position.x}px` : 'auto',
        top: isDragging ? `${position.y}px` : 'auto',
        zIndex: isDragging ? 1000 : 'auto',
        pointerEvents: isDragging ? 'none' : 'auto',
    };

    return (
        <div
        ref={cardRef}
        className={`Card ${isDragging ? 'dragging' : ''} ${className}`}
        style={cardStyle}
        onMouseDown={handleMouseDown}
        >
            {
            isDragging ? 
                <div className="text">...</div> 
                :
                <div className="text">{text}</div>
            }
        </div>
    );
}

export default Card;