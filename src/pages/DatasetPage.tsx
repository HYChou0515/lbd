import { 
  Title, 
  TextInput, 
  Group, 
  SimpleGrid, 
  Stack, 
  MultiSelect,
  Switch,
  Paper,
  Button,
  Collapse,
  Loader,
  Text,
  Box,
  Container,
  ActionIcon,
  Tooltip,
  Tabs,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconSearch, 
  IconFilter, 
  IconRefresh, 
  IconCalendar,
  IconSortAscending,
  IconSortDescending,
  IconClock,
  IconClockEdit,
  IconX,
  IconLayoutGrid,
  IconTable,
  IconEye,
  IconDownload,
  IconSettings,
  IconTrophy,
  IconDatabase,
} from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { DatasetCard } from '../components/DatasetCard';
import { DatasetTypeBadge, downloadDataset } from '../utils/datasetUtils';
import { TimeDisplay } from '../components/TimeDisplay';
import { 
  fetchDatasets, 
  applyFrontendFilters, 
  getAllCreators, 
  getAllTypes,
  CURRENT_USER,
  type DatasetApiParams,
  type FrontendFilters,
  type DatasetApiResponse,
} from '../api/datasetApi';
import type { Resource } from '../types/meta';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useSettingsModal } from '../hooks/useSettingsModal';
import type { Dataset } from '../types/dataset';
import { z } from "zod";
import { Modal } from '@mantine/core';
import { ZodForm } from '../components/ZodForm';
import { fieldRegistry } from '../schemas/fieldRegistry';

// Dataset creation schema using field registry
const newDatasetSchema = z.object({
  name: fieldRegistry.datasetName,
  description: fieldRegistry.datasetDescription,
  type: fieldRegistry.datasetType,
  toolId: fieldRegistry.toolId,
  waferId: fieldRegistry.waferId,
  lotId: fieldRegistry.lotId,
  part: fieldRegistry.part,
  confidence: fieldRegistry.confidence,
  dataSource: fieldRegistry.dataSourceUpload, // Discriminated union: file or s3url
  git: fieldRegistry.gitUrl,
  readme: fieldRegistry.readme,
  tags: fieldRegistry.tags,
  keywords: fieldRegistry.keywords,
});

type NewDatasetFormValues = z.infer<typeof newDatasetSchema>;

export function DatasetPage() {
  const navigate = useNavigate();
  
  // New Dataset Modal State
  const [isNewDatasetModalOpen, setIsNewDatasetModalOpen] = useState(false);

  const handleCreateDataset = (values: NewDatasetFormValues) => {
    console.log('Creating dataset:', values);
    // TODO: Implement actual dataset creation
    setIsNewDatasetModalOpen(false);
  };
  
  // 用戶偏好設置
  const {
    preferences,
    setViewMode: saveViewMode,
    setSortBy: saveSortBy,
    setSortOrder: saveSortOrder,
    setFilterTypes: saveFilterTypes,
  } = useUserPreferences();
  
  // Settings Modal
  const { toggleOpen: toggleSettingsModal, modal: settingsModal } = useSettingsModal();
  
  // API 參數（後端支援）- 從偏好設置初始化
  const [apiParams, setApiParams] = useState<DatasetApiParams>({
    sortBy: preferences.sortBy,
    sortOrder: preferences.sortOrder,
    page: 1,
    pageSize: 50,
  });
  
  // 前端過濾參數 - 從偏好設置初始化 types
  const [frontendFilters, setFrontendFilters] = useState<FrontendFilters>({
    mine: false,
    creators: [],
    types: preferences.filterTypes,
    searchQuery: '',
  });
  
  // 資料狀態
  const [apiResponse, setApiResponse] = useState<DatasetApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(preferences.viewMode);
  
  // 取得 creators 和 types 選項
  const creatorOptions = getAllCreators();
  const typeOptions = getAllTypes();

  // 定義表格欄位
  const columns = useMemo<MRT_ColumnDef<Resource<Dataset>>[]>(
    () => [
      {
        id: 'actions',
        header: '',
        size: 100,
        minSize: 65,
        maxSize: 65,
        enableColumnFilter: false,
        enableSorting: false,
        enableResizing: false,
        enableColumnActions: false,
        Cell: ({ row }) => (
          <Group m="0px" gap="0.25rem" wrap="nowrap" justify="center">
            <Tooltip label="View Details">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(row.original.meta.resourceId);
                }}
              >
                <IconEye size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Download">
              <ActionIcon
                variant="subtle"
                color="green"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadDataset(row.original);
                }}
              >
                <IconDownload size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
      {
        accessorKey: 'data.name',
        header: 'Name',
        size: 200,
        minSize: 150,
        maxSize: 400,
        Cell: ({ cell }) => {
          const name = cell.getValue<string>();
          return (
            <Tooltip label={name} withArrow>
              <Text size="sm" lineClamp={1} style={{ cursor: 'help' }}>
                {name}
              </Text>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: 'data.type',
        header: 'Type',
        size: 100,
        minSize: 80,
        maxSize: 150,
        Cell: ({ cell }) => (
          <DatasetTypeBadge type={cell.getValue<string>()} />
        ),
      },
      {
        accessorKey: 'meta.creator',
        header: 'Creator',
        size: 120,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'data.toolId',
        header: 'Tool',
        size: 120,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: 'data.waferId',
        header: 'Wafer',
        size: 100,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: 'data.lotId',
        header: 'Lot',
        size: 120,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: 'data.part',
        header: 'Part',
        size: 100,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: 'meta.createdTime',
        header: 'Created',
        size: 150,
        minSize: 130,
        maxSize: 200,
        Cell: ({ cell }) => {
          const timeValue = cell.getValue<string>();
          return <TimeDisplay time={timeValue} size="sm" color={"black"}/>;
        },
      },
      {
        accessorKey: 'meta.updatedTime',
        header: 'Updated',
        size: 150,
        minSize: 130,
        maxSize: 200,
        Cell: ({ cell }) => {
          const timeValue = cell.getValue<string>();
          return <TimeDisplay time={timeValue} size="sm" color={"black"}/>;
        },
      },
      {
        accessorKey: 'data.description',
        header: 'Description',
        size: 300,
        minSize: 200,
        maxSize: 500,
        Cell: ({ cell }) => {
          const description = cell.getValue<string>();
          return (
            <Tooltip label={description} multiline w={400} withArrow>
              <Text size="sm" lineClamp={2} style={{ cursor: 'help' }}>
                {description}
              </Text>
            </Tooltip>
          );
        },
      },
    ],
    [preferences.timeDisplayMode, preferences.timeDisplayThreshold]
  );

  // 載入資料
  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchDatasets(apiParams);
      setApiResponse(response);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入和 API 參數變更時重新載入
  useEffect(() => {
    loadData();
  }, [apiParams]);

  // 應用前端過濾
  const displayedDatasets = apiResponse 
    ? applyFrontendFilters(apiResponse.data, frontendFilters)
    : [];

  // Table 實例
  const table = useMantineReactTable({
    columns,
    data: displayedDatasets,
    enableColumnResizing: true,
    columnResizeMode: 'onChange', // 即時調整，更流暢
    layoutMode: 'grid', // 使用 grid 布局以支持更好的欄位寬度控制
    enableSorting: false, // 我們使用自己的 sort 邏輯
    enableFilters: false, // 我們使用自己的 filter 邏輯
    enablePagination: false, // 目前顯示所有資料
    enableRowSelection: false,
    mantineTableProps: {
      striped: true,
      highlightOnHover: true,
      style: {
        tableLayout: 'auto', // 自動表格布局，根據內容調整
      },
    },
    mantineTableHeadCellProps: {
      style: {
        fontWeight: 600,
      },
    },
    mantineTableBodyCellProps: {
      style: {
        padding: '12px',
      },
    },
  });

  const handleViewDetails = (resourceId: string) => {
    navigate({ to: '/datasets/$datasetId', params: { datasetId: resourceId } });
  };

  const handleRefresh = () => {
    loadData();
  };

  // 處理 view mode 切換（同步更新 state 和 localStorage）
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    saveViewMode(mode);
  };

  // 處理 sort by 切換（同步更新 state 和 localStorage）
  const handleSortByChange = (sortBy: 'createTime' | 'updateTime') => {
    setApiParams(prev => ({ ...prev, sortBy }));
    saveSortBy(sortBy);
  };

  // 處理 sort order 切換（同步更新 state 和 localStorage）
  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    setApiParams(prev => ({ ...prev, sortOrder }));
    saveSortOrder(sortOrder);
  };

  // 處理 filter types 切換（同步更新 state 和 localStorage）
  const handleFilterTypesChange = (types: string[]) => {
    setFrontendFilters(prev => ({ ...prev, types }));
    saveFilterTypes(types);
  };

  const handleResetFilters = () => {
    setFrontendFilters({
      mine: false,
      creators: [],
      types: [],
      searchQuery: '',
    });
    setApiParams({
      sortBy: preferences.sortBy,
      sortOrder: preferences.sortOrder,
      page: 1,
      pageSize: 50,
      createTimeStart: undefined,
      createTimeEnd: undefined,
      updateTimeStart: undefined,
      updateTimeEnd: undefined,
    });
    // 重置 filter types 到偏好設置
    saveFilterTypes([]);
  };

  const activeFilterCount = 
    (frontendFilters.mine ? 1 : 0) +
    (frontendFilters.creators?.length || 0) +
    (frontendFilters.types?.length || 0) +
    (frontendFilters.searchQuery ? 1 : 0) +
    (apiParams.createTimeStart || apiParams.createTimeEnd ? 1 : 0) +
    (apiParams.updateTimeStart || apiParams.updateTimeEnd ? 1 : 0);

  return (
    <>
      {/* New Dataset Modal */}
      <Modal
        opened={isNewDatasetModalOpen}
        onClose={() => setIsNewDatasetModalOpen(false)}
        title="Create New Dataset"
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <ZodForm<NewDatasetFormValues>
          schema={newDatasetSchema}
          fields={[
            'name',
            'description',
            'type',
            'toolId',
            'waferId',
            'lotId',
            'part',
            'confidence',
            'dataSource', // Discriminated union: file or s3url
            'git',
            'tags',
            'keywords',
            'readme',
          ]}
          initialValues={{
            confidence: 0.5,
            tags: [],
            keywords: [],
          }}
          onSubmit={handleCreateDataset}
          onCancel={() => setIsNewDatasetModalOpen(false)}
          submitLabel="Create Dataset"
        />
      </Modal>

      {/* Settings Modal */}

      <Container fluid p="xl" mah={"100%"} w="100vw" style={{ minHeight: '100vh' }}>
      <Stack gap="xl" align="stretch">
        {/* Navigation Tabs */}
        <Tabs value="datasets" onChange={(value) => {
          if (value === 'programs') {
            navigate({ to: '/programs' });
          }
        }}>
          <Tabs.List>
            <Tabs.Tab value="programs" leftSection={<IconTrophy size={16} />}>
              Programs
            </Tabs.Tab>
            <Tabs.Tab value="datasets" leftSection={<IconDatabase size={16} />}>
              Datasets
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Header */}
        <Group justify="space-between" wrap="nowrap">
          <div style={{ flex: 1 }}>
            <Title order={1}>📦 Dataset Collection</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Showing {displayedDatasets.length} of {apiResponse?.total || 0} datasets
              {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="subtle"
              onClick={() => setIsNewDatasetModalOpen(true)}
            >
              New Dataset
            </Button>
            <Button
              variant="subtle"
              leftSection={<IconSettings size={16} />}
              onClick={() => toggleSettingsModal(true)}
            >
              Settings
            </Button>
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {/* Filter Section - Toolbar + Advanced Filters 無縫連接 */}
        <Box>
          {/* Toolbar - 永遠可見 */}
      {settingsModal}
          <Paper 
            p="md" 
            withBorder 
            style={{ 
              backgroundColor: '#fafafa',
              borderBottom: showAdvancedFilters ? 'none' : undefined,
              borderBottomLeftRadius: showAdvancedFilters ? 0 : undefined,
              borderBottomRightRadius: showAdvancedFilters ? 0 : undefined,
            }}
          >
          <Group gap="md" align="flex-end">
            {/* Global Search */}
            <TextInput
              placeholder="Search by name, wafer, tool, lot, part, recipe, stage..."
              leftSection={<IconSearch size={16} />}
              value={frontendFilters.searchQuery}
              onChange={(e) => setFrontendFilters({
                ...frontendFilters,
                searchQuery: e.currentTarget.value,
              })}
              style={{ flex: 2 }}
              miw="12rem"
            />

            {/* Type Filter */}
            <MultiSelect
              placeholder="Filter by types"
              data={typeOptions}
              value={frontendFilters.types}
              onChange={handleFilterTypesChange}
              searchable
              clearable
              style={{ flex: 1, minWidth: '200px' }}
            />

            {/* Sort Buttons - Compact */}
            <Group gap="xs" wrap="nowrap">
              {/* Sort By */}
              <Button.Group>
                <Button
                  size="xs"
                  variant={apiParams.sortBy === 'createTime' ? 'filled' : 'light'}
                  leftSection={<IconClock size={14} />}
                  onClick={() => handleSortByChange('createTime')}
                >
                  Create
                </Button>
                <Button
                  size="xs"
                  variant={apiParams.sortBy === 'updateTime' ? 'filled' : 'light'}
                  leftSection={<IconClockEdit size={14} />}
                  onClick={() => handleSortByChange('updateTime')}
                >
                  Update
                </Button>
              </Button.Group>

              {/* Sort Order */}
              <Button.Group>
                <Button
                  size="xs"
                  variant={apiParams.sortOrder === 'desc' ? 'filled' : 'light'}
                  leftSection={<IconSortDescending size={14} />}
                  onClick={() => handleSortOrderChange('desc')}
                >
                  New
                </Button>
                <Button
                  size="xs"
                  variant={apiParams.sortOrder === 'asc' ? 'filled' : 'light'}
                  leftSection={<IconSortAscending size={14} />}
                  onClick={() => handleSortOrderChange('asc')}
                >
                  Old
                </Button>
              </Button.Group>
            </Group>

            {/* View Mode Toggle */}
            <Button.Group>
              <Button
                size="xs"
                variant={viewMode === 'grid' ? 'filled' : 'light'}
                leftSection={<IconLayoutGrid size={14} />}
                onClick={() => handleViewModeChange('grid')}
              >
                Grid
              </Button>
              <Button
                size="xs"
                variant={viewMode === 'table' ? 'filled' : 'light'}
                leftSection={<IconTable size={14} />}
                onClick={() => handleViewModeChange('table')}
              >
                Table
              </Button>
            </Button.Group>

            {/* Reset + Advanced Toggle */}
            <Group gap="xs" wrap="nowrap">
              <Tooltip label="Reset all filters">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleResetFilters}
                  disabled={activeFilterCount === 0}
                >
                  <IconX size={18} />
                </ActionIcon>
              </Tooltip>
              
              <Button
                size="xs"
                variant="light"
                leftSection={<IconFilter size={14} />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                Filters
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Advanced Filters */}
        <Collapse in={showAdvancedFilters}>
          <Paper 
            p="md" 
            withBorder 
            style={{ 
              backgroundColor: '#fafafa',
              borderTop: 'none',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              {/* Mine Switch */}
              <Box>
                <Text size="sm" fw={500} mb={4}>Mine</Text>
                <Switch
                  label={`Only my datasets (${CURRENT_USER})`}
                  checked={frontendFilters.mine}
                  onChange={(e) => setFrontendFilters({
                    ...frontendFilters,
                    mine: e.currentTarget.checked,
                  })}
                />
              </Box>

              {/* Creators */}
              <MultiSelect
                label="Filter by Creators"
                placeholder="Select creators"
                data={creatorOptions}
                value={frontendFilters.creators}
                onChange={(value) => setFrontendFilters({
                  ...frontendFilters,
                  creators: value,
                })}
                searchable
                clearable
              />

              {/* Update Time Range */}
              <DatePickerInput
                type="range"
                label="Update Time Range"
                placeholder="Select date range"
                leftSection={<IconCalendar size={16} />}
                value={[
                  apiParams.updateTimeStart ? new Date(apiParams.updateTimeStart) : null,
                  apiParams.updateTimeEnd ? new Date(apiParams.updateTimeEnd) : null,
                ]}
                onChange={(value) => {
                  const [start, end] = value;
                  setApiParams({
                    ...apiParams,
                    updateTimeStart: start ? new Date(start).toISOString() : undefined,
                    updateTimeEnd: end ? new Date(end).toISOString() : undefined,
                  });
                }}
                clearable
              />

              {/* Create Time Range */}
              <DatePickerInput
                type="range"
                label="Create Time Range"
                placeholder="Select date range"
                leftSection={<IconCalendar size={16} />}
                value={[
                  apiParams.createTimeStart ? new Date(apiParams.createTimeStart) : null,
                  apiParams.createTimeEnd ? new Date(apiParams.createTimeEnd) : null,
                ]}
                onChange={(value) => {
                  const [start, end] = value;
                  setApiParams({
                    ...apiParams,
                    createTimeStart: start ? new Date(start).toISOString() : undefined,
                    createTimeEnd: end ? new Date(end).toISOString() : undefined,
                  });
                }}
                clearable
              />
            </SimpleGrid>
          </Paper>
        </Collapse>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Group justify="center" py="xl">
            <Loader size="lg" />
            <Text>Loading datasets...</Text>
          </Group>
        )}

        {/* Dataset View - Grid or Table */}
        {!isLoading && (
          <>
            {viewMode === 'grid' ? (
              /* Grid View */
              <SimpleGrid 
                cols={{ base: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
                spacing="md"
              >
                {displayedDatasets.map((dataset) => (
                  <DatasetCard
                    key={dataset.meta.resourceId}
                    datasetMeta={dataset}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SimpleGrid>
            ) : (
              /* Table View */
              <MantineReactTable table={table} />
            )}

            {displayedDatasets.length === 0 && !isLoading && (
              <Paper p="xl" withBorder style={{ minHeight: 400 }}>
                <Stack align="center" gap="md" style={{ height: '100%' }} justify="center">
                  <Title order={3} c="dimmed">
                    No datasets found
                  </Title>
                  <Text size="sm" c="dimmed">
                    Try adjusting your filters or search query
                  </Text>
                  {activeFilterCount > 0 && (
                    <Button onClick={handleResetFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </Stack>
              </Paper>
            )}
          </>
        )}
      </Stack>
    </Container>
    </>
  );
}
