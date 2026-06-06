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

public class FinalReport {
	Path output_dir;
	String input;
	LinkedHashMap<String, Object> final_report = new LinkedHashMap<>();

	public FinalReport(Path output_dir)
	{
		this.output_dir = output_dir;	
		this.input = output_dir.getFileName().toString();
	}
	
	@SuppressWarnings("unchecked")
	public String generate() throws IOException
	{
		ObjectMapper mapper = new ObjectMapper();
		List<Path> intermediate_reports = Files.find(this.output_dir, 1,
				(path, attr) -> attr.isRegularFile() && path.toString().endsWith(".json")).collect(Collectors.toList());
		for (Path intermediate_report : intermediate_reports)
		{
			if (!Files.isHidden(intermediate_report))
			{
				LinkedHashMap<String, Object> app_report_map = mapper.readValue(intermediate_report.toFile(), new TypeReference<LinkedHashMap<String, Object>>() {});
				for (Map.Entry<String, Object> entry : app_report_map.entrySet())
				{
					if (entry.getValue() instanceof String)
					{
						this.final_report.put(entry.getKey(), entry.getValue());
					}
					else if (entry.getValue() instanceof Integer)
					{
						if (this.final_report.containsKey(entry.getKey()))
						{
							this.final_report.put(entry.getKey(), (Integer) this.final_report.get(entry.getKey()) + (Integer) entry.getValue());
						}
						else
						{
							this.final_report.put(entry.getKey(), entry.getValue());
						}		
					}
					else if (entry.getValue() instanceof ArrayList)
					{
						if (this.final_report.containsKey(entry.getKey()))
						{
							ArrayList<String> existing = (ArrayList<String>) this.final_report.get(entry.getKey());
							existing.addAll((ArrayList<String>) entry.getValue());
						}
						else
						{
							this.final_report.put(entry.getKey(), entry.getValue());
						}
					}
					else if (entry.getValue() instanceof LinkedHashMap)
					{
						if (this.final_report.containsKey(entry.getKey()))
						{
							LinkedHashMap<String, ArrayList<String>> existing = (LinkedHashMap<String, ArrayList<String>>) this.final_report.get(entry.getKey());
							for (Map.Entry<String, Object> sub_entry : ((Map<String, Object>) entry.getValue()).entrySet())
							{
								ArrayList<String> existing_sub_entry = (ArrayList<String>) existing.get(sub_entry.getKey());
								existing_sub_entry.addAll((ArrayList<String>) sub_entry.getValue());
							}
						}
						else
						{
							this.final_report.put(entry.getKey(), entry.getValue());
						}
					}
				}
			}
		}
		this.final_report.put("Input", this.input);
		
		// Write to .json file
        mapper.writerWithDefaultPrettyPrinter().writeValue(Paths.get(this.output_dir.toString()+System.getProperty("file.separator")+"Consolidated_"+this.input+"_OptimizerReport.json").toFile(), this.final_report);
        
		// Write to .txt file
        String output_file = this.output_dir.toString()+System.getProperty("file.separator")+"Consolidated_"+this.input+"_OptimizerReport.txt";
		FileWriter writer = new FileWriter(output_file);
		for (Map.Entry<String, Object> entry : this.final_report.entrySet())
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

