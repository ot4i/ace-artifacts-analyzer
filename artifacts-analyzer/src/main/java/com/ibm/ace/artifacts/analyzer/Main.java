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

public class Main {
	public static void main(String args[])
	{
		ArtifactsAnalyzer analyzer;
		try {
			analyzer = new ArtifactsAnalyzer(args[0],args[1]);
			String output = analyzer.analyze();
			System.out.println("\nOutput written to "+output);
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
}
