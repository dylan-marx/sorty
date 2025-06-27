import React, { CSSProperties, useCallback, useRef, useState } from 'react';
import '../style/Card.css';

interface CardType {
    text: string,
    onDragStart?: (event: MouseEvent) => void;
    onDragEnd?: (event: MouseEvent) => void;
    onDrop?: (dropTarget: Element, event: MouseEvent) => void;
    className?: string;
    columnName?: string;
    id?: string;
}

interface Position {
  x: number;
  y: number;
}

function Card({text, onDragStart, onDragEnd, onDrop, className='', id, columnName}: CardType) {
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

    // TODO make this more robust
    const parseTextToReadable = (rawText: string): string => {
        if (Array.isArray(rawText)) {
            return rawText.map((item: string, index: number) => {
                const cleanText = item
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1')
                    .replace(/`(.*?)`/g, '$1')
                    .replace(/^\s*#+\s*/gm, '')
                    .replace(/^\s*-\s*/gm, '• ')
                    .replace(/^\s*\*\s*/gm, '• ')
                    .replace(/^\s*\d+\.\s*/gm, (match) => match)
                    .trim();
                
                return `--- Response ${index + 1} ---\n${cleanText}`;
            }).join('\n\n' + '─'.repeat(40) + '\n\n');
        }

        if (typeof rawText === 'string') {

            if (rawText.trim().startsWith('[')) {
                try {
                    let jsonString = rawText;

                    let textArray;
                    try {
                        textArray = JSON.parse(jsonString);
                    } catch (e) {
                        const matches = jsonString.match(/"((?:[^"\\]|\\.)*)"/g);
                        if (matches) {
                            textArray = matches.map(match => 
                                match.slice(1, -1) // Remove quotes
                                    .replace(/\\"/g, '"')
                                    .replace(/\\n/g, '\n')
                                    .replace(/\\t/g, '\t')
                                    .replace(/\\\\/g, '\\')
                            );
                        } else {
                            throw new Error('Could not extract array elements');
                        }
                    }
                    return textArray.map((item: string, index: number) => {
                        const cleanText = item
                            .replace(/\*\*(.*?)\*\*/g, '$1')
                            .replace(/\*(.*?)\*/g, '$1')
                            .replace(/`(.*?)`/g, '$1') 
                            .replace(/^\s*#+\s*/gm, '')
                            .replace(/^\s*-\s*/gm, '• ')
                            .replace(/^\s*\*\s*/gm, '• ')
                            .trim();
                        
                        return `--- Response ${index + 1} ---\n${cleanText}`;
                    }).join('\n\n' + '─'.repeat(40) + '\n\n');
                    
                } catch (error) {
                    console.warn('JSON parsing failed, treating as plain text');
                }
            }

            return rawText
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/`(.*?)`/g, '$1')
                .replace(/^\s*#+\s*/gm, '')
                .replace(/^\s*-\s*/gm, '• ')
                .replace(/^\s*\*\s*/gm, '• ')
                .trim();
        }

        return String(rawText);
    };

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
                prevDropTargetRef.current.classList.remove('hover-add');
            }

            if (dropTarget) {
                dropTarget.classList.add('hover-add');
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

    // Parse the text for display
    const displayText = parseTextToReadable(text);

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
                <div>
                    <div className="card-header">
                        <span className="card-id">#{id}</span>
                        <span className="card-column">{columnName}</span>
                    </div>
                    <div className="text" style={{ whiteSpace: 'pre-line' }}>
                        {displayText}
                    </div>
                </div>
            }
        </div>
    );
}

export default Card;