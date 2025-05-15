import { useState } from 'react';
import { Form, message, Modal } from 'antd';
import { AgentItem } from '../types/agent';
import { agentService } from '../services/agentService';

export const useAgent = () => {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState<AgentItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [data, setData] = useState<AgentItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async (params: { page: number; size: number; name?: string }) => {
        setLoading(true);
        try {
            const res = await agentService.getAgentList(params);
            if (res.code === 0) {
                setData(res.data.list);
            } else {
                message.error(res.message || '操作失败');
            }
        } catch (error) {
            message.error('操作失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgentList = async () => {
        fetchData({ page: 1, size: 10 });
    };

    const onSearch = async (value: string) => {
        fetchData({ page: 1, size: 10, name: value });
    };

    const handleCreateNew = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleDelete = (id: string, name: string) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除Agent "${name}"吗？`,
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            async onOk() {
                try {
                    const res = await agentService.deleteAgent(id);
                    if (res.code === 0) {
                        message.success('删除成功');
                        fetchAgentList();
                    } else {
                        message.error(res.message || '删除失败');
                    }
                } catch (error) {
                    message.error('删除失败');
                    console.error(error);
                }
            },
        });
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                const res = await agentService.updateAgent({
                    id: editingItem.id,
                    name: values.name,
                    description: values.description,
                });
                if (res.code === 0) {
                    message.success('更新成功');
                    fetchAgentList();
                } else {
                    message.error(res.message || '更新失败');
                }
            } else {
                const res = await agentService.createAgent({
                    name: values.name,
                    description: values.description,
                });
                if (res.code === 0) {
                    message.success('创建成功');
                    fetchAgentList();
                } else {
                    message.error(res.message || '创建失败');
                }
            }
            setIsModalVisible(false);
        } catch (error) {
            console.error('操作失败:', error);
        }
    };

    return {
        form,
        editingItem,
        isModalVisible,
        data,
        loading,
        setEditingItem,
        setIsModalVisible,
        onSearch,
        fetchAgentList,
        handleCreateNew,
        handleDelete,
        handleEditSubmit,
    };
}; 