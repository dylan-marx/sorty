import React, { CSSProperties, useCallback, useRef, useState } from 'react';
import '../style/Card.css';

interface CardType {
    text: string,
    onDragStart?: (event: MouseEvent) => void;
    onDragEnd?: (event: MouseEvent) => void;
    onDrop?: (dropTarget: Element, event: MouseEvent) => void;
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
    const prevDropTargetRef = useRef<Element | null>(null);
    const dragDataRef = useRef({
    startPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    hasMoved: false
    });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        
        const rect = cardRef.current.getBoundingClientRect();

        dragDataRef.current = {
        startPos: { x: e.clientX, y: e.clientY },
        offset: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        hasMoved: false
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const deltaX = e.clientX - dragDataRef.current.startPos.x;
        const deltaY = e.clientY - dragDataRef.current.startPos.y;

        if (!dragDataRef.current.hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        dragDataRef.current.hasMoved = true;
        setIsDragging(true);
        onDragStart?.(e);
        }

        if (dragDataRef.current.hasMoved) {
            const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
            const dropTarget = elementsBelow.find(el => el.classList.contains('drop-target'));

            if (prevDropTargetRef.current && prevDropTargetRef.current !== dropTarget) {
                prevDropTargetRef.current.classList.remove('hover');
            }

            if (dropTarget) {
                dropTarget.classList.add('hover');
                prevDropTargetRef.current = dropTarget;
            } else {
                prevDropTargetRef.current = null;
            }
            setPosition({
                x: e.clientX,
                y: e.clientY
            });
        }
    }, [onDragStart]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (dragDataRef.current.hasMoved) {
            // Check drop target
            const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
            const dropTarget = elementsBelow.find(el => el.classList.contains('drop-target'));
            
            if (dropTarget) {
                onDrop?.(dropTarget, e);
            }
            
            onDragEnd?.(e);
        }
        setIsDragging(false);
        setPosition({ x: 0, y: 0 });
        dragDataRef.current.hasMoved = false;
    }, [handleMouseMove, onDragEnd, onDrop]);

    const cardStyle: CSSProperties = {
    position: isDragging ? 'fixed' : 'relative',
    left: isDragging ? `${position.x}px` : 'auto',
    top: isDragging ? `${position.y}px` : 'auto',
    transform: isDragging ? 'translate(-50%, -50%)' : undefined
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