import React, { CSSProperties, useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const prevDropTargetRef = useRef<Element | null>(null);
    const dragDataRef = useRef({
        startPos: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        hasMoved: false
    });

    const parseTextToReadable = (rawText: string): string => {
        let processedText = rawText.replace(/\\n/g, '\n');

        processedText = processedText
            .replace(/^\[\s*"/, '')  
            .replace(/"\s*\]$/, '');
        if (Array.isArray(rawText)) {
            return rawText.map(entry => 
                typeof entry === 'string' ? entry.replace(/^"|"$/g, '') : String(entry)
            ).join('\n\n---------------------------------\n\n');
        }

        let isJsonArray = false;
        if (processedText.trim().startsWith('[') || /^".*",\s*".*"$/.test(processedText)) {
            try {
                const parsed = JSON.parse(`[${processedText}]`);
                if (Array.isArray(parsed)) {
                    isJsonArray = true;
                    return parsed.map(entry => 
                        typeof entry === 'string' ? entry : JSON.stringify(entry)
                    ).join('\n\n---------------------------------\n\n');
                }
            } catch (e) {
                // TODO handle json failing
            }
        }
 
        if (!isJsonArray && processedText.includes('", ')) {
            return processedText.split('", ')
                .map(entry => {

                    let cleanEntry = entry.trim();
                    cleanEntry = cleanEntry.replace(/^"+|"+$/g, ''); 
                    cleanEntry = cleanEntry.replace(/^,+|,+$/g, '');
                    return cleanEntry;
                })
                .filter(entry => entry.length > 0)
                .join('\n\n---------------------------------\n\n');
        }

        return processedText
            .replace(/^"+|"+$/g, '')
            .replace(/^,+|,+$/g, '')
            .replace(/\n{3,}/g, '\n\n'); 
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

    const displayText = parseTextToReadable(text);

    return (
        <div
            ref={cardRef}
            className={`Card ${isDragging ? 'dragging' : ''} ${className}`}
            style={cardStyle}
            onMouseDown={handleMouseDown}
        >
            {isDragging ? (
                <div className="text">...</div>
            ) : (
                <div>
                    <div className="card-header">
                        <span className="card-id">#{id}</span>
                        <span className="card-column">{columnName}</span>
                    </div>
                    <div className="card-markdown">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {displayText}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Card;