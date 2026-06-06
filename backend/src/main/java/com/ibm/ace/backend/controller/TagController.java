/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.backend.controller;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ibm.ace.backend.model.AppTags;
import com.ibm.ace.backend.model.TagSaveRequest;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class TagController {

    @PostMapping("/save-tags")
public ResponseEntity<String> saveTags(@RequestBody TagSaveRequest request) {
    List<AppTags> tags = request.getTags();
    String outputDirPath = request.getOutput_dir_path().replaceAll("^\"|\"$", "");
    String fileType = request.getFile_type();
    String filePath = outputDirPath + System.getProperty("file.separator") + "tags_output.txt";

    try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
        writer.write("Type: " + fileType);
        writer.newLine();
        for (AppTags tag : tags) {
            String componentsFormatted = tag.getComponents() != null
                ? tag.getComponents().toString()
                : "[]";

            writer.write("Application: " + tag.getApp()
                    + " | Tag: " + tag.getTag()
                    + " | Components: " + componentsFormatted
                    + " | Shared lib: " + tag.getSharedLibraries()
                    + " | Policy Project: " + tag.getPolicyProjects());
            writer.newLine();
        }
    } catch (IOException e) {
        return ResponseEntity.status(500).body("Failed to write tags: " + e.getMessage());
    }

    return ResponseEntity.ok("Tags saved successfully to " + filePath);
}


    @GetMapping("/fetch-tags")
public ResponseEntity<List<AppTags>> fetchTags(@RequestParam("outputDirPath") String outputDirPath) {
    String filePath = outputDirPath + System.getProperty("file.separator") + "tags_output.txt";
    File file = new File(filePath);

    if (!file.exists()) {
        return ResponseEntity.status(404).body(new ArrayList<>());
    }

    List<AppTags> tagsList = new ArrayList<>();

    try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.startsWith("Application: ")) {
                String[] parts = line.split(" \\| ");
                String app = "", tag = "", shared = "", policy = "";
                List<String> components = new ArrayList<>();

                for (String part : parts) {
                    if (part.startsWith("Application: ")) {
                        app = part.replace("Application: ", "").trim();
                    } else if (part.startsWith("Tag: ")) {
                        tag = part.replace("Tag: ", "").trim();
                    } else if (part.startsWith("Shared lib: ")) {
                        shared = part.replace("Shared lib: ", "").trim();
                    }else if (part.startsWith("Policy Project: ")) {
                        policy = part.replace("Policy Project: ", "").trim(); 
                    }else if (part.startsWith("Components: ")) {
                        String compStr = part.replace("Components: ", "").trim();
                        compStr = compStr.replaceAll("[\\[\\]]", ""); // remove [ and ]
                        if (!compStr.isEmpty()) {
                            String[] compArr = compStr.split(",");
                            for (String c : compArr) {
                                components.add(c.trim());
                            }
                        }
                    }
                }

                tagsList.add(new AppTags(app, tag, shared, policy, components));
            }
        }
    } catch (IOException e) {
        return ResponseEntity.status(500).build();
    }

    return ResponseEntity.ok(tagsList);
}

}