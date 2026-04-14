const { Document, NodeIO } = require("@gltf-transform/core");
const { KHRMaterialsUnlit } = require("@gltf-transform/extensions");
const fs = require("fs");
const sharp = require("sharp");

const createGLBFromImage = async (imagePath, glbPath) => {
  console.log("Creating GLB from image:", imagePath);

  // 1. Read and resize image
  const imageBuffer = await sharp(imagePath)
    .resize(512, 512, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 2. Create GLTF Document
  const document = new Document();
  const root = document.getRoot();
  document.createExtension(KHRMaterialsUnlit);

  // 3. Create texture
  const texture = document
    .createTexture("dishTexture")
    .setImage(imageBuffer)
    .setMimeType("image/jpeg");

  // 4. Create material
  const material = document
    .createMaterial("dishMaterial")
    .setBaseColorTexture(texture)
    .setDoubleSided(true)
    .setRoughnessFactor(0.8)
    .setMetallicFactor(0.0);

  // 5. Create cylinder geometry
  const segments = 32;
  const radius = 1.0;
  const height = 0.15;

  const positions = [];
  const uvs = [];
  const indices = [];
  const normals = [];

  // Top center
  positions.push(0, height, 0);
  uvs.push(0.5, 0.5);
  normals.push(0, 1, 0);

  // Top circle vertices
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    positions.push(x, height, z);
    uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
    normals.push(0, 1, 0);
  }

  // Top face indices
  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
  }

  const sideStart = positions.length / 3;

  // Side vertices
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const u = i / segments;
    positions.push(x, height, z);
    uvs.push(u, 0);
    normals.push(x, 0, z);
    positions.push(x, 0, z);
    uvs.push(u, 1);
    normals.push(x, 0, z);
  }

  // Side indices
  for (let i = 0; i < segments; i++) {
    const a = sideStart + i * 2;
    const b = sideStart + i * 2 + 1;
    const c = sideStart + i * 2 + 2;
    const d = sideStart + i * 2 + 3;
    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  // Bottom center
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

  // 6. Create accessors
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

  const indexAccessor = document
    .createAccessor()
    .setBuffer(buffer)
    .setType("SCALAR")
    .setArray(new Uint16Array(indices));

  // 7. Create mesh
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

  // 8. Write GLB
  const io = new NodeIO();
  const glbBuffer = await io.writeBinary(document);
  fs.writeFileSync(glbPath, glbBuffer);

  console.log("✅ GLB created at:", glbPath);
  return glbPath;
};

module.exports = { createGLBFromImage };