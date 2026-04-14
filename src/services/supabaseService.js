import fs from "fs";
import path from "path";
import { supabase } from "../config/supabase.js";

// Upload GLB
// export const uploadGLB = async (filePath) => {
//   const file = fs.readFileSync(filePath);
//   const fileName = path.basename(filePath);

//   const { error } = await supabase.storage
//     .from("models")
//     .upload(fileName, file, {
//       contentType: "model/gltf-binary",
//     });

//   if (error) throw error;

//   const { data } = supabase.storage
//     .from("models")
//     .getPublicUrl(fileName);

//   return data.publicUrl;
// };

export const uploadGLB = async (filePath) => {
  const file = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const { error } = await supabase.storage
    .from("models")
    .upload(fileName, file, {
      contentType: "model/gltf-binary",
      upsert: true, // 🔥 ADD THIS
    });

  if (error) {
    console.error("❌ Upload Error:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from("models")
    .getPublicUrl(fileName);

  console.log("☁️ Public URL:", data.publicUrl); // ✅ DEBUG

  return data.publicUrl;
};

// ✅ Create scan
export const createScanRecord = async (data) => {
  const { data: scan, error } = await supabase
    .from("scans")
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return scan;
};

// ✅ Update scan (NEW)
export const updateScanRecord = async (id, data) => {
  const { error } = await supabase
    .from("scans")
    .update(data)
    .eq("id", id);

  if (error) throw error;
};