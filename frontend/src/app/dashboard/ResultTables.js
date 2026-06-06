// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client";
import React, { useState } from 'react';
import { TableWrapper } from './TableWrapper';

export const ResultTables = ({
  selectedCheckboxes,
  operationType,
  getCommonApps,
  data,
  formatAppDisplay,
  hoveredTable,
  setHoveredTable,
  expandedTable,
  setExpandedTable,
  policyProjects,
  sharedLibraries
}) => {
  const [splitView, setSplitView] = useState(true);
  const [scoreThreshold, setScoreThreshold] = useState(150); // 👈 NEW STATE

  const getPolicyNames = (app) => policyProjects?.[app]?.length ? policyProjects[app] : null;
  const getLibraryNames = (app) => sharedLibraries?.[app]?.length ? sharedLibraries[app] : null;

  const createAppComponents = (data) => {
    const mapping = {};
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const keyParts = key.split('_');
        const component = keyParts[keyParts.length - 1];
        value.forEach(app => {
          if (!mapping[app]) mapping[app] = new Set();
          mapping[app].add(component);
        });
      }
    });
    return mapping;
  };

  const appComponentsMap = createAppComponents(data);

  const getAppScore = (app) => {
    const components = appComponentsMap[app];
    const policies = getPolicyNames(app) || [];
    const libraries = getLibraryNames(app) || [];

    let compCount = 0;
    const uniqueComps = new Set();
    if (components) {
      compCount += components.size;
      components.forEach(c => uniqueComps.add(c));
    }

    const genScore = uniqueComps.size + compCount;
    const shlibScore = libraries.length * 5;
    return genScore + shlibScore;
  };

  const renderAppsTable = (title, apps) => {
    if (!apps || apps.length === 0) {
      return (
        <TableWrapper key={title} id={title} title={title} hoveredTable={hoveredTable} setHoveredTable={setHoveredTable}>
          <div className="empty-section">No applications found</div>
        </TableWrapper>
      );
    }

    if (!splitView) {
      const comps = new Set();
      const policies = new Set();
      const libraries = new Set();
      let compTotal = 0;
      let shlibTotal = 0;

      apps.forEach(app => {
        const compsSet = appComponentsMap[app];
        if (compsSet) {
          compTotal += compsSet.size;
          compsSet.forEach(c => comps.add(c));
        }
        getPolicyNames(app)?.forEach(p => policies.add(p));
        getLibraryNames(app)?.forEach(l => {
          libraries.add(l);
          shlibTotal++;
        });
      });

      const n = apps.length;
      const uniqueScore = comps.size;
      const maxScore = n * uniqueScore;
      const genScore = maxScore + compTotal;
      const shScore = shlibTotal * 5;
      const final = genScore + shScore;
      const sizeTag = final <= 50 ? 'S' : final <= 100 ? 'M' : 'L';

      return (
        <TableWrapper
          key={`${title}-full`}
          id={`${title}-full`}
          title={title}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
        >
          <table className="lem-table">
            <thead>
              <tr>
                <th>{title} (Footprint: {final}) ({sizeTag})</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app, index) => (
                <tr key={`${app}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
                  <td>{formatAppDisplay(app)}</td>
                </tr>
              ))}
              {[...policies].map((policy, i) => (
                <tr key={`policy-${i}`}>
                  <td><strong>Policy:</strong> {policy}</td>
                </tr>
              ))}
              {[...libraries].map((lib, i) => (
                <tr key={`library-${i}`}>
                  <td><strong>Library:</strong> {lib}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      );
    }

    const appChunks = [];
    let chunk = [];
    let chunkScore = 0;

    apps.forEach((app) => {
      const appScore = getAppScore(app);
      if (chunkScore + appScore > scoreThreshold && chunk.length > 0) { // 👈 USING scoreThreshold
        appChunks.push(chunk);
        chunk = [];
        chunkScore = 0;
      }
      chunk.push(app);
      chunkScore += appScore;
    });
    if (chunk.length > 0) appChunks.push(chunk);

    return appChunks.map((chunk, idx) => {
      const comps = new Set();
      const policies = new Set();
      const libraries = new Set();
      let compTotal = 0;
      let shlibTotal = 0;

      chunk.forEach(app => {
        const compsSet = appComponentsMap[app];
        if (compsSet) {
          compTotal += compsSet.size;
          compsSet.forEach(c => comps.add(c));
        }
        getPolicyNames(app)?.forEach(p => policies.add(p));
        getLibraryNames(app)?.forEach(l => {
          libraries.add(l);
          shlibTotal++;
        });
      });

      const n = chunk.length;
      const uniqueScore = comps.size;
      const maxScore = n * uniqueScore;
      const genScore = maxScore + compTotal;
      const shScore = shlibTotal * 5;
      const final = genScore + shScore;
      const sizeTag = final <= 50 ? 'S' : final <= 100 ? 'M' : 'L';

      return (
        <TableWrapper
          key={`${title}-chunk-${idx + 1}`}
          id={`${title}-chunk-${idx + 1}`}
          title={title}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
        >
          <table className="lem-table">
            <thead>
              <tr>
                <th>{title} (Footprint: {final}) ({sizeTag})</th>
              </tr>
            </thead>
            <tbody>
              {chunk.map((app, index) => (
                <tr key={`${app}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
                  <td>{formatAppDisplay(app)}</td>
                </tr>
              ))}
              {[...policies].map((policy, i) => (
                <tr key={`policy-${i}`}>
                  <td><strong>Policy:</strong> {policy}</td>
                </tr>
              ))}
              {[...libraries].map((lib, i) => (
                <tr key={`library-${i}`}>
                  <td><strong>Library:</strong> {lib}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      );
    });
  };

  return (
    <div className="results-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Selected Categories Results</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={splitView}
              onChange={() => setSplitView(prev => !prev)}
            />
            Modularization
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Threshold:
            <input
              type="number"
              min={10}
              max={500}
              value={scoreThreshold}
              onChange={(e) => setScoreThreshold(Number(e.target.value))}
              style={{ width: '60px' }}
              disabled={!splitView}
            />
          </label>
        </div>
      </div>

      <div className="selected-categories">
        <strong className="categories-label">Selected Categories:</strong>
        <ul className="categories-list">
          {selectedCheckboxes.map(({ category, subCategory }, index) => (
            <li key={index}>{category}{subCategory ? ` - ${subCategory}` : ''}</li>
          ))}
        </ul>
      </div>

      <div className="table-grid">
        {operationType === 'OR' ? (
          selectedCheckboxes.length > 0 ? (
            selectedCheckboxes.map(({ category, subCategory }) => {
              const apps = subCategory ? data[category]?.[subCategory] : data[category];
              const title = subCategory ? `${category} - ${subCategory}` : category;
              return renderAppsTable(title, apps);
            })
          ) : (
            <div className="empty-section">No categories selected</div>
          )
        ) : (
          (() => {
            const apps = getCommonApps?.() || [];
            return renderAppsTable("Applications", apps);
          })()
        )}
      </div>
    </div>
  );
};
