import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Space, Modal, message, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import WorkflowForm from './WorkflowForm';
import WorkflowDesigner from './WorkflowDesigner';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

const WorkflowPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [designerVisible, setDesignerVisible] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 模拟加载数据
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const mockData: Workflow[] = [
        {
          id: '1',
          name: '客户审批流程',
          description: '新客户审批流程',
          status: 'active',
          createdAt: '2025-04-15 15:30:00',
          updatedAt: '2025-04-15 15:30:00',
        },
        {
          id: '2',
          name: '请假申请流程',
          description: '员工请假申请流程',
          status: 'draft',
          createdAt: '2025-04-14 09:20:00',
          updatedAt: '2025-04-14 09:20:00',
        },
      ];
      setWorkflows(mockData);
      setLoading(false);
    }, 500);
  };

  const handleAdd = () => {
    setCurrentWorkflow(null);
    setVisible(true);
  };

  const handleEdit = (record: Workflow) => {
    setCurrentWorkflow(record);
    setVisible(true);
  };

  const handleDesign = (record: Workflow) => {
    setCurrentWorkflow(record);
    setDesignerVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此工作流吗？此操作无法撤销。',
      onOk() {
        // 模拟删除操作
        setWorkflows(workflows.filter(item => item.id !== id));
        message.success('工作流已删除');
      },
    });
  };

  const handleFormSubmit = (values: any) => {
    setConfirmLoading(true);
    setTimeout(() => {
      if (currentWorkflow) {
        // 更新现有工作流
        const updated = workflows.map(item => 
          item.id === currentWorkflow.id 
            ? { ...item, ...values, updatedAt: new Date().toLocaleString() }
            : item
        );
        setWorkflows(updated);
        message.success('工作流已更新');
      } else {
        // 添加新工作流
        const newWorkflow: Workflow = {
          id: (Math.random() * 1000).toFixed(0),
          name: values.name,
          description: values.description,
          status: 'draft',
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        };
        setWorkflows([...workflows, newWorkflow]);
        message.success('工作流已创建');
      }
      setVisible(false);
      setConfirmLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '已激活' },
          inactive: { color: 'orange', text: '未激活' },
          draft: { color: 'blue', text: '草稿' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Workflow) => (
        <Space size="middle">
          <Tooltip title="设计">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleDesign(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="工作流管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            创建工作流
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={workflows}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <WorkflowForm
        visible={visible}
        confirmLoading={confirmLoading}
        workflow={currentWorkflow}
        onCancel={() => setVisible(false)}
        onSubmit={handleFormSubmit}
      />
      
      <WorkflowDesigner
        visible={designerVisible}
        workflow={currentWorkflow}
        onCancel={() => setDesignerVisible(false)}
      />
    </div>
  );
};

export default WorkflowPage; 