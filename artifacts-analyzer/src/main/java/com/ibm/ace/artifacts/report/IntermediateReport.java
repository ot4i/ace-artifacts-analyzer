/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.artifacts.report;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class IntermediateReport {
	
	Path output_subdir;
	String bar_or_server_name;
	LinkedHashMap<String, Object> intermediate_report = new LinkedHashMap<>();
	
	public IntermediateReport(Path output_subdir)
	{
		this.output_subdir = output_subdir;
		this.bar_or_server_name = output_subdir.getFileName().toString();		
	}
	
	@SuppressWarnings("unchecked")
	public String generate() throws IOException
	{
		ObjectMapper mapper = new ObjectMapper();
		List<Path> app_reports = Files.find(this.output_subdir, 1,
				(path, attr) -> attr.isRegularFile() && path.toString().endsWith(".json")).collect(Collectors.toList());
		for (Path app_report : app_reports)
		{
			if (!Files.isHidden(app_report))
			{
				LinkedHashMap<String, Object> app_report_map = mapper.readValue(app_report.toFile(), new TypeReference<LinkedHashMap<String, Object>>() {});
				for (Map.Entry<String, Object> entry : app_report_map.entrySet())
				{
					if (entry.getValue() instanceof String)
					{
						this.intermediate_report.put(entry.getKey(), entry.getValue());
					}
					else if (entry.getValue() instanceof Integer)
					{
						if (this.intermediate_report.containsKey(entry.getKey()))
						{
							this.intermediate_report.put(entry.getKey(), (Integer) this.intermediate_report.get(entry.getKey()) + (Integer) entry.getValue());
						}
						else
						{
							this.intermediate_report.put(entry.getKey(), entry.getValue());
						}		
					}
					else if (entry.getValue() instanceof ArrayList)
					{
						if (this.intermediate_report.containsKey(entry.getKey()))
						{
							ArrayList<String> existing = (ArrayList<String>) this.intermediate_report.get(entry.getKey());
							existing.addAll((ArrayList<String>) entry.getValue());
						}
						else
						{
							this.intermediate_report.put(entry.getKey(), entry.getValue());
						}
					}
					else if (entry.getValue() instanceof LinkedHashMap)
					{
						if (this.intermediate_report.containsKey(entry.getKey()))
						{
							LinkedHashMap<String, ArrayList<String>> existing = (LinkedHashMap<String, ArrayList<String>>) this.intermediate_report.get(entry.getKey());
							for (Map.Entry<String, Object> sub_entry : ((Map<String, Object>) entry.getValue()).entrySet())
							{
								ArrayList<String> existing_sub_entry = (ArrayList<String>) existing.get(sub_entry.getKey());
								existing_sub_entry.addAll((ArrayList<String>) sub_entry.getValue());
							}
						}
						else
						{
							this.intermediate_report.put(entry.getKey(), entry.getValue());
						}
					}
				}
			}
		}
		this.intermediate_report.put("Input", this.bar_or_server_name);
		
		if(intermediate_report.containsKey("List of servers"))
			this.intermediate_report.put("List of servers", new ArrayList<String>(List.of(this.bar_or_server_name)));
		else if(intermediate_report.containsKey("List of bar files"))
			this.intermediate_report.put("List of bar files", new ArrayList<String>(List.of(this.bar_or_server_name)));
		
		// Write to .json file
        mapper.writerWithDefaultPrettyPrinter().writeValue(Paths.get(this.output_subdir.getParent().toString()+System.getProperty("file.separator")+bar_or_server_name+"_OptimizerReport.json").toFile(), this.intermediate_report);
        
		// Write to .txt file
        String output_file = this.output_subdir.getParent().toString()+System.getProperty("file.separator")+bar_or_server_name+"_OptimizerReport.txt";
		FileWriter writer = new FileWriter(output_file);
		for (Map.Entry<String, Object> entry : this.intermediate_report.entrySet())
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
}
