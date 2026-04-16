#!/bin/bash
set -e

IMAGE_PATH=./uploads
WORK_PATH=./output
DB_PATH=$WORK_PATH/database.db

# 🔥 CLEAN OLD DATA
rm -rf $WORK_PATH
mkdir -p $WORK_PATH


echo "Step 1: Feature Extraction"
colmap feature_extractor \
  --database_path $DB_PATH \
  --image_path $IMAGE_PATH

echo "Step 2: Feature Matching"
colmap exhaustive_matcher \
  --database_path $DB_PATH

echo "Step 3: Sparse Reconstruction"
mkdir -p $WORK_PATH/sparse
colmap mapper \
  --database_path $DB_PATH \
  --image_path $IMAGE_PATH \
  --output_path $WORK_PATH/sparse

echo "Step 4: Image Undistortion"
colmap image_undistorter \
  --image_path $IMAGE_PATH \
  --input_path $WORK_PATH/sparse/0 \
  --output_path $WORK_PATH/dense \
  --output_type COLMAP

echo "Step 5: Dense Stereo"
colmap patch_match_stereo \
  --workspace_path $WORK_PATH/dense \
  --workspace_format COLMAP \
  --PatchMatchStereo.geom_consistency true \
  --PatchMatchStereo.gpu_index 0

echo "Step 6: Stereo Fusion"
colmap stereo_fusion \
  --workspace_path $WORK_PATH/dense \
  --workspace_format COLMAP \
  --input_type geometric \
  --output_path $WORK_PATH/dense/fused.ply \
  --StereoFusion.use_gpu 0

echo "Step 7: Meshing"
colmap poisson_mesher \
  --input_path $WORK_PATH/dense/fused.ply \
  --output_path $WORK_PATH/mesh.ply

echo "✅ DONE"