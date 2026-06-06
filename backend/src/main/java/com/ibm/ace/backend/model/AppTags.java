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

public class AppTags {
    private String app;
    private String tag;
    private String sharedLibraries;
    private String policyProjects;
    private List<String> components;

    public AppTags() {}

    public AppTags(String app, String tag, String sharedLibraries,String policyProjects, List<String> components) {
        this.app = app;
        this.tag = tag;
        this.sharedLibraries = sharedLibraries;
        this.policyProjects  = policyProjects ;
        this.components = components;
    }

    public String getApp() {
        return app;
    }

    public void setApp(String app) {
        this.app = app;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getSharedLibraries() {
        return sharedLibraries;
    }

    public void setSharedLibraries(String sharedLibraries) {
        this.sharedLibraries = sharedLibraries;
    }
    
    public List<String> getComponents() {
        return components;
    }

    public void setComponents(List<String> components) {
        this.components = components;
    }

    public String getPolicyProjects() {
        return policyProjects;
    }

    public void setPolicyProjects(String policyProjects) {
        this.policyProjects = policyProjects;
    }
}