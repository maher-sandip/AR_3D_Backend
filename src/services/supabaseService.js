import fs from "fs";
import { supabase } from "../config/supabase.js";

// Upload GLB to storage
export const uploadGLB = async (filePath) => {
  const file = fs.readFileSync(filePath);
  const fileName = filePath.split("/").pop();

  const { error } = await supabase.storage
    .from("models")
    .upload(fileName, file, {
      contentType: "model/gltf-binary",
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("models")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// Save scan record
export const createScanRecord = async (data) => {
  const { error } = await supabase
    .from("scans")
    .insert([data]);

  if (error) throw error;
};