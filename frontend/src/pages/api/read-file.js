// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), '..', 'path.txt');
  const output_dir_path = fs.readFileSync(filePath, 'utf-8').replace(/[\r\n]+/gm, "");
  console.log(output_dir_path);
  const consolidated_report = fs.readdirSync(output_dir_path).filter(fn => fn.match('Consolidated_.*_OptimizerReport.txt'));
 
  if (consolidated_report.length === 0) {
    return res.status(404).json({ error: 'Consolidated report file not found' });
  }

  const filename = consolidated_report[0];
  const file = path.join(output_dir_path, filename);
  try {
    const fileContents = fs.readFileSync(file, 'utf-8');
    res.status(200).json({ filename, content: fileContents,output_dir_path });
  } catch (error) {
    res.status(500).json({ error: 'Error reading file' });
  }
}

