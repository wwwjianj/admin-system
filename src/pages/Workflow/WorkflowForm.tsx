import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface WorkflowFormProps {
  visible: boolean;
  confirmLoading: boolean;
  workflow: Workflow | null;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const { Option } = Select;
const { TextArea } = Input;

const WorkflowForm: React.FC<WorkflowFormProps> = ({
  visible,
  confirmLoading,
  workflow,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && workflow) {
      form.setFieldsValue({
        name: workflow.name,
        description: workflow.description,
        status: workflow.status
      });
    } else {
      form.resetFields();
    }
  }, [visible, workflow, form]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  return (
    <Modal
      title={workflow ? '编辑工作流' : '创建工作流'}
      open={visible}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'draft' }}
      >
        <Form.Item
          name="name"
          label="工作流名称"
          rules={[{ required: true, message: '请输入工作流名称' }]}
        >
          <Input placeholder="请输入工作流名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: true, message: '请输入工作流描述' }]}
        >
          <TextArea rows={4} placeholder="请输入工作流描述" />
        </Form.Item>
        
        {workflow && (
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="active">激活</Option>
              <Option value="inactive">未激活</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default WorkflowForm; 