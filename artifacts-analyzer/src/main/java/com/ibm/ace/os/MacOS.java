/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.os;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.logging.Logger;

public class MacOS implements OS {
	private String mqsiprofile_path;
	private Logger logger;
	private String base_command;

	public MacOS(String mqsiprofile_path, Logger logger) {
		super();
		this.mqsiprofile_path = mqsiprofile_path;
		this.logger = logger;
		this.base_command = ". \""+this.mqsiprofile_path+"\"";
	}
	
	@Override
	public void mqsicreateworkdir(Path work_dir)
	{
		String command = base_command.concat(" &&  mqsicreateworkdir \""+work_dir.toString()+"\"");
		//System.out.println("base_command = " + base_command + " |  command = " + command);
		//this.logger.fine(command);
		ProcessBuilder builder = new ProcessBuilder("bash", "-c", command);
        builder.redirectErrorStream(true);
        Process process;
		try {
			process = builder.start();
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			StringBuilder output = new StringBuilder();
		    String line;
		    while ((line = reader.readLine()) != null) {
		        output.append(line).append(System.lineSeparator());
		    }
			// Wait for the process to complete and get its exit value
		    int exitCode = process.waitFor();
		    //System.out.println("Process exited with code: " + exitCode);
		    //this.logger.fine("Process exited with code: " + exitCode);
			reader.close();
	        this.logger.fine(output.toString());
		} catch (IOException | InterruptedException e) {
			// TODO Auto-generated catch block
			this.logger.severe("Error running mqsicreateworkdir command for directory: "+work_dir.getFileName());
			e.printStackTrace();
		}
	}
	
	@Override
	public void ibmintdeploy(Path bar_file, Path work_dir) {
		String command = base_command.concat(" &&  ibmint deploy --input-bar-file \""+bar_file.toString()+"\" --output-work-directory \""+work_dir.toString()+"\"");
		//System.out.println("base_command = " + base_command + " |  command = " + command);
		//this.logger.fine(command);
		ProcessBuilder builder = new ProcessBuilder("bash", "-c", command);
        builder.redirectErrorStream(true);
        Process process;
		try {
			process = builder.start();
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			StringBuilder output = new StringBuilder();
		    String line;
		    while ((line = reader.readLine()) != null) {
		        output.append(line).append(System.lineSeparator());
		    }
			// Wait for the process to complete and get its exit value
		    int exitCode = process.waitFor();
		    //System.out.println("Process exited with code: " + exitCode);
		    //this.logger.fine("Process exited with code: " + exitCode);
			reader.close();
	        this.logger.fine(output.toString());
		} catch (IOException | InterruptedException e) {
			// TODO Auto-generated catch block
			this.logger.severe("Error running ibmint deploy command for bar file: "+bar_file);
			e.printStackTrace();
		}
	}

	@Override
	public void runIbmintOptimize(Path work_dir) {
		String command = base_command.concat(" &&  ibmint optimize server --work-directory \""+work_dir.toString()+"\"");
		//System.out.println("base_command = " + base_command + " |  command = " + command);
		//this.logger.fine(command);
		ProcessBuilder builder = new ProcessBuilder("bash", "-c", command);
        builder.redirectErrorStream(true);
        Process process;
		try {
			process = builder.start();
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			StringBuilder output = new StringBuilder();
		    String line;
		    while ((line = reader.readLine()) != null) {
		        output.append(line).append(System.lineSeparator());
		    }
			// Wait for the process to complete and get its exit value
		    int exitCode = process.waitFor();
		    //System.out.println("Process exited with code: " + exitCode);
		    //this.logger.fine("Process exited with code: " + exitCode);
			reader.close();
	        this.logger.fine(output.toString());
		} catch (IOException | InterruptedException e) {
			// TODO Auto-generated catch block
			this.logger.severe("Error running ibmint optimize server command for application: "+work_dir.getFileName());
			e.printStackTrace();
		}
	}

}
