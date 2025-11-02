
// 模擬檔案結構
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}


export const mockFileStructure: FileNode = {
  name: 'dataset_root',
  type: 'folder',
  children: [
    {
      name: 'images',
      type: 'folder',
      children: [
        { name: 'img_001.png', type: 'file', content: 'Binary image data...\nSize: 2.3 MB\nDimensions: 1920x1080' },
        { name: 'img_002.png', type: 'file', content: 'Binary image data...\nSize: 2.1 MB\nDimensions: 1920x1080' },
        { name: 'img_003.png', type: 'file', content: 'Binary image data...\nSize: 2.4 MB\nDimensions: 1920x1080' },
      ],
    },
    {
      name: 'labels',
      type: 'folder',
      children: [
        { 
          name: 'labels.json', 
          type: 'file', 
          content: `{
  "version": "1.0",
  "labels": [
    { "id": 1, "name": "defect_scratch", "count": 45 },
    { "id": 2, "name": "defect_particle", "count": 23 },
    { "id": 3, "name": "normal", "count": 932 }
  ],
  "total": 1000
}` 
        },
      ],
    },
    { 
      name: 'metadata.json', 
      type: 'file', 
      content: `{
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
  "dataset_name": "Wafer Inspection Dataset",
  "version": "2.1.0",
  "created_date": "2025-10-15",
  "total_images": 1000,
  "format": "PNG",
  "resolution": "1920x1080"
}` 
    },
    { 
      name: 'README.md', 
      type: 'file', 
      content: `# Dataset README

## Overview
This dataset contains wafer inspection images and labels.

## Structure
- images/: Raw image files
- labels/: Annotation files in JSON format
- metadata.json: Dataset metadata

## Usage
1. Load images from images/ directory
2. Read labels from labels/labels.json
3. Check metadata.json for dataset information

## License
Internal use only` 
    },
  ],
};