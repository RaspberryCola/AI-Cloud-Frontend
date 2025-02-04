import React from 'react';
import {
  FolderOutlined,
  FileOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';

export const getFileIcon = (fileName: string, isDir: boolean) => {
  if (isDir) return <FolderOutlined className="text-blue-500" />;
  
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'doc':
    case 'docx':
      return <FileWordOutlined className="text-blue-600" />;
    case 'xls':
    case 'xlsx':
      return <FileExcelOutlined className="text-green-600" />;
    case 'pdf':
      return <FilePdfOutlined className="text-red-600" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return <FileImageOutlined className="text-purple-600" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileZipOutlined className="text-orange-600" />;
    case 'md':
      return <FileMarkdownOutlined className="text-cyan-600" />;
    case 'txt':
      return <FileTextOutlined className="text-gray-600" />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return <PlayCircleOutlined className="text-pink-600" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'py':
    case 'java':
    case 'cpp':
      return <CodeOutlined className="text-yellow-600" />;
    default:
      return <FileOutlined className="text-gray-500" />;
  }
}; 