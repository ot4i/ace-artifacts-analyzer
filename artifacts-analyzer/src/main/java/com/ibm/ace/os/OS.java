/********************************************************* {COPYRIGHT-TOP} ***
* Copyright 2025 IBM Corporation
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the MIT License
* which accompanies this distribution, and is available at
* http://opensource.org/licenses/MIT
********************************************************** {COPYRIGHT-END} **/

package com.ibm.ace.os;

import java.nio.file.Path;

public interface OS {
	
	public void mqsicreateworkdir(Path work_dir);
	
	public void ibmintdeploy(Path bar_file, Path work_dir);

	public void runIbmintOptimize(Path work_dir);
}
