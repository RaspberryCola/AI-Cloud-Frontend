import { useState, useEffect, useCallback } from 'react';
import { Agent } from '../types/chat';
import { agentService } from '../services/agentService';

interface UseAgentOptions {
  onError?: (error: Error) => void;
}

export const useAgent = (agentId?: string, options?: UseAgentOptions) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch agent data
  const fetchAgent = useCallback(async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    try {
      const response = await agentService.getAgent(agentId);
      if (response.code === 0) {
        setAgent({
          id: response.data.id,
          name: response.data.name,
          description: response.data.description
        });
      } else {
        throw new Error(response.message || 'Failed to fetch agent');
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
      options?.onError?.(error instanceof Error ? error : new Error('Failed to fetch agent'));
    } finally {
      setIsLoading(false);
    }
  }, [agentId, options]);
  
  // Fetch agent list
  const fetchAgentList = useCallback(async (params: { page: number; size: number; name?: string } = { page: 1, size: 10 }) => {
    setIsLoading(true);
    try {
      const response = await agentService.getAgentList(params);
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
  
  // Initialize
  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId, fetchAgent]);
  
  return {
    agent,
    isLoading,
    fetchAgent,
    fetchAgentList
  };
}; 