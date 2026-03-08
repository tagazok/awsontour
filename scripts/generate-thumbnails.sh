#!/bin/bash
# Generate thumbnails for gallery images
# Creates a 'thumbs' subfolder in each gallery directory with resized versions

THUMB_WIDTH=400
GALLERY_DIRS=$(find public/images/trips -type d -name "gallery")

for dir in $GALLERY_DIRS; do
  thumb_dir="$dir/thumbs"
  mkdir -p "$thumb_dir"
  
  find "$dir" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | while read -r img; do
    
    filename=$(basename "$img")
    thumb_path="$thumb_dir/$filename"
    
    # Skip if thumbnail already exists and is newer than source
    if [ -f "$thumb_path" ] && [ "$thumb_path" -nt "$img" ]; then
      continue
    fi
    
    echo "Generating thumbnail: $thumb_path"
    sips --resampleWidth $THUMB_WIDTH "$img" --out "$thumb_path" 2>/dev/null
  done
done

echo "Thumbnail generation complete."
