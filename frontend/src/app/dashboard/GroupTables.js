// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

// "use client";
// import React, { useState } from 'react';
// import { TableWrapper } from './TableWrapper';

// export const GroupTables = ({ 
//   selectedGroup, 
//   data, 
//   groups, 
//   formatAppDisplay, 
//   expandedTable,
//   setExpandedTable,
//   policyProjects,
//   sharedLibraries
// }) => {
//   const [splitView, setSplitView] = useState(true); // 👈 default to true
//   const [scoreThreshold, setScoreThreshold] = useState(150); // 👈 user-defined threshold

//   const createAppComponents = (data) => {
//     const mapping = {};
//     Object.entries(data).forEach(([key, value]) => {
//       if (Array.isArray(value)) {
//         const keyParts = key.split('_');
//         const component = keyParts[keyParts.length - 1];
//         value.forEach(app => {
//           if (!mapping[app]) {
//             mapping[app] = new Set();
//           }
//           mapping[app].add(component);
//         });
//       }
//     });
//     return mapping;
//   };

//   const getPolicyNames = (app) =>
//     policyProjects?.[app]?.length > 0 ? policyProjects[app] : null;

//   const getLibraryNames = (app) =>
//     sharedLibraries?.[app]?.length > 0 ? sharedLibraries[app] : null;

//   const appComponentsMap = createAppComponents(data);
//   const getGroupCategories = (group) => groups[group] || [];
//   const categories = getGroupCategories(selectedGroup);

//   const hasAnyApps = categories.some(category => {
//     const apps = data[category] || [];
//     return apps.length > 0;
//   });

//   if (!hasAnyApps) {
//     return (
//       <div className="group-results">
//         <h2 className="section-title">{selectedGroup}</h2>
//         <div className="empty-section">
//           No applications found for {selectedGroup}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="group-results">
//       <div 
//         className="section-header"
//         style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
//       >
//         <h2 className="section-title">{selectedGroup}</h2>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//           <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <input
//               type="checkbox"
//               checked={splitView}
//               onChange={() => setSplitView(prev => !prev)}
//             />
//             Modularization
//           </label>
//           <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//             Threshold:
//             <input
//               type="number"
//               min={10}
//               max={500}
//               value={scoreThreshold}
//               onChange={(e) => setScoreThreshold(Number(e.target.value))}
//               style={{ width: '60px' }}
//               disabled={!splitView}
//             />
//           </label>
//         </div>
//       </div>

//       <div className="table-grid">
//         {categories.map((category) => {
//           const apps = data[category] || [];
//           if (apps.length === 0) return null;

//           if (!splitView) {
//             // non-split view logic remains unchanged
//             const policies = new Set();
//             const libraries = new Set();
//             const comps = new Set();
//             let compTotal = 0;
//             let shlibTotal = 0;

//             apps.forEach(app => {
//               const compsSet = appComponentsMap[app];
//               if (compsSet) {
//                 compTotal += compsSet.size;
//                 compsSet.forEach(c => comps.add(c));
//               }

//               const pols = getPolicyNames(app);
//               if (pols) pols.forEach(p => policies.add(p));

//               const libs = getLibraryNames(app);
//               if (libs) {
//                 shlibTotal += libs.length;
//                 libs.forEach(l => libraries.add(l));
//               }
//             });

//             const n = apps.length;
//             const uniqueScore = comps.size;
//             const maxScore = n * uniqueScore;
//             const genScore = maxScore + compTotal;
//             const shScore = shlibTotal * 5;
//             const finalScore = genScore + shScore;
//             const sizeTag = finalScore <= 50 ? 'S' : finalScore <= 100 ? 'M' : 'L';

//             console.log("Category:", category);
//     console.log("comps", comps);
//     console.log("policies", policies);
//     console.log("libraries", libraries);
//     console.log("finalScore", finalScore);

//             return (
//               <TableWrapper
//                 key={`${category}-full`}
//                 id={`${category}-full`}
//                 title={category}
//                 expandedTable={expandedTable}
//                 setExpandedTable={setExpandedTable}
//               >
//                 <table className="lem-table">
//                   <thead>
//                     <tr>
//                       <th>{category} (Footprint: {finalScore}) ({sizeTag})</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {apps.map((app, index) => (
//                       <tr key={`${app}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
//                         <td>{formatAppDisplay(app)}</td>
//                       </tr>
//                     ))}
//                     {[...policies].map((policy, i) => (
//                       <tr key={`policy-${i}`}>
//                         <td><strong>Policy:</strong> {policy}</td>
//                       </tr>
//                     ))}
//                     {[...libraries].map((lib, i) => (
//                       <tr key={`library-${i}`}>
//                         <td><strong>Library:</strong> {lib}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </TableWrapper>
//             );
//           }

//           // Split view logic
//           const chunkedTables = [];
//           let chunk = [];
//           let chunkScore = 0;
//           let part = 1;

//           const getAppScore = (app) => {
//             const components = appComponentsMap[app];
//             const policies = getPolicyNames(app) || [];
//             const libraries = getLibraryNames(app) || [];

//             let compCount = 0;
//             const uniqueComps = new Set();

//             if (components) {
//               compCount += components.size;
//               components.forEach(c => uniqueComps.add(c));
//             }

//             const genScore = uniqueComps.size + compCount;
//             const shlibScore = libraries.length * 5;

//             return genScore + shlibScore;
//           };

//           const pushChunk = () => {
//             const comps = new Set();
//             const pols = new Set();
//             const libs = new Set();
//             let compTotal = 0;
//             let shlibTotal = 0;

//             chunk.forEach(app => {
//               const compsSet = appComponentsMap[app];
//               if (compsSet) {
//                 compTotal += compsSet.size;
//                 compsSet.forEach(c => comps.add(c));
//               }

//               const pList = getPolicyNames(app);
//               if (pList) pList.forEach(p => pols.add(p));

//               const lList = getLibraryNames(app);
//               if (lList) {
//                 shlibTotal += lList.length;
//                 lList.forEach(l => libs.add(l));
//               }
//             });

//             const n = chunk.length;
//             const uniqueScore = comps.size;
//             const maxScore = n * uniqueScore;
//             const genScore = maxScore + compTotal;
//             const shScore = shlibTotal * 5;
//             const final = genScore + shScore;
//             const sizeTag = final <= 50 ? 'S' : final <= 100 ? 'M' : 'L';

//             chunkedTables.push(
//               <TableWrapper
//                 key={`${category}-part-${part}`}
//                 id={`${category}-part-${part}`}
//                 title={category}
//                 expandedTable={expandedTable}
//                 setExpandedTable={setExpandedTable}
//               >
//                 <table className="lem-table">
//                   <thead>
//                     <tr>
//                       <th>{category} (Footprint: {final}) ({sizeTag})</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {chunk.map((app, index) => (
//                       <tr key={`${app}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
//                         <td>{formatAppDisplay(app)}</td>
//                       </tr>
//                     ))}
//                     {[...pols].map((policy, i) => (
//                       <tr key={`policy-${i}`}>
//                         <td><strong>Policy:</strong> {policy}</td>
//                       </tr>
//                     ))}
//                     {[...libs].map((lib, i) => (
//                       <tr key={`library-${i}`}>
//                         <td><strong>Library:</strong> {lib}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </TableWrapper>
//             );
//             part++;
//           };

//           for (const app of apps) {
//             const appScore = getAppScore(app);
//             if (chunkScore + appScore > scoreThreshold && chunk.length > 0) {
//               pushChunk();
//               chunk = [];
//               chunkScore = 0;
//             }
//             chunk.push(app);
//             chunkScore += appScore;
//           }

//           if (chunk.length > 0) {
//             pushChunk();
//           }

//           return chunkedTables;
//         })}
//       </div>
//     </div>
//   );
// };


"use client";
import React, { useState } from 'react';
import { TableWrapper } from './TableWrapper';

export const GroupTables = ({ 
  selectedGroup, 
  data, 
  groups, 
  formatAppDisplay, 
  expandedTable,
  setExpandedTable,
  policyProjects,
  sharedLibraries
}) => {
  const [splitView, setSplitView] = useState(true); // 👈 default to true
  const [scoreThreshold, setScoreThreshold] = useState(150); // 👈 user-defined threshold

  console.log("data", data);
  
  const createAppComponents = (data) => {
    const mapping = {};
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const keyParts = key.split('_');
        const component = keyParts[keyParts.length - 1];
        value.forEach(app => {
          if (!mapping[app]) {
            mapping[app] = new Set();
          }
          mapping[app].add(component);
        });
      }
    });
     console.log("mapping", mapping);
    return mapping;
  };

 
  const getPolicyNames = (app) =>
    policyProjects?.[app]?.length > 0 ? policyProjects[app] : null;

  const getLibraryNames = (app) =>
    sharedLibraries?.[app]?.length > 0 ? sharedLibraries[app] : null;

  const appComponentsMap = createAppComponents(data);
  const getGroupCategories = (group) => groups[group] || [];
  const categories = getGroupCategories(selectedGroup);

  console.log("data",data);
  console.log("appComponentsMap",appComponentsMap);

  const hasAnyApps = categories.some(category => {
    const apps = data[category] || [];
    return apps.length > 0;
  });

  if (!hasAnyApps) {
    return (
      <div className="group-results">
        <h2 className="section-title">{selectedGroup}</h2>
        <div className="empty-section">
          No applications found for {selectedGroup}
        </div>
      </div>
    );
  }

  return (
    <div className="group-results">
      <div 
        className="section-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h2 className="section-title">{selectedGroup}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      <div className="table-grid">
        {categories.map((category) => {
          const apps = data[category] || [];
          if (apps.length === 0) return null;

          if (!splitView) {
            const policies = new Set();
            const libraries = new Set();
            const comps = new Set();
            let compTotal = 0;
            let shlibTotal = 0;

            apps.forEach(app => {
              const compsSet = appComponentsMap[app];
              if (compsSet) {
                compTotal += compsSet.size;
                compsSet.forEach(c => comps.add(c));
              }
              console.log(apps)

              const pols = getPolicyNames(app);
              if (pols) pols.forEach(p => policies.add(p));

              const libs = getLibraryNames(app);
              if (libs) {
                shlibTotal += libs.length;
                libs.forEach(l => libraries.add(l));
              }
            });

            const n = apps.length;
            const uniqueScore = comps.size;
            const maxScore = n * uniqueScore;
            const genScore = maxScore + compTotal;
            const shScore = shlibTotal * 5;
            const finalScore = genScore + shScore;
            const sizeTag = finalScore <= 50 ? 'S' : finalScore <= 100 ? 'M' : 'L';

            // ✅ Log non-split
            console.log("📦 Non-split view:");
            console.log("Category:", category);
            console.log("comps", comps);
            console.log("policies", policies);
            console.log("libraries", libraries);
            console.log("finalScore", finalScore);

            return (
              <TableWrapper
                key={`${category}-full`}
                id={`${category}-full`}
                title={category}
                expandedTable={expandedTable}
                setExpandedTable={setExpandedTable}
              >
                <table className="lem-table">
                  <thead>
                    <tr>
                      <th>{category} (Footprint: {finalScore}) ({sizeTag})</th>
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

          // Split view
          const chunkedTables = [];
          let chunk = [];
          let chunkScore = 0;
          let part = 1;

          const getAppScore = (app) => {
            const components = appComponentsMap[app];
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

          const pushChunk = () => {
            const comps = new Set();
            const pols = new Set();
            const libs = new Set();
            let compTotal = 0;
            let shlibTotal = 0;

            chunk.forEach(app => {
              const compsSet = appComponentsMap[app];
              if (compsSet) {
                compTotal += compsSet.size;
                compsSet.forEach(c => comps.add(c));
              }

              const pList = getPolicyNames(app);
              if (pList) pList.forEach(p => pols.add(p));

              const lList = getLibraryNames(app);
              if (lList) {
                shlibTotal += lList.length;
                lList.forEach(l => libs.add(l));
              }
            });

            const n = chunk.length;
            const uniqueScore = comps.size;
            const maxScore = n * uniqueScore;
            const genScore = maxScore + compTotal;
            const shScore = shlibTotal * 5;
            const final = genScore + shScore;
            const sizeTag = final <= 50 ? 'S' : final <= 100 ? 'M' : 'L';

            // ✅ Log split view chunk
            console.log(`📂 Chunk ${part} - ${category}`);
            console.log("comps", comps);
            console.log("pols", pols);
            console.log("libs", libs);
            console.log("finalScore", final);

            chunkedTables.push(
              <TableWrapper
                key={`${category}-part-${part}`}
                id={`${category}-part-${part}`}
                title={category}
                expandedTable={expandedTable}
                setExpandedTable={setExpandedTable}
              >
                <table className="lem-table">
                  <thead>
                    <tr>
                      <th>{category} (Footprint: {final}) ({sizeTag})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((app, index) => (
                      <tr key={`${app}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
                        <td>{formatAppDisplay(app)}</td>
                      </tr>
                    ))}
                    {[...pols].map((policy, i) => (
                      <tr key={`policy-${i}`}>
                        <td><strong>Policy:</strong> {policy}</td>
                      </tr>
                    ))}
                    {[...libs].map((lib, i) => (
                      <tr key={`library-${i}`}>
                        <td><strong>Library:</strong> {lib}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrapper>
            );
            part++;
          };

          for (const app of apps) {
            const appScore = getAppScore(app);
            if (chunkScore + appScore > scoreThreshold && chunk.length > 0) {
              pushChunk();
              chunk = [];
              chunkScore = 0;
            }
            chunk.push(app);
            chunkScore += appScore;
          }

          if (chunk.length > 0) {
            pushChunk();
          }

          return chunkedTables;
        })}
      </div>
    </div>
  );
};
