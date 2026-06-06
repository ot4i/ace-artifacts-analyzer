// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client"
import React from 'react';

export const AppsTable = ({ listApp }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="column-file">
            {listApp.length > 0 && listApp[0]?.file?.endsWith(".bar") ? "Bar Files" : "Integration Server"}
          </th>
          <th className="column-apps">
            Applications
          </th>
        </tr>
      </thead>
      <tbody>
        {listApp.length > 0 ? (
          listApp.map((item, index) => (
            <tr key={`${item.file}-${index}`} className={index % 2 === 0 ? '' : 'alt-row'}>
              <td>{item.file}</td>
              <td>{item.applications}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={2} className="empty-message">
              No applications found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};