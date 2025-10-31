import { useLocalStorage } from '@mantine/hooks';

/**
 * 時間顯示模式
 */
export type TimeDisplayMode = 
  | 'absolute'     // 永遠顯示 YYYY/MM/DD HH:mm:ss
  | 'relative'     // 永遠顯示相對時間（如 5 days ago）
  | 'smart';       // 智能模式：超過閾值顯示絕對時間，否則相對時間

/**
 * 用戶偏好設置介面
 */
export interface UserPreferences {
  viewMode: 'grid' | 'table';
  sortBy: 'createTime' | 'updateTime';
  sortOrder: 'asc' | 'desc';
  filterTypes: string[];
  timeDisplayMode: TimeDisplayMode;
  timeDisplayThreshold: number; // 智能模式的閾值（小時數）
}

/**
 * 預設偏好設置
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  viewMode: 'grid',
  sortBy: 'updateTime',
  sortOrder: 'desc',
  filterTypes: [],
  timeDisplayMode: 'smart',
  timeDisplayThreshold: 24, // 預設 24 小時
};

const STORAGE_KEY = 'dataset-web-user-preferences';

/**
 * 自定義 Hook：管理用戶偏好設置
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>({
    key: STORAGE_KEY,
    defaultValue: DEFAULT_PREFERENCES,
    getInitialValueInEffect: false,
  });

  // 更新 view mode
  const setViewMode = (viewMode: 'grid' | 'table') => {
    setPreferences(prev => ({ ...prev, viewMode }));
  };

  // 更新 sort by
  const setSortBy = (sortBy: 'createTime' | 'updateTime') => {
    setPreferences(prev => ({ ...prev, sortBy }));
  };

  // 更新 sort order
  const setSortOrder = (sortOrder: 'asc' | 'desc') => {
    setPreferences(prev => ({ ...prev, sortOrder }));
  };

  // 更新 filter types
  const setFilterTypes = (filterTypes: string[]) => {
    setPreferences(prev => ({ ...prev, filterTypes }));
  };

  // 更新時間顯示模式
  const setTimeDisplayMode = (timeDisplayMode: TimeDisplayMode) => {
    setPreferences(prev => ({ ...prev, timeDisplayMode }));
  };

  // 更新時間顯示閾值
  const setTimeDisplayThreshold = (timeDisplayThreshold: number) => {
    setPreferences(prev => ({ ...prev, timeDisplayThreshold }));
  };

  // 重置為預設值
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    setViewMode,
    setSortBy,
    setSortOrder,
    setFilterTypes,
    setTimeDisplayMode,
    setTimeDisplayThreshold,
    resetPreferences,
  };
}
