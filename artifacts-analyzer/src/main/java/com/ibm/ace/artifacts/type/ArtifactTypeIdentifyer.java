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
import java.util.stream.Stream;

public class ArtifactTypeIdentifyer {
	
	private ArtifactTypeIdentifyer() {
        throw new IllegalStateException("Utility class");
    }
	
	/*
	public static String getArtifactName(String zipPath) throws TAException {
        ZipType type = determineType(zipPath);
        if (type == ZipType.BACKUP) {
            return new Backup(zipPath).getNodeName();
        } else {
            return new BarFile(zipPath).getName();
        }
    }
	*/
	
	public static String getArtifactName(Path artifact_path) {
		String name = (artifact_path.getFileName()).toString();
		if (getArtifactType(artifact_path)==ArtifactType.BACKUPZIPFILE)
			name = name.substring(0, name.lastIndexOf('.'));
		return name;
	}
	
	public static ArtifactType getArtifactType(Path input_path) throws IllegalArgumentException
	{
		String extension = determineExtension(input_path.toString());
        if (extension.equals(".zip")) {
            return ArtifactType.BACKUPZIPFILE;
        } else if (Files.isDirectory(input_path)) {
        	Stream<Path> bar_file_paths;
			try {
				bar_file_paths = Files.list(input_path);
				if(bar_file_paths.anyMatch(file -> determineExtension(file.toString()).equals(".bar")))
	        		return ArtifactType.BARFOLDER;
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
        throw new IllegalArgumentException("Failed to identify artifact, please ensure the input file path ends with .zip if it's a backup, or is a valid directory path that contains atleast one .bar file.");
	}
	
	private static String determineExtension(String zipPath) {
        if (zipPath.lastIndexOf('.') != -1) {
            return zipPath.substring(zipPath.lastIndexOf('.'), zipPath.length());
        } else {
            return zipPath;
        }
    }
}
