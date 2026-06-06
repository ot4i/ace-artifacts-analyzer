/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.backend.controller;

import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;

import org.springframework.web.bind.annotation.*;

import com.ibm.ace.backend.model.AnalyzeModel;
import com.ibm.ace.backend.model.ViewResultModel;
import com.ibm.ace.artifacts.analyzer.ArtifactsAnalyzer;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/ace-artifacts-deployment-planner")
public class AnalyzeController {
	@PostMapping("/analyze")
	public String processFiles(@RequestBody AnalyzeModel paths) {
        String input_path = paths.getInputPath().replaceAll("^\"|\"$", "");
        String output_path = paths.getOutputPath().replaceAll("^\"|\"$", "");
        String result = null;
        // TODO Run the analyze file from artifact-analyzer/target
        ArtifactsAnalyzer analyzer;
		try {
			analyzer = new ArtifactsAnalyzer(input_path, output_path);
			result = analyzer.analyze();
			
			try {
	            FileWriter writer = new FileWriter("../path.txt"); // Adjust path if needed
	            writer.write(result);
	            writer.close();
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "Error writing to file.";
	        }
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return result;
		//return "Files processed and written to " + result;
    }

	@PostMapping("/view-results")
	public String Analyze(@RequestBody ViewResultModel paths) {
	    String result_path = paths.getRightOutputPath().replaceAll("^\"|\"$", "");
	    // TODO Run the jar file from artifact-analyzer/target
	    // :printer: Print the received paths in the server console
	    System.out.println("Received paths:");
	    System.out.println("Output Path: " + result_path);
	    //return "Files processed and written to " + "/Users/spoorti/Downloads/ACE1209_250213_183308";
	    try {
	    FileWriter writer = new FileWriter("../path.txt"); // Adjust path if needed
	    writer.write(result_path);
	    writer.close();
	} catch (IOException e) {
	    e.printStackTrace();
	    return "Error writing to file.";
	}
	return result_path;
	}
}
