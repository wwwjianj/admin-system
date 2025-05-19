import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface User {
  key: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const Users: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  // 模拟用户数据
  const initialData: User[] = [
    {
      key: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
    },
    {
      key: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'editor',
      status: 'active',
    },
    {
      key: '3',
      name: 'Tom Brown',
      email: 'tom@example.com',
      role: 'user',
      status: 'inactive',
    },
  ];

  const [data, setData] = useState<User[]>(initialData);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap: Record<string, string> = {
          admin: '管理员',
          editor: '编辑',
          user: '普通用户',
        };
        return roleMap[role] || role;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          active: '激活',
          inactive: '禁用',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setEditingKey('');
    setIsModalVisible(true);
  };

  const handleEdit = (record: User) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk() {
        setData(data.filter(item => item.key !== key));
        message.success('删除成功');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newData = [...data];
      if (editingKey) {
        const index = newData.findIndex(item => editingKey === item.key);
        if (index > -1) {
          newData[index] = { ...newData[index], ...values };
          setData(newData);
          message.success('编辑成功');
        }
      } else {
        newData.push({
          key: Date.now().toString(),
          ...values,
        });
        setData(newData);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingKey('');
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加用户
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="key" 
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title={editingKey ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingKey('');
        }}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色!' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="editor">编辑</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态!' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">激活</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 