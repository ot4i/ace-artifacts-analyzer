// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client"
import React, { useState, useEffect } from 'react';
import './styles.css';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { parseFileData } from '@/app/utils/dataParser';
import { createAppComponentsMapping } from '@/app/utils/dataUtils';
import Image from 'next/image';
import logo from '@/app/AppConnect_logo.jpg';

function App() {
  const [data, setData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [displayResults, setDisplayResults] = useState(false);
  const [totalApps, setTotalApps] = useState(0);
  const [mainCategories, setMainCategories] = useState([]);
  const [openCategories, setOpenCategories] = useState({});
  const [showLemTables, setShowLemTables] = useState(false);
  const [showTagGroups, setShowTagGroups] = useState(false);
  const [policyProjects, setPolicyProjects] = useState({});
  const [sharedLibraries, setSharedLibraries] = useState({});
  const [fileType, setFileType] = useState('');
  const [fileList, setFileList] = useState([]);
  const [listApp, setListApp] = useState([]);
  const [tagGroups, setTagGroups] = useState({});
  const [expandedTable, setExpandedTable] = useState(null);
  const [inputFolder, setInputFolder] = useState('');
  const [inputCount, setInputCount] = useState(null);
  const [fileName, setFileName] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [operationType, setOperationType] = useState('AND');
  const [lemData, setLemData] = useState({
    JVM: {},
    JavaNodes: {},
    JavaScriptNodes: {},
    ResourceManagers: {}
  });
  const [mappedData, setMappedData] = useState([]);
  const [hoveredTable, setHoveredTable] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const groups = {
    Transport: ["MQ", "Http", "TCPIP", "File", "Email", "SOAP", "REST"],
    Aggregate: ["Aggregation", "Group"],
    Database: ["JDBC", "Database_ODBC"],
    SSL: ["SSL"],
  };

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const processed = createAppComponentsMapping(data, policyProjects, sharedLibraries);
      setMappedData(processed);
    }
  }, [data, policyProjects, sharedLibraries]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/read-file');
      if (!response.ok) throw new Error('Network response was not ok');

      const { content, output_dir_path } = await response.json();
      setOutputPath(output_dir_path);
      
      const parsedData = parseFileData(
        content, 
        setFileType, 
        setInputFolder, 
        setFileList, 
        setListApp, 
        setInputCount,
        setPolicyProjects,
        setSharedLibraries,
        setLemData,
        setMainCategories
      );
      
      setData(parsedData);

      // Fetch tags AFTER outputPath is set
      fetchTagsData(output_dir_path);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTagsData = async (outputDirPath) => {
    try {
      outputDirPath = outputDirPath.replace(/\\/g, "/");
      const tagRes = await fetch(`http://localhost:8080/dashboard/fetch-tags?outputDirPath=${outputDirPath}`);
      if (tagRes.ok) {
        const tagsFromFile = await tagRes.json(); 

        // Update mappedData with tags
        setMappedData(prevMappedData => {
          return prevMappedData.map(row => {
            const matched = tagsFromFile.find(t => t.app === row.app);
            return {
              ...row,
              tag: matched ? matched.tag : ''
            };
          });
        });

        // Create tag groups from the data
        const groups = {};
      tagsFromFile.forEach(item => {
        const { tag, app, components = [], sharedLibraries = [], policyProjects = []} = item;
        if (!tag) return;

        if (!groups[tag]) {
          groups[tag] = [];
        }

        groups[tag].push({
          app,
          components,
          sharedLibraries,
          policyProjects
        });
      });
        
        setTagGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleFileUpload = (event) => {
    if (!isClient) return;
    
    const file = event.target.files[0];
    if (file) {
      // Reset state
      setData({});
      setMainCategories([]);
      setTotalApps(0);
      setFileType('');
      setFileList([]);
      setListApp([]);
      setInputFolder('');
      setSelectedCheckboxes([]);
      setDisplayResults(false);
      setSelectedGroup(null);
      setShowLemTables(false);
      setShowTagGroups(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parsedData = parseFileData(
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
        );
        setData(parsedData);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleCheckboxChange = (checked, category, subCategory = null) => {
    setSelectedGroup(null);
    setShowLemTables(false);
    setShowTagGroups(false);
    
    setSelectedCheckboxes(prev => {
      if (checked) {
        return [...prev, { category, subCategory }];
      } else {
        return prev.filter(item => 
          !(item.category === category && item.subCategory === subCategory)
        );
      }
    });
    setDisplayResults(true);
  };

  const handleGroupSelection = (group) => {
    setSelectedGroup(group);
    setSelectedCategory(null);
    setSelectedCheckboxes([]);
    setShowLemTables(false);
    setShowTagGroups(false);
    setDisplayResults(false);
    setOpenCategories({});
  };

  const handleTagGroupSelection = () => {
    setShowTagGroups(!showTagGroups);
    setSelectedGroup(null);
    setSelectedCategory(null);
    setSelectedCheckboxes([]);
    setShowLemTables(false);
    setDisplayResults(false);
    setOpenCategories({});
  };

  const handleLemTablesToggle = () => {
    setShowLemTables(!showLemTables);
    setSelectedGroup(null);
    setSelectedCategory(null);
    setSelectedCheckboxes([]);
    setShowTagGroups(false);
    setDisplayResults(false);
    setOpenCategories({});
  };

  const handleCategoryChange = (category) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleClearSelection = () => {
    setSelectedCheckboxes([]);
    setDisplayResults(false);
  };

  const handleOperationTypeChange = (type) => {
    setOperationType(type);
  };

  const handleTagChange = (index, value) => {
    const newMappedData = [...mappedData];
    newMappedData[index].tag = value;
    setMappedData(newMappedData);
  };

  const handleSaveTags = async () => {
    try {
      const response = await fetch('http://localhost:8080/dashboard/save-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: mappedData.map(({ app, tag , sharedLibraries, policyProjects,components }) => ({ app, tag, sharedLibraries, 
            policyProjects,components: components ? components.split(', ') : []
          })),
          output_dir_path: outputPath,
          file_type: fileType,
        })
      });

      if (response.ok) {
        alert("Tags saved successfully!");
        await fetchTagsData(outputPath);
      } else {
        alert("Failed to save tags.");
      }
    } catch (error) {
      console.error("Error saving tags:", error);
      alert("Error occurred while saving tags.");
    }
  };

  const getCommonApps = () => {
    let allSets = [];

    selectedCheckboxes.forEach(({ category, subCategory }) => {
      if (subCategory) {
        if (data[category]?.[subCategory]) {
          allSets.push(new Set(data[category][subCategory]));
        }
      } else {
        if (Array.isArray(data[category])) {
          allSets.push(new Set(data[category]));
        }
      }
    });

    if (allSets.length === 0) return [];
    if (allSets.length === 1) return Array.from(allSets[0]);

    if (operationType === 'AND') {
      // Intersection (AND) operation
      return Array.from(allSets.reduce((acc, curr) => {
        return new Set([...acc].filter(x => curr.has(x)));
      }));
    } else {
      // Union (OR) operation
      return Array.from(allSets.reduce((acc, curr) => {
        return new Set([...acc, ...curr]);
      }));
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <Image
                src={logo}
                alt="Logo"
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
        <h2 className="app-title">IBM App Connect Enterprise</h2>
      </header>

      <div className="app-content">
        <Sidebar
          mainCategories={mainCategories}
          openCategories={openCategories}
          selectedCheckboxes={selectedCheckboxes}
          selectedGroup={selectedGroup}
          showLemTables={showLemTables}
          showTagGroups={showTagGroups}
          operationType={operationType}
          data={data}
          onFileUpload={handleFileUpload}
          onCheckboxChange={handleCheckboxChange}
          onGroupSelection={handleGroupSelection}
          onTagGroupSelection={handleTagGroupSelection}
          onLemTablesToggle={handleLemTablesToggle}
          onCategoryChange={handleCategoryChange}
          onClearSelection={handleClearSelection}
          onOperationTypeChange={handleOperationTypeChange}
        />

        <MainContent
          fileType={fileType}
          inputFolder={inputFolder}
          inputCount={inputCount}
          listApp={listApp}
          mappedData={mappedData}
          showTagGroups={showTagGroups}
          tagGroups={tagGroups}
          showLemTables={showLemTables}
          lemData={lemData}
          selectedGroup={selectedGroup}
          selectedCheckboxes={selectedCheckboxes}
          displayResults={displayResults}
          getCommonApps={getCommonApps}
          hoveredTable={hoveredTable}
          setHoveredTable={setHoveredTable}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
          operationType={operationType}
          onTagChange={handleTagChange}
          onSaveTags={handleSaveTags}
          data={data}
          groups={groups}
          sharedLibraries={sharedLibraries}
          policyProjects={policyProjects}
        />
      </div>
    </div>
  );
}

export default App;
