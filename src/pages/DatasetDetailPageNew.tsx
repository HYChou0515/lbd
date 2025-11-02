import { Stack, Text, Badge, Group, Box, ActionIcon, Tooltip, Button } from '@mantine/core';
import { IconEye, IconDownload, IconDatabase } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Editor from '@monaco-editor/react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import type { Resource } from '../types/meta';
import { formatFullAbsoluteTime } from '../utils/timeUtils';
import '../styles/markdown-preview.css';
import type { Dataset } from '../types/dataset';
import { ThreeColumnLayout } from '../layouts/ThreeColumnLayout';
import { DetailPageHeader } from '../layouts/DetailPageHeader';

// Import the old components
import { 
  TreeNode as DatasetTreeNode,
  FileStructurePreview,
  DatasetMetaInfo,
  datasetTypeColors,
} from './DatasetDetailPageComponents';
import type { FileNode } from './DatasetDetailPageComponents';

interface DatasetDetailPageProps {
  datasetMeta: Resource<Dataset>;
}

export function DatasetDetailPage({ datasetMeta }: DatasetDetailPageProps) {
  const navigate = useNavigate();
  const { data } = datasetMeta;
  const [selectedDataset, setSelectedDataset] = useState<Resource<Dataset>>(datasetMeta);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<Resource<Dataset>[]>([datasetMeta]);
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);

  const onBack = () => {
    navigate({ to: '/' });
  };

  const handleSelectDataset = (dataset: Resource<Dataset>) => {
    setSelectedDataset(dataset);
    setSelectedFile(null);
    
    const currentIndex = breadcrumbPath.findIndex(d => d.meta.revisionId === dataset.meta.revisionId);
    if (currentIndex !== -1) {
      setBreadcrumbPath(breadcrumbPath.slice(0, currentIndex + 1));
    } else {
      let foundParentIndex = -1;
      for (let i = breadcrumbPath.length - 1; i >= 0; i--) {
        const parent = breadcrumbPath[i];
        if (parent.data.sub_dataset_revision_ids.includes(dataset.meta.revisionId)) {
          foundParentIndex = i;
          break;
        }
      }
      
      if (foundParentIndex !== -1) {
        setBreadcrumbPath([...breadcrumbPath.slice(0, foundParentIndex + 1), dataset]);
      } else {
        setBreadcrumbPath([...breadcrumbPath, dataset]);
      }
    }
  };

  const handleSelectFile = (file: FileNode) => {
    setSelectedFile(file);
  };

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sh': 'shell',
      'txt': 'plaintext',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const getDisplayContent = (): string => {
    if (selectedFile && selectedFile.content) {
      return selectedFile.content;
    }
    
    return `# ${selectedDataset.data.name}

## Description
${selectedDataset.data.description}

## Metadata
- Type: ${selectedDataset.data.type}
- Creator: ${selectedDataset.meta.creator}
- Created: ${formatFullAbsoluteTime(selectedDataset.meta.createdTime)}
- Resource ID: ${selectedDataset.meta.resourceId}
- Revision ID: ${selectedDataset.meta.revisionId}`;
  };

  const getFilePath = (): string => {
    if (selectedFile) {
      return selectedFile.name;
    }
    return `${selectedDataset.data.name} (Dataset Info)`;
  };

  const breadcrumbs = [
    { title: 'Home', onClick: onBack },
    ...breadcrumbPath.map(ds => ({ 
      title: ds.data.name, 
      onClick: () => handleSelectDataset(ds)
    }))
  ];

  // Left Column
  const leftColumn = (
    <Box p="md">
      <DatasetTreeNode
        dataset={datasetMeta}
        level={0}
        onSelect={handleSelectDataset}
        selectedId={selectedDataset.meta.revisionId}
      />
      <Box mt="xl">
        <FileStructurePreview 
          onSelectFile={handleSelectFile}
          selectedFile={selectedFile?.name || null}
        />
      </Box>
    </Box>
  );

  // Middle Column
  const middleColumn = (
    <>
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" c="dimmed" ff="monospace">
            {getFilePath()}
          </Text>
          {(!selectedFile || getFileLanguage(selectedFile.name) === 'markdown') && (
            <Group gap="xs">
              <Button
                size="xs"
                variant={isMarkdownPreview ? 'subtle' : 'light'}
                onClick={() => setIsMarkdownPreview(false)}
              >
                Code
              </Button>
              <Button
                size="xs"
                variant={isMarkdownPreview ? 'light' : 'subtle'}
                onClick={() => setIsMarkdownPreview(true)}
              >
                Preview
              </Button>
            </Group>
          )}
        </Group>
      </Box>
      
      <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {isMarkdownPreview && (!selectedFile || getFileLanguage(selectedFile.name) === 'markdown') ? (
          <Box style={{ height: '100%', width: '100%', overflow: 'auto', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: 'none', minWidth: 0, boxSizing: 'border-box' }}>
              <MarkdownPreview 
                source={getDisplayContent()}
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  width: '100%',
                  maxWidth: 'none',
                  minWidth: 0,
                }}
                wrapperElement={{
                  'data-color-mode': 'dark'
                }}
              />
            </div>
          </Box>
        ) : (
          <Editor
            height="100%"
            language={selectedFile ? getFileLanguage(selectedFile.name) : 'markdown'}
            value={getDisplayContent()}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        )}
      </Box>
    </>
  );

  // Right Column
  const rightColumn = (
    <Box p="md">
      <DatasetMetaInfo 
        datasetMeta={datasetMeta}
        selectedDataset={selectedDataset}
      />
    </Box>
  );

  return (
    <Stack h="100vh" w="100vw" style={{ overflow: 'hidden' }}>
      <DetailPageHeader
        title={data.name}
        titleIcon={<IconDatabase size={28} />}
        badge={{
          label: data.type,
          color: datasetTypeColors[data.type] || 'gray',
        }}
        breadcrumbs={breadcrumbs}
        onBack={onBack}
        actions={
          <>
            <Tooltip label="Preview">
              <ActionIcon variant="light" size="lg">
                <IconEye size={20} />
              </ActionIcon>
            </Tooltip>
            <Button leftSection={<IconDownload size={16} />}>
              Download
            </Button>
          </>
        }
      />

      <ThreeColumnLayout
        leftColumn={leftColumn}
        middleColumn={middleColumn}
        rightColumn={rightColumn}
      />
    </Stack>
  );
}
