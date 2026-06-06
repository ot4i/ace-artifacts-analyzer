// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client";
import React from "react";
import { useRouter } from "next/navigation"; // App Router navigation

// Define group categories
const groups = {
  Transport: ["MQ", "Http", "TCPIP", "File", "Email", "SOAP", "REST"],
  Aggregate: ["Aggregation", "Group"],
  Database: ["JDBC", "Database_ODBC"],
  SSL: ["SSL"],
};

export const Sidebar = ({
  mainCategories,
  openCategories,
  selectedCheckboxes,
  selectedGroup,
  showLemTables,
  showTagGroups,
  operationType,
  data,
  onCheckboxChange,
  onGroupSelection,
  onTagGroupSelection,
  onLemTablesToggle,
  onCategoryChange,
  onClearSelection,
  onOperationTypeChange
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); 
  };

  const getCategoryCount = (category, subCategory = null) => {
    if (!data[category]) return 0;
  
    if (subCategory) {
      if (data[category][subCategory]) {
        return Array.isArray(data[category][subCategory]) ? data[category][subCategory].length : 0;
      }
      return 0;
    }

    if (Array.isArray(data[category])) {
      return data[category].length;
    }

    if (typeof data[category] === 'object') {
      return Object.values(data[category]).reduce((sum, apps) =>
        sum + (Array.isArray(apps) ? apps.length : 0), 0
      );
    }

    return 0;
  };

  return (
    <div className="sidebar">
      {/* Back Button */}
      <button onClick={handleBack} className="back-button">
        ← Back
      </button>

      <div className="group-section">
        <h3 className="section-title">Group by</h3>
        {Object.keys(groups).map((group) => (
          <button
            key={group}
            className={`group-button ${selectedGroup === group ? 'active' : ''}`}
            onClick={() => onGroupSelection(group)}
          >
            {group}
          </button>
        ))}
        <button
          className={`group-button ${showLemTables ? 'active' : ''}`}
          onClick={onLemTablesToggle}
        >
          Java Based Resources
        </button>
        <button
          className={`group-button ${showTagGroups ? 'active' : ''}`}
          onClick={onTagGroupSelection}
        >
          Application Tags
        </button>
      </div>

      <div className="categories-section">
        <div className="categories-header">
          <h3 className="section-title">Categories</h3>
          <div className="operation-controls">
            <div className="operation-toggle">
              <button
                onClick={() => onOperationTypeChange('AND')}
                className={`toggle-button ${operationType === 'AND' ? 'active' : ''}`}
              >
                Match All
              </button>
              <button
                onClick={() => onOperationTypeChange('OR')}
                className={`toggle-button ${operationType === 'OR' ? 'active' : ''}`}
              >
                Match Any
              </button>
            </div>
            {selectedCheckboxes.length > 0 && (
              <button
                onClick={onClearSelection}
                className="clear-button"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {mainCategories.map((category) => (
          <div key={category} className="category-item">
            <div
              onClick={() => onCategoryChange(category)}
              className={`category-header ${selectedCheckboxes.some(item => item.category === category) ? 'active' : ''}`}
            >
              <span>{openCategories[category] ? '▼' : '▶'}</span>
              <strong>{category} ({getCategoryCount(category)})</strong>
            </div>
            {openCategories[category] && (
              <div className="subcategory-list">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={(e) => onCheckboxChange(e.target.checked, category)}
                    checked={selectedCheckboxes.some(item =>
                      item.category === category && !item.subCategory
                    )}
                  />
                  {category} ({getCategoryCount(category)})
                </label>
              </div>
            )}
          </div>
        ))}

        {Object.keys(data).map((category) => {
          if (mainCategories.includes(category)) return null;

          if (typeof data[category] === 'object' && !Array.isArray(data[category])) {
            return (
              <div key={category} className="category-item">
                <div
                  onClick={() => onCategoryChange(category)}
                  className={`category-header ${selectedCheckboxes.some(item => item.category === category) ? 'active' : ''}`}
                >
                  <span>{openCategories[category] ? '▼' : '▶'}</span>
                  <strong>{category} ({getCategoryCount(category)})</strong>
                </div>
                {openCategories[category] && (
                  <div className="subcategory-list">
                    {Object.keys(data[category]).map((subCategory) => (
                      <div key={subCategory} className="subcategory-item">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            onChange={(e) => onCheckboxChange(e.target.checked, category, subCategory)}
                            checked={selectedCheckboxes.some(item =>
                              item.category === category && item.subCategory === subCategory
                            )}
                          />
                          {subCategory} ({getCategoryCount(category, subCategory)})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
