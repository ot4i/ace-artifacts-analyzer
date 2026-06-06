/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.backend.model;

import java.util.List;

public class TagSaveRequest {
    private List<AppTags> tags;
    private String output_dir_path;
    private String file_type;
    private List<String> components;

    public List<AppTags> getTags() {
        return tags;
    }

    public void setTags(List<AppTags> tags) {
        this.tags = tags;
    }

    public String getOutput_dir_path() {
        return output_dir_path;
    }

    public void setOutput_dir_path(String output_dir_path) {
        this.output_dir_path = output_dir_path;
    }

    public String getFile_type() {
        return file_type;
    }

    public void setFile_type(String file_type) {
        this.file_type = file_type;
    }

    public List<String> getComponents() {
    return components;
    }

    public void setComponents(List<String> components) {
        this.components = components;
    }

}