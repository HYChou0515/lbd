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
import { ProgramCard } from '../components/ProgramCard';
import { TimeDisplay } from '../components/TimeDisplay';
import { mockProgram } from '../data/mockProgramData';
import type { Resource } from '../types/meta';
import type { Program } from '../types/program';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useSettingsModal } from '../hooks/useSettingsModal';

// Mock API functions (similar to dataset API)
const getAllPrograms = (): Resource<Program>[] => {
  // In real app, this would fetch from API
  return [mockProgram];
};

const applyProgramFilters = (
  programs: Resource<Program>[],
  filters: {
    searchQuery: string;
    mine: boolean;
    creators: string[];
  }
): Resource<Program>[] => {
  return programs.filter(program => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = program.data.name.toLowerCase().includes(query);
      const matchesDescription = program.data.description.toLowerCase().includes(query);
      if (!matchesName && !matchesDescription) return false;
    }

    // Mine filter
    if (filters.mine && program.meta.creator !== 'current-user') {
      return false;
    }

    // Creators filter
    if (filters.creators.length > 0 && !filters.creators.includes(program.meta.creator)) {
      return false;
    }

    return true;
  });
};

const CURRENT_USER = 'current-user';

export function ProgramsPage() {
  const navigate = useNavigate();
  
  // User preferences
  const {
    preferences,
    setViewMode: saveViewMode,
    setSortBy: saveSortBy,
    setSortOrder: saveSortOrder,
  } = useUserPreferences();
  
  // Settings Modal
  const { toggleOpen: toggleSettingsModal, modal: settingsModal } = useSettingsModal();
  
  // State
  const [programs, setPrograms] = useState<Resource<Program>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(preferences.viewMode);
  const [sortBy, setSortBy] = useState<'createTime' | 'updateTime'>(preferences.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(preferences.sortOrder);
  
  // Filters
  const [filters, setFilters] = useState({
    searchQuery: '',
    mine: false,
    creators: [] as string[],
    createTimeStart: undefined as string | undefined,
    createTimeEnd: undefined as string | undefined,
    updateTimeStart: undefined as string | undefined,
    updateTimeEnd: undefined as string | undefined,
  });

  // Get unique creators
  const creatorOptions = useMemo(() => {
    const allPrograms = getAllPrograms();
    const creators = new Set(allPrograms.map(p => p.meta.creator));
    return Array.from(creators);
  }, []);

  // Load data
  const loadData = () => {
    setIsLoading(true);
    try {
      const allPrograms = getAllPrograms();
      setPrograms(allPrograms);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Apply filters and sorting
  const displayedPrograms = useMemo(() => {
    let filtered = applyProgramFilters(programs, filters);

    // Apply date filters
    if (filters.createTimeStart || filters.createTimeEnd) {
      filtered = filtered.filter(program => {
        const createdTime = new Date(program.meta.createdTime).getTime();
        if (filters.createTimeStart && createdTime < new Date(filters.createTimeStart).getTime()) {
          return false;
        }
        if (filters.createTimeEnd && createdTime > new Date(filters.createTimeEnd).getTime()) {
          return false;
        }
        return true;
      });
    }

    if (filters.updateTimeStart || filters.updateTimeEnd) {
      filtered = filtered.filter(program => {
        const updatedTime = new Date(program.meta.updatedTime).getTime();
        if (filters.updateTimeStart && updatedTime < new Date(filters.updateTimeStart).getTime()) {
          return false;
        }
        if (filters.updateTimeEnd && updatedTime > new Date(filters.updateTimeEnd).getTime()) {
          return false;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const timeA = sortBy === 'createTime' 
        ? new Date(a.meta.createdTime).getTime()
        : new Date(a.meta.updatedTime).getTime();
      const timeB = sortBy === 'createTime'
        ? new Date(b.meta.createdTime).getTime()
        : new Date(b.meta.updatedTime).getTime();
      
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [programs, filters, sortBy, sortOrder]);

  // Table columns
  const columns = useMemo<MRT_ColumnDef<Resource<Program>>[]>(
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
                  console.log('Download program:', row.original.meta.resourceId);
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
                🏆 {name}
              </Text>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: 'data.case_ids.length',
        header: 'Cases',
        size: 100,
        Cell: ({ row }) => (
          <Text size="sm">{row.original.data.case_ids.length}</Text>
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
        accessorKey: 'meta.createdTime',
        header: 'Created',
        size: 150,
        minSize: 130,
        maxSize: 200,
        Cell: ({ cell }) => {
          const timeValue = cell.getValue<string>();
          return <TimeDisplay time={timeValue} size="sm" color="black" />;
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
          return <TimeDisplay time={timeValue} size="sm" color="black" />;
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
    []
  );

  // Table instance
  const table = useMantineReactTable({
    columns,
    data: displayedPrograms,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    layoutMode: 'grid',
    enableSorting: false,
    enableFilters: false,
    enablePagination: false,
    enableRowSelection: false,
    mantineTableProps: {
      striped: true,
      highlightOnHover: true,
      style: {
        tableLayout: 'auto',
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
    navigate({ to: '/program/$resourceId', params: { resourceId } });
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    saveViewMode(mode);
  };

  const handleSortByChange = (newSortBy: 'createTime' | 'updateTime') => {
    setSortBy(newSortBy);
    saveSortBy(newSortBy);
  };

  const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
    saveSortOrder(newSortOrder);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      mine: false,
      creators: [],
      createTimeStart: undefined,
      createTimeEnd: undefined,
      updateTimeStart: undefined,
      updateTimeEnd: undefined,
    });
  };

  const activeFilterCount = 
    (filters.mine ? 1 : 0) +
    (filters.creators?.length || 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.createTimeStart || filters.createTimeEnd ? 1 : 0) +
    (filters.updateTimeStart || filters.updateTimeEnd ? 1 : 0);

  return (
    <>
      {settingsModal}
      
      <Container fluid p="xl" mah="100%" w="100vw" style={{ minHeight: '100vh' }}>
        <Stack gap="xl" align="stretch">
          {/* Navigation Tabs */}
          <Tabs value="programs" onChange={(value) => {
            if (value === 'datasets') {
              navigate({ to: '/datasets' });
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
              <Title order={1}>🏆 Program Collection</Title>
              <Text size="sm" c="dimmed" mt={4}>
                Showing {displayedPrograms.length} of {programs.length} programs
                {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
              </Text>
            </div>
            <Group gap="xs">
              <Button
                variant="light"
                onClick={() => navigate({ to: '/submissions' })}
              >
                View Submissions
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

          {/* Filter Section */}
          <Box>
            {/* Toolbar */}
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
                  placeholder="Search by name or description..."
                  leftSection={<IconSearch size={16} />}
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({
                    ...filters,
                    searchQuery: e.currentTarget.value,
                  })}
                  style={{ flex: 2 }}
                  miw="12rem"
                />

                {/* Sort Buttons */}
                <Group gap="xs" wrap="nowrap">
                  {/* Sort By */}
                  <Button.Group>
                    <Button
                      size="xs"
                      variant={sortBy === 'createTime' ? 'filled' : 'light'}
                      leftSection={<IconClock size={14} />}
                      onClick={() => handleSortByChange('createTime')}
                    >
                      Create
                    </Button>
                    <Button
                      size="xs"
                      variant={sortBy === 'updateTime' ? 'filled' : 'light'}
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
                      variant={sortOrder === 'desc' ? 'filled' : 'light'}
                      leftSection={<IconSortDescending size={14} />}
                      onClick={() => handleSortOrderChange('desc')}
                    >
                      New
                    </Button>
                    <Button
                      size="xs"
                      variant={sortOrder === 'asc' ? 'filled' : 'light'}
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
                      label={`Only my programs (${CURRENT_USER})`}
                      checked={filters.mine}
                      onChange={(e) => setFilters({
                        ...filters,
                        mine: e.currentTarget.checked,
                      })}
                    />
                  </Box>

                  {/* Creators */}
                  <MultiSelect
                    label="Filter by Creators"
                    placeholder="Select creators"
                    data={creatorOptions}
                    value={filters.creators}
                    onChange={(value) => setFilters({
                      ...filters,
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
                      filters.updateTimeStart ? new Date(filters.updateTimeStart) : null,
                      filters.updateTimeEnd ? new Date(filters.updateTimeEnd) : null,
                    ]}
                    onChange={(value) => {
                      const [start, end] = value;
                      setFilters({
                        ...filters,
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
                      filters.createTimeStart ? new Date(filters.createTimeStart) : null,
                      filters.createTimeEnd ? new Date(filters.createTimeEnd) : null,
                    ]}
                    onChange={(value) => {
                      const [start, end] = value;
                      setFilters({
                        ...filters,
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
              <Text>Loading programs...</Text>
            </Group>
          )}

          {/* Program View - Grid or Table */}
          {!isLoading && (
            <>
              {viewMode === 'grid' ? (
                /* Grid View */
                <SimpleGrid 
                  cols={{ base: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
                  spacing="md"
                >
                  {displayedPrograms.map((program) => (
                    <ProgramCard
                      key={program.meta.resourceId}
                      program={program}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                /* Table View */
                <MantineReactTable table={table} />
              )}

              {displayedPrograms.length === 0 && !isLoading && (
                <Paper p="xl" withBorder style={{ minHeight: 400 }}>
                  <Stack align="center" gap="md" style={{ height: '100%' }} justify="center">
                    <Title order={3} c="dimmed">
                      No programs found
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
