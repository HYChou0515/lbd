import type { TimeDisplayMode } from '../hooks/useUserPreferences';

/**
 * 檢查日期是否為今天
 */
function isToday(date: Date): boolean {
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * 格式化時間為完整絕對時間格式：YYYY/MM/DD HH:mm:ss（始終包含日期）
 */
export function formatFullAbsoluteTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化時間為絕對時間格式：YYYY/MM/DD HH:mm:ss
 * 如果是今天，則只顯示 HH:mm:ss
 */
export function formatAbsoluteTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;
  
  // 檢查是否為今天
  if (isToday(d)) {
    return timeStr;
  }
  
  // 不是今天，顯示完整日期
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day} ${timeStr}`;
}

/**
 * 格式化時間為相對時間格式：X days ago, X hours ago 等
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }
}

/**
 * 根據用戶偏好設置格式化時間
 */
export function formatTime(
  date: Date | string,
  mode: TimeDisplayMode,
  thresholdHours: number = 24
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (mode) {
    case 'absolute':
      return formatAbsoluteTime(d);
    
    case 'relative':
      return formatRelativeTime(d);
    
    case 'smart': {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      // 如果是今天且在閾值內，顯示相對時間
      if (isToday(d) && diffHours < thresholdHours) {
        return formatRelativeTime(d);
      }
      
      // 否則顯示絕對時間
      return formatAbsoluteTime(d);
    }
    
    default:
      return formatAbsoluteTime(d);
  }
}

/**
 * 格式化時間並返回顯示文本和 tooltip
 * 當顯示相對時間時，tooltip 顯示絕對時間
 * 當是今天的絕對時間（只顯示時間），tooltip 顯示完整日期+時間
 */
export function formatTimeWithTooltip(
  date: Date | string,
  mode: TimeDisplayMode,
  thresholdHours: number = 24
): { display: string; tooltip: string | null; isRelative: boolean } {
  const d = typeof date === 'string' ? new Date(date) : date;
  const absoluteTime = formatAbsoluteTime(d);
  const fullAbsoluteTime = formatFullAbsoluteTime(d);
  const isTodayDate = isToday(d);
  
  switch (mode) {
    case 'absolute':
      // 絕對時間模式
      // 如果是今天（只顯示時間），tooltip 顯示完整日期
      if (isTodayDate) {
        return {
          display: absoluteTime,
          tooltip: fullAbsoluteTime,
          isRelative: false,
        };
      }
      // 不是今天（已顯示完整日期），不需要 tooltip
      return {
        display: absoluteTime,
        tooltip: null,
        isRelative: false,
      };
    
    case 'relative':
      // 相對時間模式，tooltip 顯示完整絕對時間
      return {
        display: formatRelativeTime(d),
        tooltip: fullAbsoluteTime,
        isRelative: true,
      };
    
    case 'smart': {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      // 如果是今天且在閾值內，顯示相對時間 + tooltip 完整時間
      if (isTodayDate && diffHours < thresholdHours) {
        return {
          display: formatRelativeTime(d),
          tooltip: fullAbsoluteTime,
          isRelative: true,
        };
      }
      
      // 否則顯示絕對時間
      // 如果是今天（只顯示時間），tooltip 顯示完整日期
      if (isTodayDate) {
        return {
          display: absoluteTime,
          tooltip: fullAbsoluteTime,
          isRelative: false,
        };
      }
      // 不是今天（已顯示完整日期），不需要 tooltip
      return {
        display: absoluteTime,
        tooltip: null,
        isRelative: false,
      };
    }
    
    default:
      return {
        display: absoluteTime,
        tooltip: isTodayDate ? fullAbsoluteTime : null,
        isRelative: false,
      };
  }
}
