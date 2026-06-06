// Copyright (c) 2025 Open Technologies for Integration
// Licensed under the MIT license (see LICENSE for details)

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';  // Import Next.js Image component
import logo from '@/app/AppConnect_logo.jpg';  
import styles from "./home.module.css"; // CSS Module for styles

export default function Home() {
  const router = useRouter();
  const [inputPath, setInputPath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rightOutputPath, setRightOutputPath] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputPath && outputPath) {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:8080/ace-artifacts-deployment-planner/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputPath, outputPath }),
        });

        if (res.ok) {
          const message = await res.text();
          //console.log(message);
          router.push("/dashboard");
        } else {
          console.error("Server error");
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRightAction = async (e) => {
    e.preventDefault();
    if (rightOutputPath) {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:8080/ace-artifacts-deployment-planner/view-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rightOutputPath }),
        });

        if (res.ok) {
          const message = await res.text();
          //console.log(message);
          router.push("/dashboard");
        } else {
          console.error("Server error");
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
  {/* Header */}
  <div className={styles.header}>
    <div className={styles.logoText}>
      <Image
        src={logo}
        alt="Logo"
        width={40}
        height={40}
        style={{ objectFit: 'contain' }}
      />
      <h1 className={styles.appTitle}>IBM App Connect Enterprise</h1>
    </div>
  </div>

  <p className={styles.mainHeading}>ACE Artifacts Assessment and deployment planner</p>

    <div className={styles.mainContent}>
      {/* Left column: Form */}
      <div className={styles.leftColumn}>
        <div className={styles.formBox}>
          <p className={styles.boldText}>ANALYSE ARTIFACTS</p>
          <form onSubmit={handleSubmit}>
            <label>Input File</label>
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="Absolute path to the node backup or BAR folder"
              required
            />

            <label>Output Folder</label>
            <input
              type="text"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              placeholder="Absolute path to the folder to store the final report"
              required
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    
    <p className={styles.orText}>OR</p>

      {/* Right column: Additional input */}
      <div className={styles.rightColumn}>
        <div className={styles.formBox}>
          <p className={styles.boldText}>REVIEW PRE-GENERATED REPORT</p>
        <form onSubmit={handleRightAction}>
        <label>Report Path</label>
          <input
            type="text"
            value={rightOutputPath}
            onChange={(e) => setRightOutputPath(e.target.value)}
            placeholder="Absolute path to the historical report"
            style={{ marginBottom: "1rem" }}
          />

          <button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit"}
            </button>
            </form>
        </div>
      </div>
    </div>
  </div>
  );
}


// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from 'next/image';
// import logo from '@/app/AppConnect_logo.jpg';
// import styles from "./home.module.css";

// export default function Home() {
//   const router = useRouter();
//   const [inputPath, setInputPath] = useState("");
//   const [outputPath, setOutputPath] = useState("");
//   const [rightOutputPath, setRightOutputPath] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

// const pickFolder = async (setPathFn, setFileTextFn) => {
//   try {
//     const dirHandle = await window.showDirectoryPicker();
//     setPathFn(dirHandle.name); // Only sets folder name (not full path)

//     const pattern = /^Consolidated_.*_OptimizerReport\.txt$/i;

//     for await (const entry of dirHandle.values()) {
//       if (entry.kind === "file" && pattern.test(entry.name)) {
//         const file = await entry.getFile();
//         const content = await file.text();

//         console.log("✅ Found matching file:", entry.name);
//         console.log("📄 File content:\n", content);

//         if (setFileTextFn) setFileTextFn(content);

//         break; // Stop after first match
//       }
//     }
//   } catch (error) {
//     console.error("❌ Folder selection canceled or failed:", error);
//   }
// };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (inputPath && outputPath) {
//       setIsLoading(true);
//       try {
//         const res = await fetch("http://localhost:8080/ace-artifacts-deployment-planner/analyze", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ inputPath, outputPath }),
//         });

//         if (res.ok) {
//           const message = await res.text();
//           router.push("/dashboard");
//         } else {
//           console.error("Server error");
//         }
//       } catch (error) {
//         console.error("Network error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleRightAction = async (e) => {
//     e.preventDefault();
//     if (rightOutputPath) {
//       setIsLoading(true);
//       try {
//         const res = await fetch("http://localhost:8080/ace-artifacts-deployment-planner/view-results", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ rightOutputPath }),
//         });

//         if (res.ok) {
//           const message = await res.text();
//           router.push("/dashboard");
//         } else {
//           console.error("Server error");
//         }
//       } catch (error) {
//         console.error("Network error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <div className={styles.container}>
//       {/* Header */}
//       <div className={styles.header}>
//         <div className={styles.logoText}>
//           <Image src={logo} alt="Logo" width={40} height={40} style={{ objectFit: 'contain' }} />
//           <h1 className={styles.appTitle}>IBM App Connect Enterprise</h1>
//         </div>
//       </div>

//       <p className={styles.mainHeading}>ACE Artifacts Assessment and deployment planner</p>

//       <div className={styles.mainContent}>
//         {/* Left Column */}
//         <div className={styles.leftColumn}>
//           <div className={styles.formBox}>
//             <p className={styles.boldText}>ANALYSE ARTIFACTS</p>
//             <form onSubmit={handleSubmit}>
//               <label>Choose Input Folder</label>
//               <button type="button" onClick={() => pickFolder(setInputPath)}>Browse Input Folder</button>
//               <input
//                 type="text"
//                 value={inputPath}
//                 placeholder="Selected input folder"
//                 readOnly
//               />

//               <label>Choose Output Folder</label>
//               <button type="button" onClick={() => pickFolder(setOutputPath)}>Browse Output Folder</button>
//               <input
//                 type="text"
//                 value={outputPath}
//                 placeholder="Selected output folder"
//                 readOnly
//               />

//               <button type="submit" disabled={isLoading}>
//                 {isLoading ? "Processing..." : "Submit"}
//               </button>
//             </form>
//           </div>
//         </div>

//         <p className={styles.orText}>OR</p>

//         {/* Right Column */}
//         <div className={styles.rightColumn}>
//           <div className={styles.formBox}>
//             <p className={styles.boldText}>REVIEW PRE-GENERATED REPORT</p>
//             <form onSubmit={handleRightAction}>
//               <label>Choose Report Folder</label>
//               <button type="button" onClick={() => pickFolder(setRightOutputPath)}>Browse Report Folder</button>
//               <input
//                 type="text"
//                 value={rightOutputPath}
//                 placeholder="Selected report folder"
//                 style={{ marginBottom: "1rem" }}
//                 readOnly
//               />

//               <button type="submit" disabled={isLoading}>
//                 {isLoading ? "Processing..." : "Submit"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

