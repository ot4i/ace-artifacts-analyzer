/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.artifacts.report;

import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.yaml.snakeyaml.Yaml;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.ibm.ace.artifacts.type.ArtifactType;

public class AppReport {
	
	Path app_dir;
	String input_file;
	String app_name;
	LinkedHashMap<String, Object> report = new LinkedHashMap<>();

	public AppReport(Path app, ArtifactType artifact_type, String bar_or_server) throws IOException
	{
		this.app_dir = app;
		this.input_file = app.getFileName().toString();
		this.app_name = bar_or_server+'|' + this.input_file;
		
		this.report.put("Type", artifact_type.toString());
		this.report.put("Input", this.input_file);
		if(artifact_type==ArtifactType.BACKUPZIPFILE)
			this.report.put("List of servers",new ArrayList<String>());
		else if(artifact_type==ArtifactType.BARFOLDER)
			this.report.put("List of bar files",new ArrayList<String>());
		this.report.put("List of apps", new ArrayList<String>(List.of(app_name)));
		this.report.put("Count", 1);
		ArrayList<String> PolicyProject = findPolicyProjects();
		if(PolicyProject.isEmpty())
			this.report.put("Policy Projects",new ArrayList<String>());
		else
			this.report.put("Policy Projects", new ArrayList<String>(List.of(this.app_name+" = "+PolicyProject)) );
		ArrayList<String> SharedLibrary = findSharedLibraries();
		if(SharedLibrary.isEmpty())
			this.report.put("Shared Libraries",new ArrayList<String>());
		else
			this.report.put("Shared Libraries", new ArrayList<String>(List.of(this.app_name+" = "+SharedLibrary)) );
	}

	@SuppressWarnings("unchecked")
	public String generate(Path yaml_file, Path target_dir) throws IOException
	{
		Yaml yaml = new Yaml();
		try (InputStream inputStream = new FileInputStream(yaml_file.toString()))
		{
			LinkedHashMap<String, Object> yaml_obj = yaml.load(inputStream);
			
	        for (Map.Entry<String, Object> entry : yaml_obj.entrySet()) 
	        {
	        	if(!entry.getKey().equals("optimizeComponents") 
	        			&& !entry.getKey().equals("optimizeVersion")
	        			&& !entry.getKey().equals("reportExcludedComponents")
	        			&& !entry.getKey().equals("serverComponentsVersion"))
	        	{
	        		if(entry.getValue().equals(true))
			    	{
			    		this.report.put(entry.getKey(), new ArrayList<String>(List.of(app_name)));
			    	}
			    	else
			    	{
			    		this.report.put(entry.getKey(), new ArrayList<String>());
			    	}
	        	}
	            if (entry.getValue() instanceof Map) {
	                Map<String, Object> temp = new LinkedHashMap<>();
					for (Map.Entry<String, Object> sub_entry : ((Map<String, Object>) entry.getValue()).entrySet())
	                {
	                	if(sub_entry.getValue().equals(true))
	                	{
	                		temp.put(sub_entry.getKey(), new ArrayList<String>(List.of(app_name)));
	                	}
	                	else
	                	{
	                		temp.put(sub_entry.getKey(), new ArrayList<String>());
	                	}
	                }
					// Add Database_ODBC and http to nodes group
	            	if(entry.getKey().equals("Nodes"))
	        		{
	        			if (this.database_check(this.app_dir)) 
	        				temp.put("Database_ODBC", new ArrayList<String>(List.of(app_name)));
	        			else
	        				temp.put("Database_ODBC", new ArrayList<String>());
	        		
	        			if (this.http_check(this.app_dir)) 
	        				temp.put("Http", new ArrayList<String>(List.of(app_name)));
	        			else
	        				temp.put("Http", new ArrayList<String>());
	        		}
	                this.report.put(entry.getKey(), temp);
	            }
	        }
	        
	        // Add SSL
	        if(this.sslCheck(this.app_dir, this.http_check(this.app_dir), ((Map<String, Object>) yaml_obj.get("JavaNodes")).get("SOAP").equals(true), ((Map<String, Object>) yaml_obj.get("Nodes")).get("REST").equals(true), ((Map<String, Object>) yaml_obj.get("JavaNodes")).get("Kafka").equals(true), ((Map<String, Object>) yaml_obj.get("JavaNodes")).get("TCPIP").equals(true))) 
				this.report.put("SSL", new ArrayList<String>(List.of(app_name)));
			else
				this.report.put("SSL", new ArrayList<String>());
	        
		}
		
        // Write to .json file
        ObjectMapper mapper = new ObjectMapper();
		mapper.writerWithDefaultPrettyPrinter().writeValue(Paths.get(target_dir.toString()+ System.getProperty("file.separator")+this.input_file+".json").toFile(), this.report);
		
		// Write to .txt file
        String output_file = target_dir.toString()+ System.getProperty("file.separator")+this.input_file+".txt";
		FileWriter writer = new FileWriter(output_file);
		for (Map.Entry<String, Object> entry : this.report.entrySet())
        {
        	if (entry.getValue() instanceof Map) 
        	{
        		for (Map.Entry<String, Object> sub_entry : ((Map<String, Object>) entry.getValue()).entrySet())
        		{
        			writer.write(entry.getKey()+"_"+sub_entry.getKey()+": "+sub_entry.getValue());
        			writer.write(System.getProperty("line.separator"));
        		}
        	}
        	else
        	{
        		writer.write(entry.getKey()+": "+entry.getValue());
        		writer.write(System.getProperty("line.separator"));
        	}
        }
        writer.flush();
        writer.close();
		return output_file;
	}
	
	public ArrayList<String> findPolicyProjects()
	 {
		ArrayList<String> PolicyProject = new ArrayList<String>();
		Pattern pattern=Pattern.compile("ConfigurableProperty override=\"\\{\\S+\\}:\\S+\"");
		Path broker_xml = this.app_dir.resolve("META-INF").resolve("broker.xml");
		if(Files.exists(broker_xml))
		{
			try {
				Scanner sc = new Scanner(broker_xml);
				while (sc.hasNextLine())
				{
					String curr_line=sc.nextLine();
					Matcher matcher = pattern.matcher(curr_line);
					if(matcher.find())
					{
						String match=matcher.group();
						String policy=match.substring(match.indexOf("{")+1, match.indexOf("}"));
						//add the policy to array
						PolicyProject.add(policy);						
					}
				}
				sc.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		 }
		return PolicyProject;
	 }
	
	private ArrayList<String> findSharedLibraries()
	{
		ArrayList<String> SharedLibrary = new ArrayList<String>();
		Path application_descriptor=this.app_dir.resolve("application.descriptor");
		if(Files.exists(application_descriptor))
		{
			try {      
		        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance(); 
			    DocumentBuilder builder = factory.newDocumentBuilder();
			    Document xmldoc = builder.parse(application_descriptor.toFile());
			   
			    NodeList sharedLibraryReferences = xmldoc.getElementsByTagName("sharedLibraryReference");
			    //System.out.print("\tShared Libraries:"+sharedLibraryReferences.getLength());
			    for (int j = 0; j < sharedLibraryReferences.getLength(); j++) 
			    {
			    	Node lib = sharedLibraryReferences.item(j);
			    	//System.out.print("\t"+lib.getTextContent()); 	
			    	//add the library to array
			    	SharedLibrary.add(lib.getTextContent());		
				}		    	  
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return SharedLibrary;
	}
	
	private boolean ssl_check_helper(Path app, String s)
	{
		Pattern pattern=Pattern.compile(s);
		//System.out.println(curr_app);
		List<Path> flow_Files;
		try {
			flow_Files = Files.find(app,
					Integer.MAX_VALUE,
					(p, basicFileAttributes) ->{
						return p.getFileName().toString().endsWith(".msgflow") || p.getFileName().toString().endsWith(".subflow");
						}).collect(Collectors.toList());
			for(Path flow_File : flow_Files)
			{
				//System.out.println(app_file.getName());
				Scanner sc = new Scanner(flow_File);
				while (sc.hasNextLine())
		        {
		        	String temp=sc.nextLine();
		        	if(pattern.matcher(temp).find())
		        	{
		        		sc.close();
		        		return true;
		        	}	            			        
		        }
				sc.close();
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	
	private boolean sslCheck(Path app, boolean http, boolean soap, boolean rest, boolean kafka, boolean tcpip)
	{
		Path restapi_descriptor=app.resolve("restapi.descriptor");
		if(http || Files.exists(restapi_descriptor))
		{
			return ssl_check_helper(app,"ComIbmWSInput.*useHTTPS=\"true\"");
		}
		if(soap)
		{
			return ssl_check_helper(app,"ComIbmSOAPInput.*useHTTPS=\"true\"");
		}
		if(rest)
		{
			return ssl_check_helper(app,"ComIbmWSInput.*useHTTPS=\"true\"");
		}
		if(kafka)
		{
			return ssl_check_helper(app,"com_ibm_connector_kafka.*securityProtocol=\"SSL\"") || ssl_check_helper(app,"com_ibm_connector_kafka.*securityProtocol=\"SASL_SSL\"");
		}
		if(tcpip)
		{
			Pattern pattern=Pattern.compile("<SSLProtocol>[\\S\\s]+[\\S]+</SSLProtocol>");
			List<Path> policyxml_Files;
			try {
				policyxml_Files = Files.find(app,
						Integer.MAX_VALUE,
						(p, basicFileAttributes) ->{
							return p.getFileName().toString().endsWith(".policyxml");
							}).collect(Collectors.toList());
				for(Path policyxml_File : policyxml_Files)
				{
					Scanner sc = new Scanner(policyxml_File);
					while (sc.hasNextLine())
			        {
			        	String temp=sc.nextLine();
			        	if(pattern.matcher(temp).find())
			        	{
			        		sc.close();
			        		return true;
			        	}	            			        
			        }
					sc.close();
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return false;
	}
	
	private boolean http_check(Path app)
	{
		Path application_descriptor=app.resolve("application.descriptor");
		Path library_descriptor=app.resolve("library.descriptor");
		//System.out.println(curr_app);
		if(Files.exists(application_descriptor) || Files.exists(library_descriptor))
		{
			return ssl_check_helper(app,"ComIbmWSInput");
		}
		return false;
	}
	
	private boolean database_check(Path app)
	{
		return ssl_check_helper(app,"dataSource=\"\\S+\"");
	}

}
