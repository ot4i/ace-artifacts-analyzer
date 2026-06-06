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
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import com.ibm.ace.artifacts.FileUtils.ZipFiles;
import com.ibm.ace.artifacts.report.FinalReport;
import com.ibm.ace.os.OS;

public class BackupFile extends Artifact {

	public BackupFile(String name, Path artifact_path, Path work_dir, Path output_dir, OS os, Logger logger) {
		super(name, ArtifactType.BACKUPZIPFILE, artifact_path, work_dir, output_dir, os, logger);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void optimize() {
		
		logger.info("Unzipping backup file: "+super.artifact_path+"\n\n");
		try {
			ZipFiles.unzip(super.artifact_path.toString(), work_dir.toString());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.log(Level.SEVERE,"Could not unzip node backup file");
			e.printStackTrace();
			System.exit(1);
		}
		
		List<Path> servers; 
		try {
			servers = Files.find(this.work_dir, 4,
					(path, attr) -> attr.isDirectory() && path.getParent().getFileName().toString().equals("servers")).collect(Collectors.toList());

			for (Path server : servers)
			{
				this.logger.info("ANALYZING INTEGRATION SERVER: "+server.getFileName()+"\n\n");
				super.analyzeBarOrServer(server);
			}
			
			try {
				FinalReport fr = new FinalReport(super.output_dir);
				String final_report_loc = fr.generate();
				this.logger.info("Final report written to: "+final_report_loc);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				logger.fine("Could not genreate final report for:"+super.name);
				e.printStackTrace();
			}
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.severe("Cannot find servers directory in backup file:"+artifact_path.getFileName());
			e.printStackTrace();
		}
			
	}

}
