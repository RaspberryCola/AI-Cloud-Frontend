import React from 'react';
import { Breadcrumb } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface FileBreadcrumbProps {
  onBreadcrumbClick: (index: number) => void;
  onClearSearch: () => void;
}

export const FileBreadcrumb: React.FC<FileBreadcrumbProps> = ({
  onBreadcrumbClick,
  onClearSearch,
}) => {
  const { currentPath, isSearchMode, searchKey } = useSelector((state: RootState) => state.cloudDrive);

  return (
    <div className="mb-4">
      <Breadcrumb>
        {!isSearchMode ? (
          currentPath.map((item, index) => (
            <Breadcrumb.Item key={item.id || '根目录'}>
              <a onClick={() => onBreadcrumbClick(index)}>{item.name}</a>
            </Breadcrumb.Item>
          ))
        ) : (
          <>
            <Breadcrumb.Item>
              <a onClick={onClearSearch}>根目录</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              搜索"{searchKey}"的结果
            </Breadcrumb.Item>
          </>
        )}
      </Breadcrumb>
    </div>
  );
}; 