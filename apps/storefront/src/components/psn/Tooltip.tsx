'use client'

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  content,
  children,
  delay = 200,
  position = 'top'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    if (isTouchDevice) {
      setIsVisible(!isVisible);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      case 'top':
      default:
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180';
      case 'left':
        return 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-90';
      case 'right':
        return 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 -rotate-90';
      case 'top':
      default:
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={!isTouchDevice ? showTooltip : undefined}
      onMouseLeave={!isTouchDevice ? hideTooltip : undefined}
      onClick={isTouchDevice ? handleClick : undefined}
    >
      {children}

      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getPositionClasses()} animate-fade-in`}
          role="tooltip"
        >
          <div className="relative">
            <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-lg border border-gray-700">
              {content}
            </div>
            <div className={`absolute w-2 h-2 bg-gray-800 border-gray-700 ${getArrowClasses()}`}
              style={{
                borderLeft: position === 'right' ? '1px solid rgb(55, 65, 81)' : 'none',
                borderTop: position === 'bottom' ? '1px solid rgb(55, 65, 81)' : 'none',
                borderRight: position === 'left' ? '1px solid rgb(55, 65, 81)' : 'none',
                borderBottom: position === 'top' ? '1px solid rgb(55, 65, 81)' : 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
