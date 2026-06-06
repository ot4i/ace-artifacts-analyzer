// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client"
import React from 'react';
import { AppsTable } from './AppsTable';
import { AppComponentsTable } from './AppComponentsTable';
import { TagGroupView } from './TagGroupView';
import { ResultTables } from './ResultTables';
import { GroupTables } from './GroupTables';
import { LemTables } from './LemTables';

export const MainContent = ({
  fileType,
  inputFolder,
  inputCount,
  listApp,
  mappedData,
  showTagGroups,
  tagGroups,
  showLemTables,
  lemData,
  selectedGroup,
  selectedCheckboxes,
  getCommonApps,
  hoveredTable,
  setHoveredTable,
  operationType,
  onTagChange,
  onSaveTags,
  data,
  groups,
  policyProjects,
  sharedLibraries,
  expandedTable,
  setExpandedTable
}) => {
  const formatAppDisplay = (app) => {
    if (!app) return '';
    
    const [file, appName] = app.split('|').map(s => s.trim());
    const fileExt = fileType.toLowerCase() === 'backupzipfile' ? '' : '.bar'; 
    return `${appName} (${file}${fileExt})`;
  };

  const formatTagAppDisplay = (app) => {
    if (!app) return '';

    let file = '';
    let appName = '';

    if (app.includes('|')) {
      [file, appName] = app.split('|').map(s => s.trim());
    } else {
      file = app.trim();
      appName = file.split('.')[0];
    }

    const fileExt = file.toLowerCase().endsWith('.zip') ? '' : '.bar';
    return `${appName} (${file}${fileExt})`;
  };

  return (
    <div className="main-content">
      <h1 className="main-title">Artifacts Assessment Report</h1>
      
      <div className="files-heading">
  {fileType === 'BACKUPZIPFILE' ? 'Backup' : 'Bar'}{' '}
  {fileType.toLowerCase() === 'backupzipfile' ? (
    <>
      Files Analyzed: {inputFolder}.zip
      <h6 className="server-heading">Integration Server(s) Analyzed: {listApp.length}</h6>
    </>
  ) : (
    <>Folder Analyzed: {inputFolder}
    <h6 className="server-heading">Bar Files Analyzed: {listApp.length}</h6></>
    
  )}
</div>

<div className="app-count">
        Total number of Applications assessed: {inputCount}
      </div>

      
      <AppsTable listApp={listApp} />
      
      <AppComponentsTable 
        mappedData={mappedData} 
        formatAppDisplay={formatAppDisplay}
        onTagChange={onTagChange}
        onSaveTags={onSaveTags}
      />
      
      {showTagGroups && (
        <TagGroupView tagGroups={tagGroups} formatAppDisplay={formatTagAppDisplay} fileType={fileType}/>
      )}
      
      {showLemTables && !selectedGroup && selectedCheckboxes.length === 0 && !showTagGroups && (
        <LemTables 
          // lemData={lemData} 
          data={data}
          formatAppDisplay={formatAppDisplay}
          hoveredTable={hoveredTable}
          setHoveredTable={setHoveredTable}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
          policyProjects={policyProjects}
          sharedLibraries={sharedLibraries}
        />
      )}
      
      {selectedGroup && !showLemTables && selectedCheckboxes.length === 0 && !showTagGroups && (
        <GroupTables 
          selectedGroup={selectedGroup} 
          data={data} 
          groups={groups}
          formatAppDisplay={formatAppDisplay}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
          policyProjects={policyProjects}
          sharedLibraries={sharedLibraries}
        />
      )}
      
      {!selectedGroup && !showLemTables && selectedCheckboxes.length > 0 && !showTagGroups && (
        <ResultTables
          selectedCheckboxes={selectedCheckboxes}
          operationType={operationType}
          getCommonApps={getCommonApps}
          data={data}
          formatAppDisplay={formatAppDisplay}
          hoveredTable={hoveredTable}
          setHoveredTable={setHoveredTable}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
          policyProjects={policyProjects}
          sharedLibraries={sharedLibraries}
        />
      )}
    </div>
  );
};