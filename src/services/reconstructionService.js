import { exec } from "child_process";

export const run3DPipeline = () => {
  return new Promise((resolve, reject) => {
    exec("sh scripts/runPipeline.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return reject(error);
      }

      console.log(stdout);
      resolve("Pipeline completed");
    });
  });
};