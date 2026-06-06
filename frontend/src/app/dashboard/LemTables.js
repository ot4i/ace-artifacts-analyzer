// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

// "use client";
// import React, { useState } from 'react';
// import { TableWrapper } from './TableWrapper';

// export const LemTables = ({ 
//   lemData, 
//   formatAppDisplay,
//   expandedTable,
//   setExpandedTable,
//   policyProjects,
//   sharedLibraries
// }) => {
//   const [splitView, setSplitView] = useState(true);
//   const [scoreThreshold, setScoreThreshold] = useState(150);

//   const createAppComponents = (data) => {
//     const mapping = {};
//     Object.entries(data).forEach(([key, value]) => {
//       if (Array.isArray(value)) {
//         const keyParts = key.split('_');
//         const component = keyParts[keyParts.length - 1];
//         value.forEach(app => {
//           if (!mapping[app]) mapping[app] = new Set();
//           mapping[app].add(component);
//         });
//       } else if (typeof value === 'object' && value !== null) {
//         Object.entries(value).forEach(([subKey, subValue]) => {
//           if (Array.isArray(subValue)) {
//             const keyParts = subKey.split('_');
//             const component = keyParts[keyParts.length - 1];
//             subValue.forEach(app => {
//               if (!mapping[app]) mapping[app] = new Set();
//               mapping[app].add(component);
//             });
//           }
//         });
//       }
//     });
//     return mapping;
//   };

// console.log("lemdata", lemData)
//   const getPolicyNames = (app) =>
//     policyProjects?.[app]?.length > 0 ? policyProjects[app] : null;

//   const getLibraryNames = (app) =>
//     sharedLibraries?.[app]?.length > 0 ? sharedLibraries[app] : null;

//   const appComponentsMap = createAppComponents(lemData);

//   const hasAnyApps = Object.entries(lemData).some(([_, apps]) => {
//     if (!apps) return false;
//     if (Array.isArray(apps)) return apps.length > 0;
//     if (typeof apps === 'object') {
//       return Object.values(apps).flat().filter(Boolean).length > 0;
//     }
//     return false;
//   });

//   if (!hasAnyApps) {
//     return (
//       <div className="lem-tables-container">
//         <h2 className="section-title">Java Based Resources</h2>
//         <div className="empty-section">
//           No applications found for Java Based Resources 
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="lem-tables-container">
//       <div className="section-header-wrapper">
//   <div className="section-header-row">
//     <h2 className="section-title">Java Based Resources</h2>
//     <div className="controls-container">
//       <label className="control-item">
//         <input
//           type="checkbox"
//           checked={splitView}
//           onChange={() => setSplitView(prev => !prev)}
//         />
//         Modularization
//       </label>
//       <label className="control-item">
//         Threshold:
//         <input
//           type="number"
//           value={scoreThreshold}
//           min={10}
//           max={500}
//           onChange={(e) => setScoreThreshold(Number(e.target.value))}
//           className="threshold-input"
//           disabled={!splitView}
//         />
//       </label>
//     </div>
//   </div>
// </div>

//       {Object.entries(lemData).map(([category, data]) => {
//         let allApps = [];
//         if (Array.isArray(data)) {
//           allApps = data;
//         } else if (typeof data === 'object' && data !== null) {
//           allApps = Object.values(data).flat().filter(Boolean);
//         }

//         const uniqueApps = [...new Set(allApps)];
//         if (uniqueApps.length === 0) return null;

//         const getAppScore = (app) => {
//           const components = appComponentsMap[app];
//           const policies = getPolicyNames(app) || [];
//           const libraries = getLibraryNames(app) || [];

//           let compCount = 0;
//           const uniqueComps = new Set();

//           if (components) {
//             compCount += components.size;
//             components.forEach(c => uniqueComps.add(c));
//           }

//           const genScore = uniqueComps.size + compCount;
//           const shlibScore = libraries.length * 5;

//           return genScore + shlibScore;
//         };

//         if (!splitView) {
//           const comps = new Set();
//           const policies = new Set();
//           const libraries = new Set();
//           let compTotal = 0;
//           let shlibTotal = 0;

//           uniqueApps.forEach(app => {
//             const compsSet = appComponentsMap[app];
//             if (compsSet) {
//               compTotal += compsSet.size;
//               compsSet.forEach(c => comps.add(c));
//             }

//             const pols = getPolicyNames(app);
//             if (pols) pols.forEach(p => policies.add(p));

//             const libs = getLibraryNames(app);
//             if (libs) {
//               shlibTotal += libs.length;
//               libs.forEach(l => libraries.add(l));
//             }
//           });

//           const n = uniqueApps.length;
//           const uniqueScore = comps.size;
//           const maxScore = n * uniqueScore;
//           const genScore = maxScore + compTotal;
//           const shScore = shlibTotal * 5;
//           const finalScore = genScore + shScore;
//           const sizeTag = finalScore <= 50 ? 'S' : finalScore <= 100 ? 'M' : 'L';

//           console.log("n", n)
//           console.log("uniqueScore",uniqueScore)
//           console.log("maxScore",maxScore)
//           console.log("genScore",genScore)
//           console.log("shScore",shScore)
//           console.log("finalScore",finalScore)

//           return (
//             <TableWrapper
//               key={`${category}-full`}
//               id={`${category}-full`}
//               title={category}
//               expandedTable={expandedTable}
//               setExpandedTable={setExpandedTable}
//             >
//               <table className="lem-table">
//                 <thead>
//                   <tr>
//                     <th>{category} (Footprint: {finalScore}) ({sizeTag})</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {uniqueApps.map((app, index) => (
//                     <tr key={`${app}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
//                       <td>{formatAppDisplay(app)}</td>
//                     </tr>
//                   ))}
//                   {[...policies].map((policy, i) => (
//                     <tr key={`policy-${i}`}>
//                       <td><strong>Policy:</strong> {policy}</td>
//                     </tr>
//                   ))}
//                   {[...libraries].map((lib, i) => (
//                     <tr key={`library-${i}`}>
//                       <td><strong>Library:</strong> {lib}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </TableWrapper>
//           );
//         }

//         // Split view logic
//         const chunkedTables = [];
//         let chunk = [];
//         let chunkScore = 0;
//         let part = 1;

//         const pushChunk = () => {
//           const comps = new Set();
//           const pols = new Set();
//           const libs = new Set();
//           let compTotal = 0;
//           let shlibTotal = 0;

//           chunk.forEach(app => {
//             const compsSet = appComponentsMap[app];
//             if (compsSet) {
//               compTotal += compsSet.size;
//               compsSet.forEach(c => comps.add(c));
//             }

//             const pList = getPolicyNames(app);
//             if (pList) pList.forEach(p => pols.add(p));

//             const lList = getLibraryNames(app);
//             if (lList) {
//               shlibTotal += lList.length;
//               lList.forEach(l => libs.add(l));
//             }
//           });

//           const n = chunk.length;
//           const uniqueScore = comps.size;
//           const maxScore = n * uniqueScore;
//           const genScore = maxScore + compTotal;
//           const shScore = shlibTotal * 5;
//           const final = genScore + shScore;
//           const sizeTag = final <= 50 ? 'S' : final <= 100 ? 'M' : 'L';

//           chunkedTables.push(
//             <TableWrapper
//               key={`${category}-part-${part}`}
//               id={`${category}-part-${part}`}
//               title={category}
//               expandedTable={expandedTable}
//               setExpandedTable={setExpandedTable}
//             >
//               <table className="lem-table">
//                 <thead>
//                   <tr>
//                     <th>{category} (Footprint: {final}) ({sizeTag})</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {chunk.map((app, index) => (
//                     <tr key={`${app}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
//                       <td>{formatAppDisplay(app)}</td>
//                     </tr>
//                   ))}
//                   {[...pols].map((policy, i) => (
//                     <tr key={`policy-${i}`}>
//                       <td><strong>Policy:</strong> {policy}</td>
//                     </tr>
//                   ))}
//                   {[...libs].map((lib, i) => (
//                     <tr key={`library-${i}`}>
//                       <td><strong>Library:</strong> {lib}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </TableWrapper>
//           );
//           part++;
//         };

//         for (const app of uniqueApps) {
//           const appScore = getAppScore(app);
//           if (chunkScore + appScore > scoreThreshold && chunk.length > 0) {
//             pushChunk();
//             chunk = [];
//             chunkScore = 0;
//           }
//           chunk.push(app);
//           chunkScore += appScore;
//         }

//         if (chunk.length > 0) {
//           pushChunk();
//         }

//         return chunkedTables;
//       })}
//     </div>
//   );
// };

// export default LemTables


"use client";
import React, { useState } from 'react';
import { TableWrapper } from './TableWrapper';

export const LemTables = ({
  data,
  formatAppDisplay,
  expandedTable,
  setExpandedTable,
  policyProjects,
  sharedLibraries
}) => {
  const [splitView, setSplitView] = useState(true);
  const [scoreThreshold, setScoreThreshold] = useState(150);

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
    console.log("component mapping:", mapping);
    return mapping;
  };

  const getPolicyNames = (app) =>
    policyProjects?.[app]?.length > 0 ? policyProjects[app] : null;

  const getLibraryNames = (app) =>
    sharedLibraries?.[app]?.length > 0 ? sharedLibraries[app] : null;

  const appComponentsMap = createAppComponents(data);

  const categoryMap = {};
  Object.entries(data).forEach(([key, value]) => {
    if (!Array.isArray(value)) return;
    const category = key.split('_')[0];
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push(...value);
  });

  const hasAnyApps = Object.values(categoryMap).some(apps => apps.length > 0);

  if (!hasAnyApps) {
    return (
      <div className="lem-tables-container">
        <h2 className="section-title">Java Based Resources</h2>
        <div className="empty-section">
          No applications found for Java Based Resources
        </div>
      </div>
    );
  }

  return (
    <div className="lem-tables-container">
      <div className="section-header-wrapper">
        <div className="section-header-row">
          <h2 className="section-title">Java Based Resources</h2>
          <div className="controls-container">
            <label className="control-item">
              <input
                type="checkbox"
                checked={splitView}
                onChange={() => setSplitView(prev => !prev)}
              />
              Modularization
            </label>
            <label className="control-item">
              Threshold:
              <input
                type="number"
                value={scoreThreshold}
                min={10}
                max={500}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                className="threshold-input"
                disabled={!splitView}
              />
            </label>
          </div>
        </div>
      </div>

      {Object.entries(categoryMap).map(([category, apps]) => {
        const uniqueApps = [...new Set(apps)];

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

        if (!splitView) {
          const comps = new Set();
          const policies = new Set();
          const libraries = new Set();
          let compTotal = 0;
          let shlibTotal = 0;

          uniqueApps.forEach(app => {
            const compsSet = appComponentsMap[app];
            if (compsSet) {
              compTotal += compsSet.size;
              compsSet.forEach(c => comps.add(c));
            }

            const pols = getPolicyNames(app);
            if (pols) pols.forEach(p => policies.add(p));

            const libs = getLibraryNames(app);
            if (libs) {
              shlibTotal += libs.length;
              libs.forEach(l => libraries.add(l));
            }
          });

          const n = uniqueApps.length;
          const uniqueScore = comps.size;
          const maxScore = n * uniqueScore;
          const genScore = maxScore + compTotal;
          const shScore = shlibTotal * 5;
          const finalScore = genScore + shScore;
          const sizeTag = finalScore <= 50 ? 'S' : finalScore <= 100 ? 'M' : 'L';

          console.log("Category:", category);
          console.log("Component Count:", comps.size);
          console.log("Components:", comps);

          const table = (
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
                  {uniqueApps.map((app, index) => (
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

          return category.toLowerCase().includes("jvm") ? table : null;
        }

        // Split view
        const chunkedTables = [];
        let chunk = [];
        let chunkScore = 0;
        let part = 1;

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

          console.log(`Chunk ${part} - ${category}`);
          console.log("Component Count:", comps.size);
          console.log("Components:", comps);

          chunkedTables.push(
            <TableWrapper
              key={`${category}-part-${part}`}
              id={`${category}-part-${part}`}
              title={`${category} - Part ${part}`}
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

        for (const app of uniqueApps) {
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

        return category.toLowerCase().includes("jvm") ? chunkedTables : null;
      })}
    </div>
  );
};

export default LemTables;
