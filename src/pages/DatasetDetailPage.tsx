import { 
  Title, 
  Text, 
  Badge, 
  Group, 
  Stack, 
  Card,
  Button,
  Breadcrumbs,
  Anchor,
  Divider,
  ActionIcon,
  Tooltip,
  Box,
  Collapse,
  Code,
} from '@mantine/core';
import { 
  IconEye, 
  IconDownload, 
  IconFolder,
  IconUser,
  IconClock,
  IconChevronRight,
  IconArrowLeft,
  IconFile,
  IconFolderOpen,
  IconChevronDown,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Editor from '@monaco-editor/react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import type { Resource } from '../types/meta';
import { getSubdatasets } from '../utils/datasetHelpers';
import { formatFullAbsoluteTime } from '../utils/timeUtils';
import { TimeDisplay } from '../components/TimeDisplay';
import '../styles/markdown-preview.css';
import type { Dataset } from '../types/dataset';
import type { FileNode } from '../data/mockFileStructure';
import { mockFileStructure  } from '../data/mockFileStructure';
import { DetailPageLayout } from '../layouts/DetailPageLayout';

interface DatasetDetailPageProps {
  datasetMeta: Resource<Dataset>;
  selectedDatasetId?: string; // Optional: if provided, will display this subdataset
}

// Dataset Type 對應的顏色
const datasetTypeColors: Record<string, string> = {
  'EBI': 'blue',
  'Escan IDT': 'violet',
  'Escan IDT Result': 'grape',
  'PrimeV IDT': 'pink',
  'PrimeV IDT Result': 'red',
  'GDS': 'orange',
  'Review Ready': 'green',
  'RSEM': 'cyan',
  'RSEM Result': 'teal',
  'Group': 'indigo',
};

// 遞迴樹節點組件
interface TreeNodeProps {
  dataset: Resource<Dataset>;
  level: number;
  onSelect: (dataset: Resource<Dataset>) => void;
  selectedId: string | null;
}

function TreeNode({ dataset, level, onSelect, selectedId }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const subdatasets = getSubdatasets(dataset);
  const hasChildren = subdatasets.length > 0;
  const isSelected = dataset.meta.revisionId === selectedId;

  return (
    <Box>
      <Group
        gap="xs"
        pl={level * 16}
        py={6}
        px={8}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : 'transparent',
          borderRadius: 4,
        }}
        onClick={() => onSelect(dataset)}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {hasChildren && (
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <IconChevronDown
              size={14}
              style={{
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
              }}
            />
          </ActionIcon>
        )}
        {!hasChildren && <Box w={20} />}
        <Text size="sm" style={{ flex: 1 }} lineClamp={1}>
          {dataset.data.name}
        </Text>
        <Badge size="xs" variant="dot" color={datasetTypeColors[dataset.data.type]}>
          {dataset.data.type}
        </Badge>
      </Group>
      {hasChildren && (
        <Collapse in={isOpen}>
          {subdatasets.map((sub) => (
            <TreeNode
              key={sub.meta.revisionId}
              dataset={sub}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onSelectFile: (node: FileNode) => void;
  selectedFile: string | null;
}

function FileTreeNode({ node, level, onSelectFile, selectedFile }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.name === selectedFile;

  return (
    <Box>
      <Group
        gap="xs"
        pl={level * 16}
        py={4}
        px={6}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : 'transparent',
          borderRadius: 4,
        }}
        onClick={() => {
          if (node.type === 'file') {
            onSelectFile(node);
          } else {
            setIsOpen(!isOpen);
          }
        }}
      >
        {hasChildren && (
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <IconChevronDown
              size={12}
              style={{
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
              }}
            />
          </ActionIcon>
        )}
        {!hasChildren && <Box w={16} />}
        {node.type === 'folder' ? (
          isOpen ? <IconFolderOpen size={14} color="var(--mantine-color-orange-6)" /> : <IconFolder size={14} color="var(--mantine-color-orange-6)" />
        ) : (
          <IconFile size={14} color="var(--mantine-color-blue-6)" />
        )}
        <Text size="xs" ff="monospace" style={{ flex: 1 }}>
          {node.name}
        </Text>
      </Group>
      {hasChildren && (
        <Collapse in={isOpen}>
          {node.children!.map((child, idx) => (
            <FileTreeNode
              key={idx}
              node={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

function FileStructurePreview({ onSelectFile, selectedFile }: { onSelectFile: (node: FileNode) => void; selectedFile: string | null }) {
  return (
    <Card withBorder>
      <FileTreeNode
        node={mockFileStructure}
        level={0}
        onSelectFile={onSelectFile}
        selectedFile={selectedFile}
      />
    </Card>
  );
}

export function DatasetDetailPage({ datasetMeta, selectedDatasetId }: DatasetDetailPageProps) {
  const navigate = useNavigate();
  const { data } = datasetMeta;
  
  // Find the selected dataset based on selectedDatasetId
  const findDatasetById = (dataset: Resource<Dataset>, id: string): Resource<Dataset> | null => {
    if (dataset.meta.resourceId === id) return dataset;
    const subdatasets = getSubdatasets(dataset);
    for (const sub of subdatasets) {
      const found = findDatasetById(sub, id);
      if (found) return found;
    }
    return null;
  };

  const initialDataset = selectedDatasetId 
    ? findDatasetById(datasetMeta, selectedDatasetId) || datasetMeta
    : datasetMeta;

  const [selectedDataset, setSelectedDataset] = useState<Resource<Dataset>>(initialDataset);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<Resource<Dataset>[]>([datasetMeta]);
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false); // 新增預覽模式狀態
  
  // isGroup 應該基於當前選擇的 dataset，而不是頁面初始的 datasetMeta
  const isGroup = selectedDataset.data.type === 'Group';

  const onBack = () => {
    navigate({ to: '/' });
  };

  const handleSelectDataset = (dataset: Resource<Dataset>) => {
    // Navigate to the subdataset route
    navigate({ 
      to: '/datasets/$datasetId',
      params: { datasetId: dataset.meta.resourceId }
    });
  };

  // Update selected dataset when selectedDatasetId changes
  useEffect(() => {
    if (selectedDatasetId) {
      const found = findDatasetById(datasetMeta, selectedDatasetId);
      if (found) {
        setSelectedDataset(found);
        setSelectedFile(null);
        
        // Build breadcrumb path
        const buildPath = (dataset: Resource<Dataset>, targetId: string, currentPath: Resource<Dataset>[]): Resource<Dataset>[] | null => {
          if (dataset.meta.resourceId === targetId) {
            return [...currentPath, dataset];
          }
          const subdatasets = getSubdatasets(dataset);
          for (const sub of subdatasets) {
            const result = buildPath(sub, targetId, [...currentPath, dataset]);
            if (result) return result;
          }
          return null;
        };
        
        const path = buildPath(datasetMeta, selectedDatasetId, []);
        if (path) {
          setBreadcrumbPath(path);
        }
      }
    } else {
      setSelectedDataset(datasetMeta);
      setBreadcrumbPath([datasetMeta]);
    }
  }, [selectedDatasetId, datasetMeta]);

  const handleSelectFile = (file: FileNode) => {
    setSelectedFile(file);
  };

  // 根據檔案副檔名判斷語言
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

  // 生成檔案路徑
  const getFilePath = (): string => {
    if (selectedFile) {
      // 遞迴找出檔案的完整路徑
      const buildPath = (node: FileNode, target: FileNode, currentPath: string = ''): string | null => {
        const newPath = currentPath ? `${currentPath}/${node.name}` : node.name;
        
        if (node === target) {
          return newPath;
        }
        
        if (node.children) {
          for (const child of node.children) {
            const result = buildPath(child, target, newPath);
            if (result) return result;
          }
        }
        
        return null;
      };
      
      return buildPath(mockFileStructure, selectedFile) || selectedFile.name;
    }
    
    return `${selectedDataset.data.name} (Dataset Info)`;
  };

  const breadcrumbItems = [
    { title: 'Home', href: '/', dataset: null },
    ...breadcrumbPath.map(ds => ({ 
      title: ds.data.name, 
      href: '#',
      dataset: ds
    }))
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      onClick={(e) => {
        e.preventDefault();
        if (index === 0) {
          onBack();
        } else if (item.dataset) {
          handleSelectDataset(item.dataset);
        }
      }}
    >
      {item.title}
    </Anchor>
  ));

  // 顯示內容：如果選擇了檔案就顯示檔案內容，否則顯示 dataset 資訊
  const getDisplayContent = () => {
    if (selectedFile && selectedFile.content) {
      return selectedFile.content;
    }
    
    // 預設顯示 dataset 的資訊
    const dataset = selectedDataset;
    const isGroupType = dataset.data.type === 'Group';
    const subdatasets = getSubdatasets(dataset);
    
    return `# ${dataset.data.name}

## Description
${dataset.data.description}

## Metadata
- Type: ${dataset.data.type}
- Creator: ${dataset.meta.creator}
- Created: ${formatFullAbsoluteTime(dataset.meta.createdTime)}
- Resource ID: ${dataset.meta.resourceId}
- Revision ID: ${dataset.meta.revisionId}

${!isGroupType && 'toolId' in dataset.data ? `
## Process Information
- Tool ID: ${dataset.data.toolId}
- Wafer ID: ${dataset.data.waferId}
- Lot ID: ${dataset.data.lotId}
- Part: ${dataset.data.part}
- Recipe: ${dataset.data.recipe}
- Stage: ${dataset.data.stage}
` : ''}

## Subdatasets
${subdatasets.length > 0 
  ? subdatasets.map(sub => `- ${sub.data.name} (${sub.data.type})`).join('\n')
  : 'No subdatasets'}
`;
  };

  return (
    <DetailPageLayout
      header={
        <>
          <Group justify="space-between" mb="sm" wrap="nowrap">
            <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <Breadcrumbs separator={<IconChevronRight size={14} />}>
                {breadcrumbItems}
              </Breadcrumbs>
            </Box>
            <Button 
              leftSection={<IconArrowLeft size={16} />}
              variant="subtle"
              onClick={onBack}
              style={{ flexShrink: 0 }}
            >
              Back
            </Button>
          </Group>
          
          <Group justify="space-between" wrap="nowrap">
            <Group style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
              <Title order={3} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                📦 {data.name}
              </Title>
              <Badge 
                color={datasetTypeColors[data.type] || 'gray'} 
                variant="filled"
                size="lg"
                style={{ flexShrink: 0 }}
              >
                {data.type}
              </Badge>
            </Group>
            <Group gap="xs" style={{ flexShrink: 0 }}>
              <Tooltip label="Preview">
                <ActionIcon variant="light" size="lg">
                  <IconEye size={20} />
                </ActionIcon>
              </Tooltip>
              <Button leftSection={<IconDownload size={16} />}>
                Download
              </Button>
            </Group>
          </Group>
        </>
      }
      leftPanel={
        <>
          <Title order={5} mb="md">Dataset Structure</Title>
          <TreeNode
            dataset={datasetMeta}
            level={0}
            onSelect={handleSelectDataset}
            selectedId={selectedDataset.meta.revisionId}
          />
          
          <Divider my="xl" />
          
          <Title order={5} mb="md">File Structure</Title>
          <FileStructurePreview 
            onSelectFile={handleSelectFile}
            selectedFile={selectedFile?.name || null}
          />
        </>
      }
      mainPanel={
        <>
          <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed" ff="monospace">
                {getFilePath()}
              </Text>
              {/* 只在顯示 Markdown 時顯示切換按鈕 */}
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
      }
      rightPanel={
        <Stack gap="md">
          <Title order={5}>Detail</Title>
          
          <Divider />

          {/* Dataset Name and Type */}
          <Box>
            <Text size="sm" fw={600} mb="xs">Dataset</Text>
            <Stack gap="xs">
              <div>
                <Text size="xs" c="dimmed">Name:</Text>
                <Text size="sm" fw={500}>{selectedDataset.data.name}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Type:</Text>
                <Badge 
                  color={datasetTypeColors[selectedDataset.data.type] || 'gray'} 
                  variant="light"
                  size="sm"
                >
                  {selectedDataset.data.type}
                </Badge>
              </div>
            </Stack>
            
            {/* 只有當選擇的 dataset 不是頁面初始的 dataset 時才顯示按鈕 */}
            {selectedDataset.meta.resourceId !== datasetMeta.meta.resourceId && (
              <Button
                fullWidth
                mt="sm"
                variant="light"
                rightSection={<IconChevronRight size={16} />}
                onClick={() => {
                  navigate({ 
                    to: '/datasets/$datasetId', 
                    params: { datasetId: selectedDataset.meta.resourceId } 
                  });
                }}
              >
                Go to this Dataset Page
              </Button>
            )}
          </Box>

          <Divider />

          {/* Process Info */}
          {!isGroup && 'toolId' in selectedDataset.data && (
            <Box>
              <Text size="sm" fw={600} mb="xs">Process Info</Text>
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="xs" c="dimmed" w={60}>Tool:</Text>
                  <Badge variant="light" size="sm">{selectedDataset.data.toolId}</Badge>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed" w={60}>Wafer:</Text>
                  <Badge variant="light" size="sm">{selectedDataset.data.waferId}</Badge>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed" w={60}>Lot:</Text>
                  <Badge variant="light" size="sm">{selectedDataset.data.lotId}</Badge>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed" w={60}>Part:</Text>
                  <Badge variant="light" size="sm">{selectedDataset.data.part}</Badge>
                </Group>
                {/* Recipe & Stage 也放在 Process Info 裡 */}
                {'recipe' in selectedDataset.data && (
                  <>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed" w={60}>Recipe:</Text>
                      <Text size="sm">{selectedDataset.data.recipe}</Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed" w={60}>Stage:</Text>
                      <Text size="sm">{selectedDataset.data.stage}</Text>
                    </Group>
                  </>
                )}
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Description */}
          <Box>
            <Text size="sm" fw={600} mb="xs">Description</Text>
            <Text size="sm" c="dimmed">
              {selectedDataset.data.description}
            </Text>
          </Box>

          <Divider />

          {/* Resource Info */}
          <Box>
            <Text size="sm" fw={600} mb="xs">Resource Info</Text>
            <Stack gap="xs">
              <Group gap="xs">
                <IconUser size={14} />
                <div style={{ flex: 1 }}>
                  <Text size="xs" c="dimmed">Creator</Text>
                  <Text size="sm">{selectedDataset.meta.creator}</Text>
                </div>
              </Group>
              <Group gap="xs">
                <IconClock size={14} />
                <div style={{ flex: 1 }}>
                  <Text size="xs" c="dimmed">Created</Text>
                  <TimeDisplay time={selectedDataset.meta.createdTime} size="sm" />
                </div>
              </Group>
              <Group gap="xs">
                <IconUser size={14} />
                <div style={{ flex: 1 }}>
                  <Text size="xs" c="dimmed">Updater</Text>
                  <Text size="sm">{selectedDataset.meta.updater}</Text>
                </div>
              </Group>
              <Group gap="xs">
                <IconClock size={14} />
                <div style={{ flex: 1 }}>
                  <Text size="xs" c="dimmed">Updated</Text>
                  <TimeDisplay time={selectedDataset.meta.updatedTime} size="sm" />
                </div>
              </Group>
            </Stack>
          </Box>

          <Divider />

          {/* IDs */}
          <Box>
            <Text size="sm" fw={600} mb="xs">Identifiers</Text>
            <Stack gap="xs">
              <div>
                <Text size="xs" c="dimmed">Resource ID</Text>
                <Code>{selectedDataset.meta.resourceId}</Code>
              </div>
              <div>
                <Text size="xs" c="dimmed">Revision ID</Text>
                <Code>{selectedDataset.meta.revisionId}</Code>
              </div>
            </Stack>
          </Box>
        </Stack>
      }
    />
  );
}
