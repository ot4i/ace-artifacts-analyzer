/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.artifacts.type;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import com.ibm.ace.artifacts.FileUtils.Directories;
import com.ibm.ace.artifacts.report.FinalReport;
import com.ibm.ace.os.OS;

public class BarFolder extends Artifact {

	public BarFolder(String name, Path artifact_path, Path work_dir, Path output_dir, OS os, Logger logger) {
		super(name, ArtifactType.BARFOLDER, artifact_path, work_dir, output_dir, os, logger);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void optimize() {
		
		List<Path> bars; 
		try {
			bars = Files.find(super.artifact_path, 1,
					(path, attr) -> attr.isRegularFile() && path.getFileName().toString().endsWith(".bar")).collect(Collectors.toList());

			for (Path bar : bars)
			{
				String bar_name = bar.getFileName().toString().contains(".")
			            ? bar.getFileName().toString().substring(0, bar.getFileName().toString().lastIndexOf('.'))
			                    : bar.getFileName().toString();
				Path bar_dir = super.work_dir.resolve(bar_name);
				os.mqsicreateworkdir(bar_dir);
				if(Files.isDirectory(bar_dir))
				{
					os.ibmintdeploy(bar, bar_dir);
					this.logger.info("ANALYZING bar file: "+bar.getFileName()+"\n\n");
					super.analyzeBarOrServer(bar_dir);
					Directories.deleteDirectory(bar_dir);
				}
				else
					this.logger.info("mqsicreateworkdir failed to create directory - " + bar_dir.toString());
			}
			
			try {
				FinalReport fr = new FinalReport(super.output_dir);
				String final_report_loc = fr.generate();
				this.logger.info("Final report written to: "+final_report_loc);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				logger.info("Could not genreate final report for:"+super.name);
				e.printStackTrace();
			}
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.severe("Cannot find servers directory in backup file:"+artifact_path.getFileName());
			e.printStackTrace();
		}
			
	}


}
