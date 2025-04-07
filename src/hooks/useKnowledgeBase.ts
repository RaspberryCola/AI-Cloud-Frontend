import { useState } from 'react';
import { Form, message, Modal } from 'antd';
import { KnowledgeItem } from '../types/knowledge';
import { knowledgeService } from '../services/knowledgeService';

export const useKnowledgeBase = () => {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [data, setData] = useState<KnowledgeItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async (params: { page: number; page_size: number; name?: string }) => {
        setLoading(true);
        try {
            const res = await knowledgeService.getKnowledgeList(params);
            if (res.code === 0) {
                setData(res.data.list);
            } else {
                message.error(res.message || '操作失败');
            }
        } catch (error) {
            message.error('操作失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchKnowledgeList = async () => {
        fetchData({ page: 1, page_size: 10 });
    };

    const onSearch = async (value: string) => {
        fetchData({ page: 1, page_size: 10, name: value });
    };

    const handleCreateNew = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleDelete = (ID: string, Name: string) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除知识库"${Name}"吗？`,
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            async onOk() {
                try {
                    const res = await knowledgeService.deleteKnowledge(ID);
                    if (res.code === 0) {
                        message.success('删除成功');
                        fetchKnowledgeList();
                    } else {
                        message.error(res.message || '删除失败');
                    }
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                const res = await knowledgeService.updateKnowledge({
                    kb_id: editingItem.ID,
                    name: values.name,
                    description: values.description,
                });
                if (res.code === 0) {
                    message.success('更新成功');
                    fetchKnowledgeList();
                } else {
                    message.error(res.message || '更新失败');
                }
            } else {
                const res = await knowledgeService.createKnowledge(values);
                if (res.code === 0) {
                    message.success('创建成功');
                    fetchKnowledgeList();
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
        fetchKnowledgeList,
        handleCreateNew,
        handleDelete,
        handleEditSubmit,
    };
};