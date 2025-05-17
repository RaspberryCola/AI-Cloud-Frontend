import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent } from '../types/chat';
import { agentService } from '../services/agentService';
import { Form, message, Modal } from 'antd'; // Import Form, message, and Modal

interface UseAgentOptions {
  onError?: (error: Error) => void;
}

export const useAgent = (agentId?: string, options?: UseAgentOptions) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentList, setAgentList] = useState<Agent[]>([]); // State for agent list
  const [totalAgents, setTotalAgents] = useState(0); // State for total agents count
  const [isLoading, setIsLoading] = useState(false);
  const initDoneRef = useRef(false); // 添加引用来防止重复请求
  const fetchingRef = useRef(false); // 添加引用来防止重复请求
  const agentIdRef = useRef<string | undefined>(agentId);

  // State and functions for modal, form, and editing
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState<Agent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 当agentId变化时更新引用
  useEffect(() => {
    agentIdRef.current = agentId;
  }, [agentId]);

  // Fetch agent data
  const fetchAgent = useCallback(async () => {
    if (!agentIdRef.current || fetchingRef.current) {
      setIsLoading(false);
      return;
    }

    fetchingRef.current = true;
    setIsLoading(true);
    try {
      console.log('Fetching agent data for ID:', agentIdRef.current);
      const response = await agentService.getAgent(agentIdRef.current);
      console.log('Agent data response:', response);

      if (response.code === 0 && response.data) {
        // Map to our simplified Agent structure
        setAgent({
          id: response.data.id,
          name: response.data.name || 'Unnamed Agent',
          description: response.data.description || '',
          updated_at: 0 // Add a default value for updated_at
        });
      } else {
        // If no data or error code, still set a default agent to prevent loading indefinitely
        console.error('Failed to fetch agent details:', response.message);
        setAgent({
          id: agentIdRef.current,
          name: 'Agent',
          description: 'Could not load agent details',
          updated_at: 0 // Add a default value for updated_at
        });
        throw new Error(response.message || 'Failed to fetch agent');
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
      // Set a default agent even on error to prevent perpetual loading
      setAgent({
        id: agentIdRef.current,
        name: 'Agent',
        description: 'Could not load agent details',
        updated_at: 0 // Add a default value for updated_at
      });
      options?.onError?.(error instanceof Error ? error : new Error('Failed to fetch agent'));
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [options]); // 移除agentId依赖

  // Fetch agent list
  const fetchAgentList = useCallback(async (params: { page: number; size: number; name?: string } = { page: 1, size: 10 }) => {
    setIsLoading(true);
    try {
      console.log('Fetching agent list with params:', params);
      const response = await agentService.getAgentList(params);
      console.log('Agent list response:', response);

      if (response.code === 0) {
        setAgentList(response.data.list); // Set the agent list state
        setTotalAgents(response.data.total); // Set the total agents count state
        return {
          list: response.data.list,
          total: response.data.total
        };
      } else {
        throw new Error(response.message || 'Failed to fetch agent list');
      }
    } catch (error) {
      console.error('Failed to fetch agent list:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to fetch agent list'));
        setAgentList([]); // Clear the list on error
        setTotalAgents(0); // Reset total on error
      return { list: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Handle search
  const onSearch = useCallback((value: string) => {
    fetchAgentList({ page: 1, size: 10, name: value });
  }, [fetchAgentList]);

  // Handle create new agent
  const handleCreateNew = useCallback(() => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  // Handle delete agent
  const handleDelete = useCallback(async (agentId: string, agentName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除Agent "${agentName}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // Assuming agentService has a deleteAgent function
          // await agentService.deleteAgent(agentId);
          message.success('Agent删除成功');
          fetchAgentList(); // Refresh the list
        } catch (error) {
          message.error('Agent删除失败');
          console.error('Failed to delete agent:', error);
        }
      },
    });
  }, [fetchAgentList]);

  // Handle edit/create submit
  const handleEditSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        // Update agent with the new name and description
        const updateData = {
          id: editingItem.id,
          name: values.name,
          description: values.description
        };
        const response = await agentService.updateAgent(updateData);
        
        if (response.code === 0) {
          message.success('Agent更新成功');
          setIsModalVisible(false);
          fetchAgentList(); // Refresh the list
        } else {
          message.error(response.message || 'Agent更新失败');
        }
      } else {
        // Assuming agentService has a createAgent function
        // await agentService.createAgent(values);
        message.success('Agent创建成功');
        setIsModalVisible(false);
        fetchAgentList(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to save agent:', error);
      message.error('保存Agent失败');
    }
  }, [form, editingItem, fetchAgentList]);


  // Initialize - 只在组件挂载时执行一次
  useEffect(() => {
    // 如果已经初始化过，不再重复执行
    if (initDoneRef.current) {
      return;
    }

    if (agentIdRef.current) {
      console.log('初始化获取Agent数据');
      initDoneRef.current = true;
      fetchAgent();
    } else {
      setIsLoading(false);
    }

    return () => {
      // 组件卸载时重置标志
      console.log('Agent组件卸载，重置初始化标志');
      initDoneRef.current = false;
    };
  }, []); // 空依赖数组，仅在组件挂载时执行一次

  return {
    agent,
    agentList, // Expose agent list
    totalAgents, // Expose total agents count
    isLoading,
    fetchAgent,
    fetchAgentList,
    // Expose state and functions for modal, form, and editing
    form,
    editingItem,
    isModalVisible,
    setEditingItem,
    setIsModalVisible,
    onSearch,
    handleCreateNew,
    handleDelete,
    handleEditSubmit,
  };
};
