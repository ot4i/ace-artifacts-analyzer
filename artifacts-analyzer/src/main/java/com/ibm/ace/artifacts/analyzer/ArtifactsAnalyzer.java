/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.artifacts.analyzer;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Level;

import com.ibm.ace.artifacts.FileUtils.Directories;
import com.ibm.ace.artifacts.type.Artifact;
import com.ibm.ace.artifacts.type.ArtifactType;
import com.ibm.ace.artifacts.type.ArtifactTypeIdentifyer;
import com.ibm.ace.artifacts.type.BackupFile;
import com.ibm.ace.artifacts.type.BarFolder;
import com.ibm.ace.os.OS;
import com.ibm.ace.os.Linux;
import com.ibm.ace.os.MacOS;
import com.ibm.ace.os.Windows;

public class ArtifactsAnalyzer {
	private Path input_path;
	private Path output_path;
	private String mqsiprofile_path;
	private String artifact_name;
	private Artifact a;
	private Path work_dir;
    private Path output_dir;
    private Path log_file;
    private Logger logger;
    private FileHandler fileHandler;
    private OS os;
    
	public ArtifactsAnalyzer(String inputPath, String outputPath) throws FileNotFoundException {
		super();
		this.input_path = Paths.get(inputPath);
		this.output_path = Paths.get(outputPath);
		validatePaths();

		this.mqsiprofile_path = System.getenv("MQSIPROFILE_PATH");
        if (this.mqsiprofile_path == null || this.mqsiprofile_path.isBlank()) {
            throw new IllegalStateException("MQSIPROFILE_PATH environment variable is not set or is empty.");
        }

		this.logger = Logger.getLogger(this.getClass().getName());
	}

	private void validatePaths() throws FileNotFoundException
	{
		if(!Files.exists(this.input_path))
			throw new FileNotFoundException("Input file/directory \"" + this.input_path.toString() + "\" does not exist");
		
		if(!Files.isDirectory(this.output_path))
			throw new FileNotFoundException("Output directory \"" + this.output_path.toString() + "\" does not exist");
	}
	
	private void configureLogger() {
        this.logger.setUseParentHandlers(false); // Don't use default console handler

        // ConsoleHandler for main updates only
        ConsoleHandler consoleHandler = new ConsoleHandler();
        consoleHandler.setLevel(Level.INFO); // Only log INFO and above to console
        consoleHandler.setFormatter(new SimpleFormatter());

        // FileHandler for all logs
        try {
			this.fileHandler = new FileHandler(this.log_file.toString());
			this.fileHandler.setLevel(Level.ALL); // Log everything to file
	        this.fileHandler.setFormatter(new SimpleFormatter());

	        // Set logger level to lowest to allow all messages through
	        logger.setLevel(Level.ALL);

	        logger.addHandler(consoleHandler);
	        logger.addHandler(this.fileHandler);
		} catch (SecurityException | IOException e) {
			// TODO Auto-generated catch block
			System.out.println("Error setting up log file. Permission denied. Adding all logs to console itself");
			consoleHandler.setLevel(Level.ALL);
			e.printStackTrace();
		}
        
    }
	public boolean setup()
	{
		try {
			this.work_dir = Files.createTempDirectory(output_path, "Deployment_Planner_");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			System.out.println("Error creating temporary work directory at"+this.output_path);
			e.printStackTrace();
			return false;
		}
		
		this.output_dir = Directories.createDirectory(this.output_path, this.artifact_name);
		this.log_file=this.output_dir.resolve("optimize.log");
		this.configureLogger();
        
        String os = System.getProperty("os.name");
        if(os.startsWith("Mac"))
        {
        	this.os = new MacOS(this.mqsiprofile_path, this.logger);
        }
		else if(os.startsWith("Windows"))
        {
        	this.os = new Windows(this.mqsiprofile_path, this.logger);
        }
		else if(os.startsWith("Linux"))
        {
        	this.os = new Linux(this.mqsiprofile_path, this.logger);
        }
        return true;
	}
	
	public String analyze()
	{
		ArtifactType at = ArtifactTypeIdentifyer.getArtifactType(input_path);
        this.artifact_name = ArtifactTypeIdentifyer.getArtifactName(input_path);
        
        try {
			if(setup())
			{
				if (at == ArtifactType.BARFOLDER)
					this.a = new BarFolder(this.artifact_name, this.input_path, this.work_dir, this.output_dir, this.os,
							this.logger);
				else
					this.a = new BackupFile(this.artifact_name, this.input_path, this.work_dir, this.output_dir, this.os,
							this.logger);
				a.optimize();
			}
		} finally {
			// TODO: handle finally clause
			if (this.fileHandler != null) {
				this.fileHandler.close();
            }
			Directories.deleteDirectory(work_dir);						// TODO: Debug this
		}
		return this.output_dir.toString();
	}
}
