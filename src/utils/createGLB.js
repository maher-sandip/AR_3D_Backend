import fs from "fs";
import sharp from "sharp";
import { Document, NodeIO } from "@gltf-transform/core";
import { KHRMaterialsUnlit } from "@gltf-transform/extensions";

export const createGLBFromImage = async (imagePath, glbPath) => {
  console.log("📸 Creating GLB from image:", imagePath);

  // 1️⃣ Resize & compress image
  const imageBuffer = await sharp(imagePath)
    .resize(512, 512, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 2️⃣ Create GLTF Document
  const document = new Document();
  const root = document.getRoot();
  document.createExtension(KHRMaterialsUnlit);

  // 3️⃣ Texture
  const texture = document
    .createTexture("dishTexture")
    .setImage(imageBuffer)
    .setMimeType("image/jpeg");

  // 4️⃣ Material
  const material = document
    .createMaterial("dishMaterial")
    .setBaseColorTexture(texture)
    .setDoubleSided(true)
    .setRoughnessFactor(0.8)
    .setMetallicFactor(0.0);

  // 5️⃣ Geometry (Cylinder / Plate)
  const segments = 32;
  const radius = 1.0;
  const height = 0.15;

  const positions = [];
  const uvs = [];
  const indices = [];
  const normals = [];

  // 🔹 Top center
  positions.push(0, height, 0);
  uvs.push(0.5, 0.5);
  normals.push(0, 1, 0);

  // 🔹 Top circle
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    positions.push(x, height, z);
    uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
    normals.push(0, 1, 0);
  }

  // 🔹 Top face indices
  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
  }

  const sideStart = positions.length / 3;

  // 🔹 Side vertices
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const length = Math.sqrt(x * x + z * z);

    const nx = x / length;
    const nz = z / length;

    const u = i / segments;

    // top
    positions.push(x, height, z);
    uvs.push(u, 0);
    normals.push(nx, 0, nz);

    // bottom
    positions.push(x, 0, z);
    uvs.push(u, 1);
    normals.push(nx, 0, nz);
  }

  // 🔹 Side indices
  for (let i = 0; i < segments; i++) {
    const a = sideStart + i * 2;
    const b = sideStart + i * 2 + 1;
    const c = sideStart + i * 2 + 2;
    const d = sideStart + i * 2 + 3;

    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  // 🔹 Bottom center
  const bottomCenter = positions.length / 3;
  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);
  normals.push(0, -1, 0);

  const bottomRingStart = positions.length / 3;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    positions.push(x, 0, z);
    uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
    normals.push(0, -1, 0);
  }

  for (let i = 0; i < segments; i++) {
    indices.push(bottomCenter, bottomRingStart + i + 1, bottomRingStart + i);
  }

  // 6️⃣ Buffer + Accessors
  const buffer = document.createBuffer();

  const positionAccessor = document
    .createAccessor()
    .setBuffer(buffer)
    .setType("VEC3")
    .setArray(new Float32Array(positions));

  const uvAccessor = document
    .createAccessor()
    .setBuffer(buffer)
    .setType("VEC2")
    .setArray(new Float32Array(uvs));

  const normalAccessor = document
    .createAccessor()
    .setBuffer(buffer)
    .setType("VEC3")
    .setArray(new Float32Array(normals));

  // ✅ Safe index type
  const IndexArray =
    positions.length / 3 > 65535 ? Uint32Array : Uint16Array;

  const indexAccessor = document
    .createAccessor()
    .setBuffer(buffer)
    .setType("SCALAR")
    .setArray(new IndexArray(indices));

  // 7️⃣ Mesh
  const primitive = document
    .createPrimitive()
    .setAttribute("POSITION", positionAccessor)
    .setAttribute("TEXCOORD_0", uvAccessor)
    .setAttribute("NORMAL", normalAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);

  const mesh = document.createMesh("dish").addPrimitive(primitive);
  const node = document.createNode("dishNode").setMesh(mesh);
  const scene = document.createScene("scene").addChild(node);

  root.setDefaultScene(scene);

  // 8️⃣ Ensure folder exists
  const dir = glbPath.split("/").slice(0, -1).join("/");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 9️⃣ Write GLB
  const io = new NodeIO();
  const glbBuffer = await io.writeBinary(document);

  fs.writeFileSync(glbPath, glbBuffer);

  console.log("✅ GLB created at:", glbPath);

  return glbPath;
};