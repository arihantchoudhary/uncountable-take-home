import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export const InfoButton = ({ title, content, position = 'right' }) => {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Calculate the position of the tooltip relative to the button
  useEffect(() => {
    if (hovered && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      // Default positioning (right)
      let top = buttonRect.top;
      let left = buttonRect.right + 5; // 5px offset from button
      
      if (position === 'top') {
        top = buttonRect.top - 10; // Offset above button
        left = buttonRect.left;
      } else if (position === 'bottom') {
        top = buttonRect.bottom + 10; // Offset below button
        left = buttonRect.left;
      } else if (position === 'left') {
        top = buttonRect.top;
        left = buttonRect.left - 5; // 5px offset from button, to the left
      }
      
      setTooltipPosition({ top, left });
    }
  }, [hovered, position]);

  // Adjust tooltip position if it goes out of viewport
  useEffect(() => {
    if (hovered && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let { top, left } = tooltipPosition;
      
      // Check right edge
      if (tooltipRect.right > viewportWidth) {
        left = Math.max(0, viewportWidth - tooltipRect.width - 10);
      }
      
      // Check bottom edge
      if (tooltipRect.bottom > viewportHeight) {
        top = Math.max(0, viewportHeight - tooltipRect.height - 10);
      }
      
      if (top !== tooltipPosition.top || left !== tooltipPosition.left) {
        setTooltipPosition({ top, left });
      }
    }
  }, [hovered, tooltipPosition]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* The help circle icon/button that triggers the tooltip */}
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex items-center justify-center rounded-full w-5 h-5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors"
        aria-label="More information"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {/* If hovered, render the popup in a portal */}
      {hovered &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-50 p-2 max-w-xs text-sm bg-white border border-gray-200 rounded shadow-md"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            {title && <h3 className="font-semibold mb-1">{title}</h3>}
            <div className="text-gray-700">{content}</div>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default InfoButton;