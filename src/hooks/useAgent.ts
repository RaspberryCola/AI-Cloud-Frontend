import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent } from '../types/chat';
import { agentService } from '../services/agentService';

interface UseAgentOptions {
  onError?: (error: Error) => void;
}

export const useAgent = (agentId?: string, options?: UseAgentOptions) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initDoneRef = useRef(false); // 添加引用来防止重复请求
  const fetchingRef = useRef(false); // 添加引用来防止重复请求
  const agentIdRef = useRef<string | undefined>(agentId);
  
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
          description: response.data.description || ''
        });
      } else {
        // If no data or error code, still set a default agent to prevent loading indefinitely
        console.error('Failed to fetch agent details:', response.message);
        setAgent({
          id: agentIdRef.current,
          name: 'Agent',
          description: 'Could not load agent details'
        });
        throw new Error(response.message || 'Failed to fetch agent');
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
      // Set a default agent even on error to prevent perpetual loading
      setAgent({
        id: agentIdRef.current,
        name: 'Agent',
        description: 'Could not load agent details'
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
      return { list: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
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
    isLoading,
    fetchAgent,
    fetchAgentList
  };
}; 