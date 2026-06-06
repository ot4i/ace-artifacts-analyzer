// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client"
import React from 'react';

export const TagGroupView = ({ tagGroups, fileType }) => {
  const formatTagAppDisplay = (appObj) => {
    if (!appObj) return '';

    const appName = typeof appObj === 'string' ? appObj : appObj.app;
    if (!appName) return '';

    const [file, appDisplayName] = appName.split('|').map(s => s.trim());

    let extension = '';
    if (fileType?.toLowerCase() === 'barfolder') {
      extension = '.bar';
    }

    return `${appDisplayName} (${file}${extension})`;
  };

  const TableWrapper = ({ children }) => (
    <div
      style={{
        flex: "0 0 32%",
        marginBottom: "1.5rem",
        marginRight: "1%",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      {children}
    </div>
  );

  const normalizeToArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.includes(',') ? val.split(',').map(v => v.trim()) : [val.trim()];
    }
    return [];
  };

  const normalizePolicyProjects = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.includes(',') ? val.split(',').map(v => v.trim()) : [val.trim()];
    }
    return [];
  };

  const calculateTagGroupScore = (apps) => {
    const uniqueComponents = new Set();
    const uniqueLibraries = new Set();
    const uniquePolicyProjects = new Set();
    let totalComponentCount = 0;

    apps.forEach(appObj => {
      let components = [];
      let sharedLibs = [];
      let policyProjects = [];

      if (typeof appObj === 'string') {
        const parts = appObj.split(' | ');
        parts.forEach(part => {
          if (part.startsWith('Components: ')) {
            const cleanStr = part.replace('Components: ', '').replace(/[\[\]]/g, '').trim();
            if (cleanStr) {
              components = cleanStr.split(',').map(c => c.trim()).filter(Boolean);
            }
          } else if (part.startsWith('Shared lib: ')) {
            const libStr = part.replace('Shared lib: ', '').trim();
            if (libStr) {
              sharedLibs = libStr.split(',').map(lib => lib.trim()).filter(lib => lib && lib.toLowerCase() !== 'null');
            }
          } else if (part.startsWith('Policy Project: ')) {
            const projStr = part.replace('Policy Project: ', '').trim();
            if (projStr) {
              policyProjects = projStr.split(',').map(p => p.trim()).filter(p => p && p.toLowerCase() !== 'null');
            }
          }
        });
      } else if (typeof appObj === 'object') {
        components = appObj.components || [];
        sharedLibs = normalizeToArray(appObj.sharedLibraries)
          .map(lib => lib.trim())
          .filter(lib => lib && lib.toLowerCase() !== 'null');
        policyProjects = normalizePolicyProjects(appObj.policyProjects)
          .map(p => p.trim())
          .filter(p => p && p.toLowerCase() !== 'null');
      }

      components.forEach(c => {
        if (c) {
          uniqueComponents.add(c);
          totalComponentCount++;
        }
      });

      sharedLibs.forEach(lib => uniqueLibraries.add(lib));
      policyProjects.forEach(p => uniquePolicyProjects.add(p));
    });

    const numApps = apps.length;
    const uniqueScore = uniqueComponents.size;
    const maxScore = numApps * uniqueScore;
    const generalizedScore = maxScore + totalComponentCount;
    const shlibScore = uniqueLibraries.size * 5;
    const policyScore = uniquePolicyProjects.size * 3;
    const finalScore = generalizedScore + shlibScore + policyScore;

    return {
      finalScore,
      uniqueComponents: [...uniqueComponents],
      uniqueLibraries: [...uniqueLibraries],
      uniquePolicyProjects: [...uniquePolicyProjects],
      totalApps: numApps,
      totalComponentCount
    };
  };

  const sortedTags = Object.entries(tagGroups).map(([tag, apps]) => {
    const score = calculateTagGroupScore(apps);
    return [tag, apps, score];
  }).sort((a, b) => b[2].finalScore - a[2].finalScore);

  if (sortedTags.length === 0) {
    return (
      <div style={{
        padding: "2rem",
        textAlign: "left",
        color: "#4a5568",
        fontSize: "1.125rem",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        marginTop: "2rem",
        width: "100%"
      }}>
        No tag groups found. Please add tags to applications and save them.
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", textAlign: "left" }}>
      <h2 style={{
        color: "#2d3748",
        marginBottom: "1.5rem",
        fontSize: "1.5rem",
        fontWeight: "600"
      }}>
        Application Tags
      </h2>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start"
      }}>
        {sortedTags.map(([tag, apps, scoreData]) => {
          return (
            <TableWrapper key={tag}>
              <table style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0",
                minHeight: "200px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{
                      padding: "16px",
                      fontSize: "1.125rem",
                      textAlign: "center",
                      color: "#2d3748",
                      borderBottom: "2px solid #e2e8f0"
                    }}>
                      {tag} (Footprint: {scoreData.finalScore}){' '}
  ({scoreData.finalScore <= 50 ? 'S' : scoreData.finalScore <= 100 ? 'M' : 'L'})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app, index) => (
                    <tr key={`${app.app || index}-${index}`} style={{
                      backgroundColor: index % 2 === 0 ? "white" : "#f8fafc"
                    }}>
                      <td style={{
                        padding: "12px 16px",
                        color: "#4a5568",
                        textAlign: "center",
                        borderBottom: "1px solid #e2e8f0"
                      }}>
                        {formatTagAppDisplay(app)}
                      </td>
                    </tr>
                  ))}

                  {scoreData.uniqueLibraries.length > 0 && (
                    <>
                      {scoreData.uniqueLibraries.map((lib, i) => (
                        <tr key={`library-${i}`}>
                          <td style={{
                            padding: "10px 16px",
                            color: "#1a202c",
                            backgroundColor: "#f8fafc",
                            fontWeight: "400",
                            textAlign: "center",
                            borderBottom: "1px solid #e2e8f0"
                          }}>
                            <strong>Library: </strong>{lib}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {scoreData.uniquePolicyProjects.length > 0 && (
                    <>
                      {scoreData.uniquePolicyProjects.map((proj, i) => (
                        <tr key={`policy-${i}`}>
                          <td style={{
                            padding: "10px 16px",
                            color: "#1a202c",
                            backgroundColor: "#edf2f7",
                            fontWeight: "400",
                            textAlign: "center",
                            borderBottom: "1px solid #e2e8f0"
                          }}>
                            <strong>Policy Project: </strong>{proj}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </TableWrapper>
          );
        })}
      </div>
    </div>
  );
};
