// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

//with standard deviation

"use client";
import React, { useState } from "react";

const extractExactAppName = (name) => {
  if (!name) return "";
  return name.split("|").pop().trim();
};

export const AppComponentsTable = ({
  mappedData,
  formatAppDisplay,
  onTagChange,
  onSaveTags,
}) => {
  const [csvMetricsMap, setCsvMetricsMap] = useState({});
  const [scoredData, setScoredData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const cleanCsvValue = (value) => {
    if (!value) return "";
    return value.replace(/^["']|["']$/g, "").trim();
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      alert("CSV has insufficient rows.");
      return;
    }

    const delimiter = lines[0].includes(",") ? "," : "\t";
    const headers = lines[0]
      .replace(/^\uFEFF/, "")
      .split(delimiter)
      .map((h) => cleanCsvValue(h).toLowerCase());

    const findColumnIndex = (key) =>
      headers.findIndex((h) =>
        h.replace(/\s+/g, "").includes(key.replace(/\s+/g, "").toLowerCase())
      );

    const appIndex = findColumnIndex("applicationname");
    const inputIndex = findColumnIndex("totalnumberofinputmessages");
    const cpuIndex = findColumnIndex("totalcputime");

    if (appIndex === -1 || inputIndex === -1 || cpuIndex === -1) {
      alert(
        "❌ Required columns not found!\n\n✔ Ensure your file contains:\n→ Application Name\n→ Total Number of Input Messages\n→ Total CPU Time\n\n🧩 Found headers:\n\n" +
          headers.join("\n")
      );
      return;
    }

    const summary = {};

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delimiter);
      if (cols.length < headers.length) continue;

      const rawApp = cleanCsvValue(cols[appIndex]);
      const inputMsgs = parseInt(cleanCsvValue(cols[inputIndex]).replace(/[^0-9]/g, "")) || 0;
      const totalCpu = parseInt(cleanCsvValue(cols[cpuIndex]).replace(/[^0-9]/g, "")) || 0;

      if (!rawApp) continue;
      const cleanApp = rawApp.trim();
      console.log(cleanApp)
      if (!summary[cleanApp]) {
        summary[cleanApp] = {
          totalInputMessages: 0,
          totalAvgCpuTime: 0,
        };
      }

      summary[cleanApp].totalInputMessages += inputMsgs;
      console.log("inputMsgs",inputMsgs)
      summary[cleanApp].totalAvgCpuTime += totalCpu;
      console.log("totalCpu",totalCpu)
    }
    console.log("📊 Final Summary per App:", summary);

    setCsvMetricsMap(summary);
    scoreApplications(summary);
  };

  const scoreApplications = (metricsMap) => {
  const apps = Object.entries(metricsMap).map(([name, data]) => ({
    name,
    messages: data.totalInputMessages,
    cpu: data.totalAvgCpuTime,
    intensity: data.totalInputMessages > 0
      ? data.totalAvgCpuTime / data.totalInputMessages
      : 0,
  }));

  const maxMessages = Math.max(...apps.map((app) => app.messages)) || 1;
  const maxCPU = Math.max(...apps.map((app) => app.cpu)) || 1;
  const maxIntensity = Math.max(...apps.map((app) => app.intensity)) || 1;

  const alpha = 1 / 3;
  const beta = 1 / 3;
  const gamma = 1 / 3;

  const scoredApps = apps.map((app) => {
    const mNorm = app.messages / maxMessages;
    const cNorm = app.cpu / maxCPU;
    const iNorm = app.intensity / maxIntensity;

    const score = Math.sqrt(
      alpha * Math.pow(mNorm, 2) +
      beta * Math.pow(cNorm, 2) +
      gamma * Math.pow(iNorm, 2)
    );

    return {
      ...app,
      activityScore: score,
    };
  });

  console.log("🚨 High Activity Apps (score ≥ threshold):");
  scoredApps.forEach(app => {
  console.log(app.activityScore);
});


  // 🔄 Use standard deviation only as threshold
  const scores = scoredApps.map((app) => app.activityScore);
  const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;
  const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const threshold = mean + 1.5 * stdDev;

  console.log("Threshold",threshold)


  const finalScoredData = {};
  scoredApps.forEach((app) => {
    finalScoredData[app.name] = {
      ...metricsMap[app.name],
      intensity: app.intensity,
      activityScore: app.activityScore,
      activityIndex: app.activityScore >= threshold ? "High" : "Low",
    };
  });

  setScoredData(finalScoredData);
};

  const getAppMetrics = (fullApp) => {
    if (!scoredData || Object.keys(scoredData).length === 0) return null;
    const appName = extractExactAppName(fullApp);
    if (!appName) return null;

    let metrics = scoredData[appName];
    if (!metrics) {
      const lowerAppName = appName.toLowerCase();
      const matchingKey = Object.keys(scoredData).find(
        (key) => key.toLowerCase() === lowerAppName
      );
      if (matchingKey) metrics = scoredData[matchingKey];
    }

    return metrics;
  };

  return (
    <div className="app-components-table-container">
      <h2 className="section-title">Applications and Components</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="csvUpload">Upload CSV:</label>{" "}
        <input type="file" accept=".csv,.txt" onChange={handleFileUpload} />
        {Object.keys(csvMetricsMap).length > 0 && (
          <span style={{ marginLeft: "1rem", color: "green" }}>
            ✅ CSV loaded ({Object.keys(csvMetricsMap).length} apps)
          </span>
        )}
      </div>

      {mappedData && mappedData.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Applications</th>
                <th>Components</th>
                <th>Score</th>
                <th>Policy Projects</th>
                <th>Shared Libraries</th>
                <th>Tag</th>
                <th>Total Input Messages</th>
                <th>Total CPU Time</th>
                <th>CPU Cost per message</th>
                <th>Activity Index</th>
              </tr>
            </thead>
            <tbody>
              {mappedData.map((row, index) => {
                const fullApp = row.app?.trim();
                const metrics = getAppMetrics(fullApp);

                return (
                  <tr key={`${fullApp}-${index}`} className={index % 2 === 0 ? "" : "alt-row"}>
                    <td>{formatAppDisplay(fullApp)}</td>
                    <td>{row.components}</td>
                    <td>{row.score}</td>
                    <td>{row.policyProjects}</td>
                    <td>{row.sharedLibraries}</td>
                    <td>
                      <input
                        type="text"
                        value={row.tag || ""}
                        onChange={(e) => onTagChange(index, e.target.value)}
                        placeholder="Add tag..."
                        className="tag-input"
                      />
                    </td>
                    <td>{metrics ? metrics.totalInputMessages : "-"}</td>
                    <td>{metrics ? Math.round(metrics.totalAvgCpuTime) : "-"}</td>
                    <td>
                      {metrics
                        ? metrics.intensity
                            .toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                              useGrouping: false,
                            })
                        : "-"}
                    </td>
                    <td>{metrics ? metrics.activityIndex : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button onClick={onSaveTags} className="save-tags-button">
            Save Tags
          </button>
        </>
      )}
    </div>
  );
};
