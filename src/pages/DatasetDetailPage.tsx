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
  Grid,
  ActionIcon,
  Tooltip,
  Box,
  ScrollArea,
  rem,
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
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { DatasetDataMeta } from '../types/dataset';
import { getSubdatasets } from '../utils/datasetHelpers';

interface DatasetDetailPageProps {
  datasetMeta: DatasetDataMeta;
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
  dataset: DatasetDataMeta;
  level: number;
  onSelect: (dataset: DatasetDataMeta) => void;
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
        {hasChildren ? (
          isOpen ? <IconFolderOpen size={16} color="var(--mantine-color-orange-6)" /> : <IconFolder size={16} color="var(--mantine-color-orange-6)" />
        ) : (
          <IconFile size={16} color="var(--mantine-color-blue-6)" />
        )}
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

// 模擬檔案結構
function FileStructurePreview() {
  return (
    <Card withBorder>
      <Stack gap="xs">
        <Group gap="xs">
          <IconFolder size={16} color="var(--mantine-color-orange-6)" />
          <Text size="sm" ff="monospace" fw={600}>/dataset_root</Text>
        </Group>
        <Group gap="xs" pl="xl">
          <IconFolder size={16} color="var(--mantine-color-orange-6)" />
          <Text size="sm" ff="monospace">images/</Text>
        </Group>
        <Group gap="xs" pl={rem(60)}>
          <IconFile size={16} />
          <Text size="sm" ff="monospace" c="dimmed">img_001.png</Text>
        </Group>
        <Group gap="xs" pl={rem(60)}>
          <IconFile size={16} />
          <Text size="sm" ff="monospace" c="dimmed">img_002.png</Text>
        </Group>
        <Group gap="xs" pl={rem(60)}>
          <IconFile size={16} />
          <Text size="sm" ff="monospace" c="dimmed">img_003.png</Text>
        </Group>
        <Group gap="xs" pl="xl">
          <IconFolder size={16} color="var(--mantine-color-orange-6)" />
          <Text size="sm" ff="monospace">labels/</Text>
        </Group>
        <Group gap="xs" pl={rem(60)}>
          <IconFile size={16} />
          <Text size="sm" ff="monospace" c="dimmed">labels.json</Text>
        </Group>
        <Group gap="xs" pl="xl">
          <IconFile size={16} />
          <Text size="sm" ff="monospace" c="dimmed">metadata.json</Text>
        </Group>
        <Group gap="xs" pl="xl">
          <IconFile size={16} />
          <Text size="sm" ff="monospace" c="dimmed">README.md</Text>
        </Group>
      </Stack>
    </Card>
  );
}

export function DatasetDetailPage({ datasetMeta }: DatasetDetailPageProps) {
  const navigate = useNavigate();
  const { data } = datasetMeta;
  const isGroup = data.type === 'Group';
  const [selectedDataset, setSelectedDataset] = useState<DatasetDataMeta>(datasetMeta);

  const onBack = () => {
    navigate({ to: '/' });
  };

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: data.name, href: '#' },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      onClick={(e) => {
        e.preventDefault();
        if (index === 0) onBack();
      }}
    >
      {item.title}
    </Anchor>
  ));

  // 模擬檔案內容
  const getFileContent = (dataset: DatasetDataMeta) => {
    return `# ${dataset.data.name}

## Description
${dataset.data.description}

## Metadata
- Type: ${dataset.data.type}
- Creator: ${dataset.meta.creator}
- Created: ${new Date(dataset.meta.createdTime).toLocaleString()}
- Resource ID: ${dataset.meta.resourceId}
- Revision ID: ${dataset.meta.revisionId}

${!isGroup && 'toolId' in dataset.data ? `
## Process Information
- Tool ID: ${dataset.data.toolId}
- Wafer ID: ${dataset.data.waferId}
- Lot ID: ${dataset.data.lotId}
- Part: ${dataset.data.part}
- Recipe: ${dataset.data.recipe}
- Stage: ${dataset.data.stage}
` : ''}

## Subdatasets
${dataset.data.sub_dataset_revision_ids.length > 0 
  ? dataset.data.sub_dataset_revision_ids.map(id => `- ${id}`).join('\n')
  : 'No subdatasets'}
`;
  };

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between" mb="sm">
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={onBack}
          >
            Back
          </Button>
          <Breadcrumbs separator={<IconChevronRight size={14} />}>
            {breadcrumbItems}
          </Breadcrumbs>
        </Group>
        
        <Group justify="space-between">
          <Group>
            <Title order={3}>📦 {data.name}</Title>
            <Badge 
              color={datasetTypeColors[data.type] || 'gray'} 
              variant="filled"
              size="lg"
            >
              {data.type}
            </Badge>
          </Group>
          <Group>
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
      </Box>

      {/* Three Column Layout */}
      <Grid gutter={0} style={{ flex: 1, overflow: 'hidden' }} m={0}>
        {/* Left Column - Dataset Tree + File Structure */}
        <Grid.Col 
          span={3} 
          style={{ 
            borderRight: '1px solid var(--mantine-color-gray-3)',
            height: '100%',
          }}
        >
          <ScrollArea h="100%">
            <Box p="md">
              <Title order={5} mb="md">Dataset Structure</Title>
              <TreeNode
                dataset={datasetMeta}
                level={0}
                onSelect={setSelectedDataset}
                selectedId={selectedDataset.meta.revisionId}
              />
              
              <Divider my="xl" />
              
              <Title order={5} mb="md">File Structure</Title>
              <FileStructurePreview />
            </Box>
          </ScrollArea>
        </Grid.Col>

        {/* Middle Column - File Content Display */}
        <Grid.Col 
          span={6}
          style={{ 
            height: '100%',
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
        >
          <ScrollArea h="100%">
            <Box p="xl">
              <Group justify="space-between" mb="md">
                <Title order={4}>Content Preview</Title>
                <Badge>{selectedDataset.data.name}</Badge>
              </Group>
              
              <Code block style={{ whiteSpace: 'pre-wrap' }}>
                {getFileContent(selectedDataset)}
              </Code>
            </Box>
          </ScrollArea>
        </Grid.Col>

        {/* Right Column - Metadata */}
        <Grid.Col 
          span={3}
          style={{ 
            borderLeft: '1px solid var(--mantine-color-gray-3)',
            height: '100%',
          }}
        >
          <ScrollArea h="100%">
            <Box p="md">
              <Stack gap="md">
                <Title order={5}>Metadata</Title>
                
                <Divider />

                {/* Short Meta (Badges) */}
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
                    </Stack>
                  </Box>
                )}

                {/* Recipe & Stage */}
                {!isGroup && 'recipe' in selectedDataset.data && (
                  <>
                    <Divider />
                    <Box>
                      <Text size="sm" fw={600} mb="xs">Recipe & Stage</Text>
                      <Stack gap="xs">
                        <div>
                          <Text size="xs" c="dimmed">Recipe:</Text>
                          <Text size="sm">{selectedDataset.data.recipe}</Text>
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">Stage:</Text>
                          <Text size="sm">{selectedDataset.data.stage}</Text>
                        </div>
                      </Stack>
                    </Box>
                  </>
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
                        <Text size="sm">
                          {new Date(selectedDataset.meta.createdTime).toLocaleString()}
                        </Text>
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
                        <Text size="sm">
                          {new Date(selectedDataset.meta.updatedTime).toLocaleString()}
                        </Text>
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
            </Box>
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
