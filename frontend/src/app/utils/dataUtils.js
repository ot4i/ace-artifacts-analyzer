// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client"
export const createAppComponentsMapping = (data, policyProjects, sharedLibraries) => {
  const mapping = {};

  // Helper function to process category and apps
  const processCategory = (category, apps, subCategory = null) => {
    let categoryName = subCategory ? `${category}_${subCategory}` : category;

    // Extract the last part after the last '_', or keep as is
    categoryName = categoryName.includes('_') ? categoryName.split('_').pop() : categoryName;

    apps.forEach(app => {
      if (!mapping[app]) {
        mapping[app] = new Set();
      }
      mapping[app].add(categoryName);
    }); 
  };

  // Process all categories and their apps
  Object.entries(data).forEach(([category, value]) => {
    if (Array.isArray(value)) {
      processCategory(category, value);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subCategory, apps]) => {
        processCategory(category, apps, subCategory);
      });
    }
  });

  // Convert to array of objects for table display
  return Object.entries(mapping).map(([app, components]) => ({
    app,
    components: Array.from(components).join(', '),
    score: components.size,
    policyProjects: policyProjects[app]?.join(', ') || '',
    sharedLibraries: sharedLibraries[app]?.join(', ') || '',
    tag: ''
  }));
};