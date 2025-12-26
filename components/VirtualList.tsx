
import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

/**
 * High-Performance UI Virtualizer
 * Replaces standard mapping for large collections (10k+ items).
 */
export function VirtualList<T>({ 
  items, 
  itemHeight, 
  renderItem, 
  containerHeight, 
  overscan = 5,
  className = "" 
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length, 
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: itemHeight,
        transform: `translateY(${(startIndex + index) * itemHeight}px)`,
      }
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  return (
    <div 
      ref={containerRef}
      onScroll={onScroll}
      className={`overflow-y-auto custom-scrollbar ${className}`}
      style={{ height: containerHeight, position: 'relative' }}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
