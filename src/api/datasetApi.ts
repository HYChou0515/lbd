import type { DatasetDataMeta } from '../types/dataset';
import { mockDatasets } from '../data/mockData';

// 模擬當前登入使用者
export const CURRENT_USER = 'john.doe';

// API 請求參數
export interface DatasetApiParams {
  // 後端支援的參數
  createTimeStart?: string; // ISO string
  createTimeEnd?: string;   // ISO string
  updateTimeStart?: string; // ISO string
  updateTimeEnd?: string;   // ISO string
  sortBy?: 'createTime' | 'updateTime';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// API 回應
export interface DatasetApiResponse {
  data: DatasetDataMeta[];
  total: number;
  page: number;
  pageSize: number;
}

// 模擬 API 延遲
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 模擬 API 呼叫取得 datasets
 * 這個函數模擬後端只支援有限的 filter 參數
 */
export async function fetchDatasets(params: DatasetApiParams = {}): Promise<DatasetApiResponse> {
  // 模擬網路延遲
  await delay(300);

  let filtered = [...mockDatasets];

  // 後端支援：Filter by create time range
  if (params.createTimeStart) {
    const startTime = new Date(params.createTimeStart).getTime();
    filtered = filtered.filter(d => new Date(d.meta.createdTime).getTime() >= startTime);
  }
  if (params.createTimeEnd) {
    const endTime = new Date(params.createTimeEnd).getTime();
    filtered = filtered.filter(d => new Date(d.meta.createdTime).getTime() <= endTime);
  }

  // 後端支援：Filter by update time range
  if (params.updateTimeStart) {
    const startTime = new Date(params.updateTimeStart).getTime();
    filtered = filtered.filter(d => new Date(d.meta.updatedTime).getTime() >= startTime);
  }
  if (params.updateTimeEnd) {
    const endTime = new Date(params.updateTimeEnd).getTime();
    filtered = filtered.filter(d => new Date(d.meta.updatedTime).getTime() <= endTime);
  }

  // 後端支援：Sort
  if (params.sortBy) {
    filtered.sort((a, b) => {
      const timeA = params.sortBy === 'createTime' 
        ? new Date(a.meta.createdTime).getTime()
        : new Date(a.meta.updatedTime).getTime();
      const timeB = params.sortBy === 'createTime'
        ? new Date(b.meta.createdTime).getTime()
        : new Date(b.meta.updatedTime).getTime();
      
      return params.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }

  const total = filtered.length;

  // 後端支援：Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    data: paginated,
    total,
    page,
    pageSize,
  };
}

/**
 * 前端額外的過濾邏輯
 * 這些是後端不支援，但前端需要的過濾功能
 */
export interface FrontendFilters {
  mine?: boolean;              // Filter by current user
  creators?: string[];         // Filter by creators (multiselect)
  types?: string[];            // Filter by types (multiselect)
  searchQuery?: string;        // Global search string
}

export function applyFrontendFilters(
  datasets: DatasetDataMeta[],
  filters: FrontendFilters
): DatasetDataMeta[] {
  let filtered = [...datasets];

  // Filter: Mine (creator == current user)
  if (filters.mine) {
    filtered = filtered.filter(d => d.meta.creator === CURRENT_USER);
  }

  // Filter: Creators (multiselect)
  if (filters.creators && filters.creators.length > 0) {
    filtered = filtered.filter(d => filters.creators!.includes(d.meta.creator));
  }

  // Filter: Types (multiselect)
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(d => filters.types!.includes(d.data.type));
  }

  // Filter: Global search string
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(d => {
      // Search in name
      if (d.data.name.toLowerCase().includes(query)) return true;
      
      // Search in description
      if (d.data.description.toLowerCase().includes(query)) return true;
      
      // Search in process info (if not Group type)
      if ('toolId' in d.data) {
        if (d.data.toolId.toLowerCase().includes(query)) return true;
        if (d.data.waferId.toLowerCase().includes(query)) return true;
        if (d.data.lotId.toLowerCase().includes(query)) return true;
        if (d.data.part.toLowerCase().includes(query)) return true;
      }
      
      // Search in recipe/stage (if available)
      if ('recipe' in d.data) {
        if (d.data.recipe.toLowerCase().includes(query)) return true;
        if (d.data.stage.toLowerCase().includes(query)) return true;
      }
      
      return false;
    });
  }

  return filtered;
}

/**
 * 取得所有不重複的 creators
 */
export function getAllCreators(): string[] {
  const creators = new Set(mockDatasets.map(d => d.meta.creator));
  return Array.from(creators).sort();
}

/**
 * 取得所有不重複的 dataset types
 */
export function getAllTypes(): string[] {
  const types = new Set(mockDatasets.map(d => d.data.type));
  return Array.from(types).sort();
}
