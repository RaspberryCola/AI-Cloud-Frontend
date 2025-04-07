import React from 'react';
import { Input, Button, Card, Typography, message } from 'antd';
import type { RetrieveItem } from '../../types/knowledge';
import {knowledgeService } from '../../services/knowledgeService';

const { TextArea } = Input;
const { Text } = Typography;

interface RetrieveTestProps {
  kbId: string;
}

const RetrieveTest: React.FC<RetrieveTestProps> = ({ kbId }) => {
  const [queryText, setQueryText] = React.useState('');
  const [topK, setTopK] = React.useState(3);
  const [retrieveResults, setRetrieveResults] = React.useState<RetrieveItem[]>([]);
  const [retrieveLoading, setRetrieveLoading] = React.useState(false);

  const handleTest = async () => {
    if (!queryText) {
      message.warning('请输入查询文本');
      return;
    }
    try {
      setRetrieveLoading(true);
      const res = await knowledgeService.retrieveKnowledge({
        kb_id: kbId,
        query: queryText,
        top_k: topK
      });
      if (res.code === 0) {
        setRetrieveResults(res.data);
      } else {
        message.error(res.message || '召回测试失败');
      }
    } catch (error) {
      message.error('召回测试失败');
    } finally {
      setRetrieveLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/2 pr-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">召回测试</h3>
          <p className="text-gray-500 mb-4">根据给定的查询文本测试知识的召回效果。</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            召回数量 (top_k)
          </label>
          <Input 
            type="number" 
            min={1} 
            max={10}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-20"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            查询文本
          </label>
          <TextArea
            rows={8}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="请输入查询文本..."
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="primary" 
            loading={retrieveLoading}
            onClick={handleTest}
          >
            测试
          </Button>
        </div>
      </div>

      <div className="w-1/2 pl-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">
            {retrieveResults.length > 0 ? 
              `${retrieveResults.length}个召回段落` : 
              '召回结果'}
          </h3>
        </div>

        <div className="space-y-4">
          {retrieveResults.map((item, index) => (
            <Card key={item.id} className="shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <Text strong>Chunk-{String(index + 1).padStart(2, '0')}</Text>
                <Text type="secondary">得分: {item.score.toFixed(4)}</Text>
              </div>
              <div className="mb-2">
                <Text>{item.content}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-sm">
                  {item.document_name} / index-{item.index}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RetrieveTest;