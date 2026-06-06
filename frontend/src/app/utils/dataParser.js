// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

// "use client"
// export const parseFileData = (
//   text, 
//   setFileType, 
//   setInputFolder, 
//   setFileList, 
//   setListApp, 
//   setInputCount,
//   setPolicyProjects,
//   setSharedLibraries,
//   setLemData,
//   setMainCategories
// ) => {
//   const parsedData = {};
//   const detectedMainCategories = [];
//   const newLemData = {
//     JavaNodes: {},
//     JavaScriptNodes: {},
//     ResourceManagers: {}
//   };

//   const policyProjects = {};
//   const sharedLibraries = {};

//   const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");

//   if (lines.length === 0) {
//     console.error("File is empty or not formatted correctly.");
//     return parsedData;
//   }
  
//   const typeMatch = lines[0]?.match(/Type:\s*(\w+)/);
//   const inputMatch = lines[1]?.match(/Input\s*:\s*(\S+)/);
//   const filesMatch = lines[2]?.match(/List of (?:bar files|servers):\s*\[(.*?)\]/i);
//   const appMatch = lines[3]?.match(/List of apps: \s*\[(.*?)\]/i);
//   const countMatch = lines[4]?.match(/Count:\s*(\d+)/);
//   const policyMatch = lines[5]?.match(/Policy Projects:\s*\[(.*)\]/i);
//   const libraryMatch = lines[6]?.match(/Shared Libraries:\s*\[(.*)\]/i);

//   if (typeMatch) {
//     setFileType(typeMatch[1]);
//   }
//   if (inputMatch) {
//     setInputFolder(inputMatch[1]);
//   }
//   if (filesMatch) {
//     setFileList(filesMatch[1].split(",").map(file => file.trim()));
//   }
//   if (appMatch) {
//     const apps = appMatch[1].split(",").map(app => app.trim());

//     const type = typeMatch && typeMatch[1] === "BARFOLDER" ? "bar" : "zip"; 
//     const appMap = {};
  
//     apps.forEach(app => {
//       let [base, appName] = app.split('|').map(s => s.trim());
//       if (!appMap[base]) {
//         appMap[base] = [];
//       }
//       appMap[base].push(appName);
//     });
  
//     if (policyMatch) {
//       const entries = policyMatch[1].split(/(?<=\]),\s*/);
      
//       entries.forEach(entry => {
//         // Split by first '=' only
//         const [key, value] = entry.split('=').map(s => s.trim());

//         if (key && value) {
//           // Remove the square brackets from value, e.g. "[TCPIPPolicies]"
//           const valuesString = value.replace(/^\[|\]$/g, '');
//           const values = valuesString ? valuesString.split(',').map(s => s.trim()) : [];
//           policyProjects[key] = values;
//         }
//       });
//     }

//     if (libraryMatch) {
//       const match_entries = libraryMatch[1].split(/(?<=\]),\s*/);

//       match_entries.forEach(entry => {
//         // Split by first '=' only
//         const [match_key, match_value] = entry.split('=').map(s => s.trim());

//         if (match_key && match_value) {
//           // Remove the square brackets from value, e.g. "[TCPIPPolicies]"
//           const valuesString = match_value.replace(/^\[|\]$/g, '');
//           const values = valuesString ? valuesString.split(',').map(s => s.trim()) : [];
//           sharedLibraries[match_key] = values;
//         }
//       });
//     }

//     const formattedList = Object.entries(appMap).map(([file, appNames]) => ({
//       file: type === "zip" ? file : `${file}.${type}`,
//       applications: appNames.join(", ")
//     }));
  
//     setListApp(formattedList);
//   }
//   if (countMatch) {
//     setInputCount(parseInt(countMatch[1], 10));
//   }

//   lines.slice(7).forEach((line) => {
//     if (line.trim()) {
//       const [key, values] = line.split(":");
      
//       // Extract applications from the line
//       const match = values.match(/\[(.*?)\]/);
//       const apps = match && match[1].trim() !== "" ? match[1].split(",").map((app) => app.trim()) : [];
      
//       if (key.includes("_")) {
//         // Handle categories with underscores (e.g., Nodes_Database_ODBC)
//         const parts = key.split("_");
//         const mainCategory = parts[0];
//         const subCategory = parts.slice(1).join("_");
        
//         // Handle special categories (JavaNodes, JavaScriptNodes, ResourceManagers)
//         if (["JavaNodes", "JavaScriptNodes", "ResourceManagers"].includes(mainCategory)) {
//           if (!newLemData[mainCategory]) {
//             newLemData[mainCategory] = {};
//           }
//           console.log("apps", apps);
//           newLemData[mainCategory][parts[1]] = apps;
//         }
        
//         // Add to the main category structure
//         if (!parsedData[mainCategory]) {
//           parsedData[mainCategory] = {};
//         }
//         parsedData[mainCategory][subCategory] = apps;
        
//         // For each part of the subcategory, add it to the flat structure for group display
//         const lastPart = parts[parts.length - 1];
//         if (!parsedData[lastPart]) {
//           parsedData[lastPart] = [];
//         }
//         parsedData[lastPart].push(...apps);
        
//         // For compound categories like Database_ODBC, add to the flat structure as well
//         if (parts.length > 2) {
//           const compoundCategory = parts.slice(1).join("_");
//           if (!parsedData[compoundCategory]) {
//             parsedData[compoundCategory] = [];
//           }
//           parsedData[compoundCategory].push(...apps);
//         }
        
//       } else {
//         // Handle simple categories without underscores
//         const category = key.trim();
//         parsedData[category] = apps;
//         detectedMainCategories.push(category);
//       }
//     }
//   });
  
//   setLemData(newLemData);
//   setMainCategories(detectedMainCategories);
//   setPolicyProjects(policyProjects);
//   setSharedLibraries(sharedLibraries);
  
//   return parsedData;
// };

// BELOW HAS JVM AND OTHERS 
"use client";
export const parseFileData = (
  text,
  setFileType,
  setInputFolder,
  setFileList,
  setListApp,
  setInputCount,
  setPolicyProjects,
  setSharedLibraries,
  setLemData,
  setMainCategories
) => {
  const parsedData = {};
  const detectedMainCategories = [];
  const newLemData = {
    // JavaNodes: {},
    // JavaScriptNodes: {},
    // ResourceManagers: {},
    JVM: []  // ✅ Add JVM explicitly
  };

  const policyProjects = {};
  const sharedLibraries = {};

  const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");

  if (lines.length === 0) {
    console.error("File is empty or not formatted correctly.");
    return parsedData;
  }

  const typeMatch = lines[0]?.match(/Type:\s*(\w+)/);
  const inputMatch = lines[1]?.match(/Input\s*:\s*(\S+)/);
  const filesMatch = lines[2]?.match(/List of (?:bar files|servers):\s*\[(.*?)\]/i);
  const appMatch = lines[3]?.match(/List of apps: \s*\[(.*?)\]/i);
  const countMatch = lines[4]?.match(/Count:\s*(\d+)/);
  const policyMatch = lines[5]?.match(/Policy Projects:\s*\[(.*)\]/i);
  const libraryMatch = lines[6]?.match(/Shared Libraries:\s*\[(.*)\]/i);

  if (typeMatch) setFileType(typeMatch[1]);
  if (inputMatch) setInputFolder(inputMatch[1]);
  if (filesMatch) setFileList(filesMatch[1].split(",").map(file => file.trim()));

  if (appMatch) {
    const apps = appMatch[1].split(",").map(app => app.trim());
    const type = typeMatch && typeMatch[1] === "BARFOLDER" ? "bar" : "zip";
    const appMap = {};

    apps.forEach(app => {
      let [base, appName] = app.split('|').map(s => s.trim());
      if (!appMap[base]) appMap[base] = [];
      appMap[base].push(appName);
    });

    if (policyMatch) {
      const entries = policyMatch[1].split(/(?<=\]),\s*/);
      entries.forEach(entry => {
        const [key, value] = entry.split('=').map(s => s.trim());
        if (key && value) {
          const valuesString = value.replace(/^\[|\]$/g, '');
          const values = valuesString ? valuesString.split(',').map(s => s.trim()) : [];
          policyProjects[key] = values;
        }
      });
    }

    if (libraryMatch) {
      const match_entries = libraryMatch[1].split(/(?<=\]),\s*/);
      match_entries.forEach(entry => {
        const [match_key, match_value] = entry.split('=').map(s => s.trim());
        if (match_key && match_value) {
          const valuesString = match_value.replace(/^\[|\]$/g, '');
          const values = valuesString ? valuesString.split(',').map(s => s.trim()) : [];
          sharedLibraries[match_key] = values;
        }
      });
    }

    const formattedList = Object.entries(appMap).map(([file, appNames]) => ({
      file: type === "zip" ? file : `${file}.${type}`,
      applications: appNames.join(", ")
    }));

    setListApp(formattedList);
  }

  if (countMatch) {
    setInputCount(parseInt(countMatch[1], 10));
  }

  lines.slice(7).forEach((line) => {
    if (line.trim()) {
      const [rawKey, values] = line.split(":");
      const key = rawKey.trim();
      const match = values.match(/\[(.*?)\]/);
      const apps = match && match[1].trim() !== "" ? match[1].split(",").map(app => app.trim()) : [];

      if (key.includes("_")) {
        const parts = key.split("_");
        const mainCategory = parts[0];
        const subCategory = parts.slice(1).join("_");

        if (["JavaNodes", "JavaScriptNodes", "ResourceManagers"].includes(mainCategory)) {
          if (!newLemData[mainCategory]) {
            newLemData[mainCategory] = {};
          }
          newLemData[mainCategory][parts[1]] = apps;
        }

        if (!parsedData[mainCategory]) {
          parsedData[mainCategory] = {};
        }
        parsedData[mainCategory][subCategory] = apps;

        const lastPart = parts[parts.length - 1];
        if (!parsedData[lastPart]) {
          parsedData[lastPart] = [];
        }
        parsedData[lastPart].push(...apps);

        if (parts.length > 2) {
          const compoundCategory = parts.slice(1).join("_");
          if (!parsedData[compoundCategory]) {
            parsedData[compoundCategory] = [];
          }
          parsedData[compoundCategory].push(...apps);
        }

      } else {
        // ✅ Only allow JVM as top-level category into newLemData
        parsedData[key] = apps;
        detectedMainCategories.push(key);

        if (key === "JVM") {
          newLemData[key].push(...apps);
        }
      }
    }
  });

  // ✅ Only keep JVM data before setting LEM
  setLemData({ JVM: newLemData.JVM });

  setMainCategories(detectedMainCategories);
  setPolicyProjects(policyProjects);
  setSharedLibraries(sharedLibraries);

  return parsedData;
};
