/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.artifacts.type;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Scanner;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.ace.artifacts.FileUtils.Directories;
import com.ibm.ace.artifacts.report.AppReport;
import com.ibm.ace.artifacts.report.IntermediateReport;
import com.ibm.ace.os.OS;

public abstract class Artifact {
    
	protected String name;
	protected ArtifactType artifact_type;
	protected Path artifact_path;
	protected Path work_dir;
    protected Path output_dir;
    protected OS os;
    protected Logger logger;
    
    public Artifact(String name, ArtifactType artifact_type, Path artifact_path, Path work_dir, Path output_dir, OS os, Logger logger) {
		super();
		this.name = name;
		this.artifact_path = artifact_path;
		this.artifact_type = artifact_type;
		this.work_dir = work_dir;
		this.output_dir = output_dir;
		this.os = os;
		this.logger = logger;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Path getArtifact_path() {
		return artifact_path;
	}

	public void setArtifact_path(Path artifact_path) {
		this.artifact_path = artifact_path;
	}
	
	private void checkConfigDir(Path bar_or_server)
	{
		try {
			Files.createDirectories(bar_or_server.resolve("config").resolve("common").resolve("log"));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			Files.createDirectories(bar_or_server.resolve("config").resolve("registry").resolve("integration_server"));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private boolean isValid(Path application)
	{
		try {
			if (Files.isDirectory(application) && !Files.isHidden(application))
			 {
				 if( Files.exists(application.resolve("application.descriptor")) || Files.exists(application.resolve("service.descriptor")) || Files.exists(application.resolve("restapi.descriptor")) )
					 return true;
				 else
					 return false;
			 }
			 else
				 return false;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
	}
	
	public void copyPolicyApps(Path bar_or_server, Path new_run_dir, Path new_run_app_dir)
	 {
		Pattern pattern=Pattern.compile("ConfigurableProperty override=\"\\{\\S+\\}:\\S+\"");
		Path broker_xml = new_run_app_dir.resolve("META-INF").resolve("broker.xml");
		if(Files.exists(broker_xml))
		{
			Scanner sc;
			try {
				sc = new Scanner(broker_xml);
				while (sc.hasNextLine())
				{
					String curr_line=sc.nextLine();
					Matcher matcher = pattern.matcher(curr_line);
					if(matcher.find())
					{
						String match=matcher.group();
						String policy=match.substring(match.indexOf("{")+1, match.indexOf("}"));
						//Copy the library
						Path from_dir = bar_or_server.resolve("run").resolve(policy);
						Path to_dir = new_run_dir.resolve(policy);
						Directories.copyDirectory(from_dir, to_dir);
					}
				}
			} catch (Exception e) {
				this.logger.fine("Error finding and copying policies for application: "+new_run_app_dir.getFileName()+"\n"+e.getMessage());
			}
		 }
	 }
	
	private void copySharedLib(Path bar_or_server, Path new_run_dir, Path new_run_app_dir)
	{
		Path application_descriptor=new_run_app_dir.resolve("application.descriptor");
		if(Files.exists(application_descriptor))
		{
			try {      
		        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance(); 
			    DocumentBuilder builder = factory.newDocumentBuilder();
			    Document xmldoc = builder.parse(application_descriptor.toFile());
			   
			    NodeList sharedLibraryReferences = xmldoc.getElementsByTagName("sharedLibraryReference");
			    //System.out.print("\tShared Libraries:"+sharedLibraryReferences.getLength());
			    for (int j = 0; j < sharedLibraryReferences.getLength(); j++) {
			    	Node lib = sharedLibraryReferences.item(j);
			    	//System.out.print("\t"+lib.getTextContent());
			    	 	
			    	//Copy the library
			    	Path from_dir = bar_or_server.resolve("run").resolve(lib.getTextContent());
			    	Path to_dir = new_run_dir.resolve(lib.getTextContent());
			    	Directories.copyDirectory(from_dir, to_dir);
					}		    	  
			    } catch (Exception e) {
			    	this.logger.warning("Error finding and copying shared libraries for application: "+new_run_app_dir.getFileName());
			    	e.printStackTrace();
		        }
		}
	}
	
	private Path createTemporaryWorkspace(Path application, Path bar_or_server) throws IOException
	{
		this.logger.fine("Creating temporary workspace for: "+application.getFileName());
		Path temp_dir = Files.createDirectory(bar_or_server.resolve(application.getFileName()));
		
		Path new_run_dir = Files.createDirectory(temp_dir.resolve("run"));
		Directories.copyDirectory(application, new_run_dir.resolve(application.getFileName()));
		
		Directories.copyDirectory(bar_or_server.resolve("config"), temp_dir.resolve("config"));
		
		Directories.copyDirectory(bar_or_server.resolve("overrides"), temp_dir.resolve("overrides"));
		
		Files.copy(bar_or_server.resolve("server.conf.yaml"), temp_dir.resolve("server.conf.yaml"));
		
		//copy policy apps
		copyPolicyApps(bar_or_server, new_run_dir, new_run_dir.resolve(application.getFileName()));
	    //copy shared libraries
		copySharedLib(bar_or_server, new_run_dir, new_run_dir.resolve(application.getFileName()));
		
		return temp_dir;
	}
	
	protected void analyzeBarOrServer(Path bar_or_server)
	{
		Path bar_or_server_output = Directories.createDirectory(this.output_dir,bar_or_server.getFileName().toString());
		checkConfigDir(bar_or_server);
		Path run_dir = bar_or_server.resolve("run");		
		try(Stream<Path> applications = Files.list(run_dir)) {
			for (Path application : (Iterable<Path>) applications::iterator) 
			{
				if(this.isValid(application))
				{
					Path temp_dir = null;
					try {
						temp_dir = this.createTemporaryWorkspace(application, bar_or_server);
						os.runIbmintOptimize(temp_dir);
						try {
							AppReport ar = new AppReport(application, this.artifact_type, bar_or_server.getFileName().toString());
							String report_loc = ar.generate(temp_dir.resolve("server.components.yaml"),bar_or_server_output);
							this.logger.fine("App report written to: "+report_loc);
						} catch (FileNotFoundException e) {
							logger.fine("Could not find server.components.yaml file for:"+application.getFileName());
							e.printStackTrace();
						}
					} catch (IOException e) {
						// TODO Auto-generated catch block
						logger.severe("Cannot create temporary workspace for:"+application.getFileName());
						e.printStackTrace();
						continue;
					}
					finally {
						Directories.deleteDirectory(temp_dir);
					}
				}
            }
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.severe("Cannot access applications in "+run_dir.toString());
			logger.info(run_dir.toString()+"exists: "+Files.isDirectory(run_dir));
			e.printStackTrace();
			return;
		}	
		
		// Analyzing report to create intermediate report
		try {
			IntermediateReport ir = new IntermediateReport(bar_or_server_output);
			String intermediate_report_loc = ir.generate();
			this.logger.fine("Intermediate report for " +bar_or_server.getFileName() + " written to: "+intermediate_report_loc);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.fine("Could not genreate intermediate report for:"+bar_or_server.getFileName());
			e.printStackTrace();
		}
		
	}
	abstract public void optimize();
   
}
