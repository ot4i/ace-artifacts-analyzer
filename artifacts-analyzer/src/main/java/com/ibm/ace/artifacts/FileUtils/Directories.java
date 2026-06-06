/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.artifacts.FileUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Directories {
	public static Path createDirectory(Path p, String directoryName) {
        Path newDir = p.resolve(directoryName);

        // Delete the directory if it exists
        deleteDirectory(newDir);

        // Create the new directory
        try {
            Files.createDirectories(newDir);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return newDir;
    }
	
	public static void deleteDirectory(Path directory) {
        if (Files.exists(directory)) {
            try {
                Files.walk(directory)
                        .sorted(java.util.Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
	
	public static void copyDirectory(Path sourceDirectoryLocation, Path destinationDirectoryLocation) throws IOException 
	{
		Files.walk(sourceDirectoryLocation)
		  .forEach(source -> {
		      Path destination = Paths.get(destinationDirectoryLocation.toString(), source.toString()
		        .substring(sourceDirectoryLocation.toString().length()));
		      try {
		          Files.copy(source, destination);
		      } catch (IOException e) {
		          e.printStackTrace();
		      }
		  });
	}
	
	public static void CleanupOnExit(Path dirToDelete) {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
        	// Delete the directory if it exists
            deleteDirectory(dirToDelete);
        }));
    }
}
