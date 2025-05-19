import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Checkbox, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Permission {
  label: string;
  value: string;
}

const permissionOptions: Permission[] = [
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '系统设置', value: 'setting' },
  { label: '数据统计', value: 'stats' },
];

const Roles: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const initialData: Role[] = [
    {
      key: '1',
      name: '超级管理员',
      description: '拥有所有权限',
      permissions: ['user', 'role', 'setting', 'stats'],
    },
    {
      key: '2',
      name: '普通管理员',
      description: '拥有部分权限',
      permissions: ['user', 'stats'],
    },
  ];

  const [data, setData] = useState<Role[]>(initialData);

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <span>
          {permissions.map(p => {
            const permission = permissionOptions.find(item => item.value === p);
            return permission ? permission.label : p;
          }).join(', ')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Role) => (
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

  const handleEdit = (record: Role) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个角色吗？',
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
          添加角色
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="key"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Modal
        title={editingKey ? '编辑角色' : '添加角色'}
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
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称!' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择权限!' }]}
          >
            <Checkbox.Group options={permissionOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Roles; 