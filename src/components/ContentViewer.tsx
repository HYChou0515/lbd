import { Box, Group, Button, Text } from '@mantine/core';
import Editor from '@monaco-editor/react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useState } from 'react';
import '../styles/markdown-preview.css';

interface ContentViewerProps {
  content: string;
  language?: string;
  title?: string;
  resourceType?: 'program' | 'case' | 'dataset' | 'code' | 'file';  // 資源類型
  showToggle?: boolean;
}

/**
 * 共用的內容顯示組件
 * 支援 Markdown 預覽和程式碼顯示的切換
 */
export function ContentViewer({ 
  content, 
  language = 'markdown', 
  title,
  resourceType,
  showToggle = true 
}: ContentViewerProps) {
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(language === 'markdown');
  const isMarkdown = language === 'markdown';

  // 根據資源類型生成完整的標題
  const getDisplayTitle = () => {
    if (!title) return undefined;
    
    if (resourceType === 'dataset') {
      return `${title} (Dataset Info)`;
    }
    if (resourceType === 'case') {
      return `${title} (Case Info)`;
    }
    if (resourceType === 'program') {
      return `${title} (Program Overview)`;
    }
    if (resourceType === 'code') {
      return `${title} (Code)`;
    }
    
    // 預設或 file 類型直接返回標題
    return title;
  };

  const displayTitle = getDisplayTitle();

  return (
    <>
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          {displayTitle && (
            <Text size="sm" c="dimmed" ff="monospace">
              {displayTitle}
            </Text>
          )}
          {/* 只在 Markdown 內容時顯示切換按鈕 */}
          {showToggle && isMarkdown && (
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
        {isMarkdownPreview && isMarkdown ? (
          <Box style={{ height: '100%', width: '100%', overflow: 'auto', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: 'none', minWidth: 0, boxSizing: 'border-box' }}>
              <MarkdownPreview 
                source={content}
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
            language={language}
            value={content}
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
}
