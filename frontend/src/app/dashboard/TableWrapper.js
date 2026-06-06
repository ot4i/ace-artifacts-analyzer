// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client";
import React, { useEffect, useRef, useState } from 'react';

export const TableWrapper = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tableRef = useRef(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const tbody = tableRef.current?.querySelector('tbody');
      setShowArrow(tbody && tbody.scrollHeight > 168);
    };

    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    if (tableRef.current) observer.observe(tableRef.current);

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div 
      className={`table-wrapper ${isExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={`table-container ${isExpanded ? 'expanded' : ''}`}>
        <div ref={tableRef}>
          {children}
        </div>
        {showArrow && (
          <div className="scroll-indicator">
            <span className={`indicator-arrow ${isExpanded ? 'up' : 'down'}`}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
