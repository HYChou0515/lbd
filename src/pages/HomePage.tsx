import { Container, Title, TextInput, Select, Group, SimpleGrid, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { DatasetCard } from '../components/DatasetCard';
import { mockDatasets } from '../data/mockData';

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // 過濾資料集
  const filteredDatasets = mockDatasets.filter((dataset) => {
    const matchesSearch = 
      dataset.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.data.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || selectedType === 'all' || dataset.data.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Dataset Type 選項
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'EBI', label: 'EBI' },
    { value: 'Escan IDT', label: 'Escan IDT' },
    { value: 'Escan IDT Result', label: 'Escan IDT Result' },
    { value: 'PrimeV IDT', label: 'PrimeV IDT' },
    { value: 'PrimeV IDT Result', label: 'PrimeV IDT Result' },
    { value: 'GDS', label: 'GDS' },
    { value: 'Review Ready', label: 'Review Ready' },
    { value: 'RSEM', label: 'RSEM' },
    { value: 'RSEM Result', label: 'RSEM Result' },
    { value: 'Group', label: 'Group' },
  ];

  const handleViewDetails = (resourceId: string) => {
    navigate({ to: '/dataset/$resourceId', params: { resourceId } });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} mb="md">📦 Dataset Collection</Title>
          <Group grow>
            <TextInput
              placeholder="Search datasets..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
            <Select
              placeholder="Filter by type"
              data={typeOptions}
              value={selectedType}
              onChange={setSelectedType}
              clearable
            />
          </Group>
        </div>

        {/* Dataset Grid */}
        <SimpleGrid 
          cols={{ base: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
          spacing="md"
        >
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.meta.resourceId}
              datasetMeta={dataset}
              onViewDetails={handleViewDetails}
            />
          ))}
        </SimpleGrid>

        {filteredDatasets.length === 0 && (
          <Title order={3} ta="center" c="dimmed">
            No datasets found
          </Title>
        )}
      </Stack>
    </Container>
  );
}
