import { useState } from 'react';

interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
}

interface SorterInfo {
  field: string;
  order: 'ascend' | 'descend' | undefined;
}

interface FilterInfo {
  [key: string]: any[];
}

interface TableParams {
  pagination: TablePagination;
  sorter: SorterInfo | null;
  filters: FilterInfo;
}

interface TableHook<T> {
  data: T[];
  loading: boolean;
  tableParams: TableParams;
  handleTableChange: (
    pagination: TablePagination,
    filters: FilterInfo,
    sorter: SorterInfo
  ) => void;
  refresh: () => void;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * 自定义Hook，用于处理Ant Design表格的分页、排序和过滤
 * @param initialData 初始数据
 * @param fetchData 获取数据的函数
 * @returns 表格数据、加载状态和处理函数
 */
function useTable<T>(
  initialData: T[] = [],
  fetchData?: (params: TableParams) => Promise<{ data: T[]; total: number }>
): TableHook<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sorter: null,
    filters: {},
  });

  // 处理表格变化（分页、排序、过滤）
  const handleTableChange = (
    pagination: TablePagination,
    filters: FilterInfo,
    sorter: SorterInfo
  ) => {
    setTableParams({
      pagination,
      filters,
      sorter: sorter ? { field: sorter.field, order: sorter.order } : null,
    });

    // 如果有fetchData函数，则获取新数据
    if (fetchData) {
      setLoading(true);
      fetchData({
        pagination,
        filters,
        sorter: sorter ? { field: sorter.field, order: sorter.order } : null,
      })
        .then(({ data, total }) => {
          setData(data);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              ...prev.pagination,
              total,
            },
          }));
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching table data:', error);
          setLoading(false);
        });
    }
  };

  // 刷新表格数据
  const refresh = () => {
    if (fetchData) {
      setLoading(true);
      fetchData(tableParams)
        .then(({ data, total }) => {
          setData(data);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              ...prev.pagination,
              total,
            },
          }));
          setLoading(false);
        })
        .catch(error => {
          console.error('Error refreshing table data:', error);
          setLoading(false);
        });
    }
  };

  return {
    data,
    loading,
    tableParams,
    handleTableChange,
    refresh,
    setData,
    setLoading,
  };
}

export default useTable; 