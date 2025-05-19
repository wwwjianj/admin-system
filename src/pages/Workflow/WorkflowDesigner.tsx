import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, message, Space, Card, Divider, Tooltip, Form, Input, Select, Popconfirm, InputNumber, Tag } from 'antd';
import { SaveOutlined, PlayCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface NodeProperty {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  value: any;
  options?: string[]; // 用于select类型
}

interface Node {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  properties: NodeProperty[];
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  condition?: string;
}

interface ConnectionPoint {
  nodeId: string;
  x: number;
  y: number;
  type: 'input' | 'output';
}

interface WorkflowDesignerProps {
  visible: boolean;
  workflow: Workflow | null;
  onCancel: () => void;
}

// 定义节点类型和默认属性
const nodeTypes = [
  { 
    key: 'start', 
    title: '开始', 
    color: '#1890ff',
    defaultProperties: [
      { id: 'prop1', name: '触发条件', type: 'select', value: '手动触发', options: ['手动触发', '定时触发', '事件触发'] }
    ]
  },
  { 
    key: 'approval', 
    title: '审批', 
    color: '#52c41a',
    defaultProperties: [
      { id: 'prop1', name: '审批人', type: 'string', value: '' },
      { id: 'prop2', name: '审批类型', type: 'select', value: '单人审批', options: ['单人审批', '多人审批', '角色审批'] },
      { id: 'prop3', name: '超时时间(小时)', type: 'number', value: 24 }
    ]
  },
  { 
    key: 'condition', 
    title: '条件', 
    color: '#faad14',
    defaultProperties: [
      { id: 'prop1', name: '条件表达式', type: 'string', value: '' },
      { id: 'prop2', name: '默认路径', type: 'select', value: '是', options: ['是', '否'] }
    ]
  },
  { 
    key: 'task', 
    title: '任务', 
    color: '#722ed1',
    defaultProperties: [
      { id: 'prop1', name: '任务名称', type: 'string', value: '' },
      { id: 'prop2', name: '任务类型', type: 'select', value: '人工任务', options: ['人工任务', '自动任务', '服务任务'] },
      { id: 'prop3', name: '执行人', type: 'string', value: '' }
    ]
  },
  { 
    key: 'end', 
    title: '结束', 
    color: '#f5222d',
    defaultProperties: [
      { id: 'prop1', name: '结束状态', type: 'select', value: '正常结束', options: ['正常结束', '异常结束', '中止'] }
    ]
  },
];

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  visible,
  workflow,
  onCancel
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [draggedNode, setDraggedNode] = useState<{ node: Node, offsetX: number, offsetY: number } | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<ConnectionPoint | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
  const [form] = Form.useForm();
  const [edgeForm] = Form.useForm();

  const canvasRef = useRef<HTMLDivElement>(null);

  // 初始化，如果有保存的流程图则加载
  useEffect(() => {
    if (visible && workflow) {
      // 加载模拟数据
      const initialNodes: Node[] = [
        { 
          id: '1', 
          type: 'start', 
          title: '开始', 
          position: { x: 100, y: 100 },
          properties: [
            { id: 'prop1', name: '触发条件', type: 'select', value: '手动触发', options: ['手动触发', '定时触发', '事件触发'] }
          ]
        },
        { 
          id: '2', 
          type: 'approval', 
          title: '经理审批', 
          position: { x: 100, y: 250 },
          properties: [
            { id: 'prop1', name: '审批人', type: 'string', value: '张经理' },
            { id: 'prop2', name: '审批类型', type: 'select', value: '单人审批', options: ['单人审批', '多人审批', '角色审批'] },
            { id: 'prop3', name: '超时时间(小时)', type: 'number', value: 24 }
          ]
        },
        { 
          id: '3', 
          type: 'end', 
          title: '结束', 
          position: { x: 100, y: 400 },
          properties: [
            { id: 'prop1', name: '结束状态', type: 'select', value: '正常结束', options: ['正常结束', '异常结束', '中止'] }
          ]
        },
      ];
      
      const initialEdges: Edge[] = [
        { id: 'e1-2', source: '1', target: '2', label: '提交' },
        { id: 'e2-3', source: '2', target: '3', label: '完成' },
      ];
      
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [visible, workflow]);

  // 当节点被选中时，更新表单
  useEffect(() => {
    if (selectedNode) {
      console.log('节点被选中:', selectedNode.id, selectedNode.title);
      const values: Record<string, any> = {};
      selectedNode.properties.forEach(prop => {
        values[prop.id] = prop.value;
      });
      form.setFieldsValue(values);
    } else {
      form.resetFields();
    }
  }, [selectedNode, form]);

  // 当连线被选中时，更新表单
  useEffect(() => {
    if (selectedEdge) {
      console.log('连线被选中:', selectedEdge.id, selectedEdge.label);
      edgeForm.setFieldsValue({
        label: selectedEdge.label,
        condition: selectedEdge.condition || ''
      });
    } else {
      edgeForm.resetFields();
    }
  }, [selectedEdge, edgeForm]);

  // 添加新节点
  const handleAddNode = (type: string, title: string) => {
    // 查找节点类型的默认属性
    const nodeType = nodeTypes.find(nt => nt.key === type);
    const defaultProperties = nodeType?.defaultProperties || [];
    
    // 创建属性的深拷贝，避免引用问题
    const properties = JSON.parse(JSON.stringify(defaultProperties));
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      title,
      position: {
        x: 150,
        y: 150,
      },
      properties
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  };

  // 更新节点属性
  const handleUpdateNodeProperties = (values: any) => {
    if (!selectedNode) return;
    
    const updatedNode = { ...selectedNode };
    
    // 更新属性值
    updatedNode.properties = updatedNode.properties.map(prop => ({
      ...prop,
      value: values[prop.id]
    }));
    
    // 更新节点标题（如果是任务节点且有任务名称属性）
    if (updatedNode.type === 'task') {
      const taskNameProp = updatedNode.properties.find(p => p.name === '任务名称');
      if (taskNameProp && taskNameProp.value) {
        updatedNode.title = taskNameProp.value;
      }
    }
    
    // 更新节点列表
    setNodes(nodes.map(node => 
      node.id === selectedNode.id ? updatedNode : node
    ));
    
    setSelectedNode(updatedNode);
    message.success('节点属性已更新');
  };

  // 更新连线属性
  const handleUpdateEdgeProperties = (values: any) => {
    if (!selectedEdge) return;
    
    const updatedEdge = { 
      ...selectedEdge,
      label: values.label,
      condition: values.condition
    };
    
    // 更新连线列表
    setEdges(edges.map(edge => 
      edge.id === selectedEdge.id ? updatedEdge : edge
    ));
    
    setSelectedEdge(updatedEdge);
    message.success('连线属性已更新');
  };

  // 删除选中节点
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    
    // 删除相关连线
    const filteredEdges = edges.filter(
      edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id
    );
    
    setEdges(filteredEdges);
    setNodes(nodes.filter(n => n.id !== selectedNode.id));
    setSelectedNode(null);
    message.success('节点已删除');
  };

  // 删除选中连线
  const handleDeleteEdge = () => {
    if (!selectedEdge) return;
    
    setEdges(edges.filter(e => e.id !== selectedEdge.id));
    setSelectedEdge(null);
    message.success('连线已删除');
  };

  // 保存流程图
  const handleSave = () => {
    if (!workflow) return;
    
    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      message.success('工作流设计已保存');
    }, 800);
  };

  // 模拟运行
  const handleRun = () => {
    message.info('开始模拟运行工作流');
    // 这里可以添加模拟运行的逻辑
  };

  // 处理节点拖动开始
  const handleNodeDragStart = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    // 获取鼠标相对于节点的偏移
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDraggedNode({
      node,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    });
    
    // 选中该节点
    setSelectedNode(node);
    // 取消选中连线
    setSelectedEdge(null);
  };

  // 处理节点拖动
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - canvasRect.left - draggedNode.offsetX);
    const y = Math.max(0, e.clientY - canvasRect.top - draggedNode.offsetY);

    setNodes(nodes.map(node => 
      node.id === draggedNode.node.id
        ? { ...node, position: { x, y } }
        : node
    ));
  };

  // 处理节点拖动结束
  const handleCanvasMouseUp = () => {
    setDraggedNode(null);
  };

  // 处理连线开始
  const handleStartConnection = (e: React.MouseEvent, node: Node, type: 'input' | 'output') => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const point: ConnectionPoint = {
      nodeId: node.id,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      type
    };
    setConnectingFrom(point);
    
    // 取消选中节点和连线
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // 处理连线移动
  const handleCanvasMouseMoveForConnection = (e: React.MouseEvent) => {
    if (connectingFrom && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setTempConnection({
        x1: connectingFrom.x - canvasRect.left,
        y1: connectingFrom.y - canvasRect.top,
        x2: e.clientX - canvasRect.left,
        y2: e.clientY - canvasRect.top
      });
    }
  };

  // 处理连线结束
  const handleEndConnection = (e: React.MouseEvent, targetNode: Node, type: 'input' | 'output') => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom.nodeId !== targetNode.id) {
      // 确保连接的是输出到输入
      if (
        (connectingFrom.type === 'output' && type === 'input') ||
        (connectingFrom.type === 'input' && type === 'output')
      ) {
        const source = connectingFrom.type === 'output' ? connectingFrom.nodeId : targetNode.id;
        const target = connectingFrom.type === 'output' ? targetNode.id : connectingFrom.nodeId;
        
        // 检查是否已存在相同的连线
        const existingEdge = edges.find(e => e.source === source && e.target === target);
        
        if (!existingEdge) {
          const newEdge: Edge = {
            id: `e${source}-${target}`,
            source,
            target,
            label: '连接'
          };
          
          const updatedEdges = [...edges, newEdge];
          setEdges(updatedEdges);
          
          // 选中新创建的连线
          setSelectedEdge(newEdge);
          setSelectedNode(null);
        } else {
          message.warning('连线已存在');
        }
      } else {
        message.warning('只能从输出点连接到输入点');
      }
    }
    
    // 清除连线状态
    setConnectingFrom(null);
    setTempConnection(null);
  };

  // 处理连线点击
  const handleEdgeClick = (e: React.MouseEvent, edge: Edge) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // 阻止事件冒泡
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  // 处理画布点击，取消选中
  const handleCanvasClick = (e: React.MouseEvent) => {
    // 避免在拖拽或连线过程中取消选中
    if (draggedNode || connectingFrom) {
      return;
    }
    
    // 检查点击是否在节点或连线上，如果是，不取消选中
    const target = e.target as Element;
    if (target.closest('.workflow-node') || target.closest('.workflow-edge')) {
      return;
    }
    
    setConnectingFrom(null);
    setTempConnection(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // 根据节点类型获取颜色
  const getNodeColor = (type: string) => {
    return nodeTypes.find(t => t.key === type)?.color || '#1890ff';
  };

  // 渲染属性表单项
  const renderPropertyFormItem = (property: NodeProperty) => {
    switch (property.type) {
      case 'string':
        return (
          <Form.Item
            key={property.id}
            name={property.id}
            label={property.name}
            rules={[{ required: true, message: `请输入${property.name}` }]}
          >
            <Input placeholder={`请输入${property.name}`} />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item
            key={property.id}
            name={property.id}
            label={property.name}
            rules={[{ required: true, message: `请输入${property.name}` }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item
            key={property.id}
            name={property.id}
            label={property.name}
            rules={[{ required: true, message: `请选择${property.name}` }]}
          >
            <Select placeholder={`请选择${property.name}`}>
              {property.options?.map(option => (
                <Select.Option key={option} value={option}>{option}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      default:
        return null;
    }
  };

  // 计算连线的路径点
  const calculateEdgePath = (sourceNode: Node, targetNode: Node) => {
    const x1 = sourceNode.position.x + 150; // 右侧连接点
    const y1 = sourceNode.position.y + 35;
    const x2 = targetNode.position.x; // 左侧连接点
    const y2 = targetNode.position.y + 35;
    
    // 计算贝塞尔曲线控制点
    const dx = Math.abs(x2 - x1) * 0.5;
    const cp1x = x1 + dx;
    const cp2x = x2 - dx;
    
    return {
      x1, y1, x2, y2,
      cp1x, cp1y: y1,
      cp2x, cp2y: y2,
      labelX: (x1 + x2) / 2,
      labelY: (y1 + y2) / 2 - 10
    };
  };

  return (
    <Modal
      title={`工作流设计器: ${workflow?.name || ''}`}
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button 
          key="delete" 
          danger 
          icon={<DeleteOutlined />} 
          disabled={!selectedNode && !selectedEdge} 
          onClick={() => {
            if (selectedNode) {
              // 删除相关连线
              const filteredEdges = edges.filter(
                edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id
              );
              setEdges(filteredEdges);
              setNodes(nodes.filter(n => n.id !== selectedNode.id));
              setSelectedNode(null);
              message.success('节点已删除');
            } else if (selectedEdge) {
              setEdges(edges.filter(e => e.id !== selectedEdge.id));
              setSelectedEdge(null);
              message.success('连线已删除');
            }
          }}
        >
          {selectedNode ? '删除节点' : (selectedEdge ? '删除连线' : '删除选中项')}
        </Button>,
        <Button key="save" type="primary" icon={<SaveOutlined />} loading={saveLoading} onClick={handleSave}>
          保存设计
        </Button>,
        <Button key="run" type="primary" icon={<PlayCircleOutlined />} onClick={handleRun}>
          模拟运行
        </Button>,
      ]}
      centered
      destroyOnClose
    >
      <div style={{ display: 'flex', height: 'calc(80vh - 200px)' }}>
        {/* 左侧工具箱 */}
        <div style={{ width: 180, borderRight: '1px solid #f0f0f0', padding: '10px', overflowY: 'auto' }}>
          <h4>工作流节点</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            {nodeTypes.map(nodeType => (
              <div
                key={nodeType.key}
                style={{
                  backgroundColor: nodeType.color,
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginBottom: '10px',
                }}
                onClick={() => handleAddNode(nodeType.key, nodeType.title)}
              >
                {nodeType.title}
              </div>
            ))}
          </Space>

          <Divider />
          <h4>操作说明</h4>
          <ul style={{ fontSize: '12px', paddingLeft: '15px' }}>
            <li>点击左侧节点类型添加到画布</li>
            <li>拖动节点可以调整位置</li>
            <li>通过连接点创建节点间的连线</li>
            <li>点击节点或连线可以编辑属性</li>
            <li>选中后可以删除节点或连线</li>
          </ul>
        </div>
        
        {/* 中间画布 */}
        <div 
          ref={canvasRef}
          style={{ 
            flex: 1, 
            position: 'relative', 
            overflow: 'auto', 
            padding: '20px',
            background: '#f5f5f5',
            cursor: draggedNode ? 'grabbing' : (connectingFrom ? 'crosshair' : 'default')
          }}
          onMouseMove={(e) => {
            if (draggedNode) {
              handleCanvasMouseMove(e);
            } else if (connectingFrom) {
              handleCanvasMouseMoveForConnection(e);
            }
          }}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onClick={handleCanvasClick}
        >
          {/* 连线渲染 */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const path = calculateEdgePath(sourceNode, targetNode);
              const isSelected = selectedEdge?.id === edge.id;
              
              return (
                <g key={edge.id}>
                  {/* 隐形宽线用于点击选择 */}
                  <path
                    className="workflow-edge"
                    d={`M ${path.x1} ${path.y1} C ${path.cp1x} ${path.cp1y}, ${path.cp2x} ${path.cp2y}, ${path.x2} ${path.y2}`}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={10}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    onClick={(e) => handleEdgeClick(e, edge)}
                  />
                  
                  {/* 实际可见线 */}
                  <path
                    d={`M ${path.x1} ${path.y1} C ${path.cp1x} ${path.cp1y}, ${path.cp2x} ${path.cp2y}, ${path.x2} ${path.y2}`}
                    fill="none"
                    stroke={isSelected ? '#1890ff' : '#999'}
                    strokeWidth={isSelected ? 3 : 2}
                    markerEnd="url(#arrow)"
                  />
                  
                  {/* 连线标签背景 */}
                  {edge.label && (
                    <rect
                      x={path.labelX - 30}
                      y={path.labelY - 10}
                      width={60}
                      height={20}
                      fill="#fff"
                      rx={4}
                      ry={4}
                    />
                  )}
                  
                  {/* 连线标签 */}
                  {edge.label && (
                    <text 
                      x={path.labelX} 
                      y={path.labelY}
                      textAnchor="middle"
                      fill={isSelected ? '#1890ff' : '#666'}
                      fontSize={12}
                      dominantBaseline="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                  
                  {/* 条件标签 */}
                  {edge.condition && (
                    <text 
                      x={path.labelX} 
                      y={path.labelY + 15}
                      textAnchor="middle"
                      fill="#999"
                      fontSize={10}
                      dominantBaseline="middle"
                    >
                      {`条件: ${edge.condition}`}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* 临时连线 */}
            {tempConnection && (
              <path
                d={`M ${tempConnection.x1} ${tempConnection.y1} C ${tempConnection.x1 + 100} ${tempConnection.y1}, ${tempConnection.x2 - 100} ${tempConnection.y2}, ${tempConnection.x2} ${tempConnection.y2}`}
                fill="none"
                stroke="#1890ff"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
            
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
              </marker>
            </defs>
          </svg>

          {/* 节点渲染 */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="workflow-node"
              style={{
                position: 'absolute',
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: '150px',
                padding: '10px',
                backgroundColor: '#fff',
                borderRadius: '5px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                cursor: connectingFrom ? 'crosshair' : 'move',
                border: selectedNode?.id === node.id 
                  ? `2px solid ${getNodeColor(node.type)}`
                  : '1px solid #ddd',
                zIndex: selectedNode?.id === node.id ? 1000 : 1,
                userSelect: 'none',
              }}
              onMouseDown={(e) => {
                if (!connectingFrom) {
                  handleNodeDragStart(e, node);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation(); // 阻止事件冒泡到画布
                if (selectedNode?.id === node.id) {
                  // 如果已选中，点击不取消选中
                  return;
                }
                setSelectedNode(node);
                setSelectedEdge(null);
              }}
            >
              {/* 输入连接点 */}
              <div
                style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '50%',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  border: `2px solid ${getNodeColor(node.type)}`,
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 1
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => handleStartConnection(e, node, 'input')}
                onMouseUp={(e) => {
                  if (connectingFrom) {
                    handleEndConnection(e, node, 'input');
                  }
                }}
              />
              
              <div style={{ 
                backgroundColor: getNodeColor(node.type),
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '3px',
                marginBottom: '5px',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{node.type.toUpperCase()}</span>
                <Tooltip title="删除节点">
                  <CloseCircleOutlined 
                    style={{ cursor: 'pointer', fontSize: '12px' }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      e.nativeEvent.stopImmediatePropagation();
                      
                      // 直接执行删除操作，不修改选中状态
                      const filteredEdges = edges.filter(
                        edge => edge.source !== node.id && edge.target !== node.id
                      );
                      setEdges(filteredEdges);
                      setNodes(nodes.filter(n => n.id !== node.id));
                      setSelectedNode(null);
                      message.success('节点已删除');
                    }} 
                  />
                </Tooltip>
              </div>
              <div style={{ fontWeight: 'bold' }}>{node.title}</div>

              {/* 输出连接点 */}
              <div
                style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  border: `2px solid ${getNodeColor(node.type)}`,
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 1
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => handleStartConnection(e, node, 'output')}
                onMouseUp={(e) => {
                  if (connectingFrom) {
                    handleEndConnection(e, node, 'output');
                  }
                }}
              />
            </div>
          ))}
        </div>
        
        {/* 右侧属性面板 */}
        <div style={{ width: 250, borderLeft: '1px solid #f0f0f0', padding: '10px', overflowY: 'auto' }}>
          {selectedNode && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>节点属性设置</h4>
                <Tooltip title="删除节点">
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small" 
                    onClick={() => {
                      // 删除相关连线
                      const filteredEdges = edges.filter(
                        edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id
                      );
                      setEdges(filteredEdges);
                      setNodes(nodes.filter(n => n.id !== selectedNode.id));
                      setSelectedNode(null);
                      message.success('节点已删除');
                    }} 
                  />
                </Tooltip>
              </div>
              
              <p>
                <strong>节点类型: </strong> 
                <Tag color={getNodeColor(selectedNode.type)}>
                  {nodeTypes.find(t => t.key === selectedNode.type)?.title || selectedNode.type}
                </Tag>
              </p>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateNodeProperties}
                initialValues={selectedNode.properties.reduce((acc, prop) => {
                  acc[prop.id] = prop.value;
                  return acc;
                }, {} as any)}
              >
                {selectedNode.properties.map(renderPropertyFormItem)}
                
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  icon={<SaveOutlined />}
                >
                  保存属性
                </Button>
              </Form>
            </>
          )}
          
          {selectedEdge && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>连线属性设置</h4>
                <Tooltip title="删除连线">
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small" 
                    onClick={() => {
                      setEdges(edges.filter(e => e.id !== selectedEdge.id));
                      setSelectedEdge(null);
                      message.success('连线已删除');
                    }} 
                  />
                </Tooltip>
              </div>
              
              <p>
                <strong>连接: </strong> 
                {nodes.find(n => n.id === selectedEdge.source)?.title || selectedEdge.source}
                {' → '}
                {nodes.find(n => n.id === selectedEdge.target)?.title || selectedEdge.target}
              </p>
              
              <Form
                form={edgeForm}
                layout="vertical"
                onFinish={handleUpdateEdgeProperties}
                initialValues={{
                  label: selectedEdge.label,
                  condition: selectedEdge.condition || ''
                }}
              >
                <Form.Item
                  name="label"
                  label="标签"
                  rules={[{ required: true, message: '请输入连线标签' }]}
                >
                  <Input placeholder="请输入连线标签" />
                </Form.Item>
                
                <Form.Item
                  name="condition"
                  label="条件表达式"
                >
                  <Input placeholder="请输入条件表达式（可选）" />
                </Form.Item>
                
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  icon={<SaveOutlined />}
                >
                  保存属性
                </Button>
              </Form>
            </>
          )}
          
          {!selectedNode && !selectedEdge && (
            <div>
              <h4>属性设置</h4>
              <p>请选择一个节点或连线查看和编辑其属性</p>
              <ul style={{ fontSize: '12px', color: '#999' }}>
                <li>点击节点或连线可以选中</li>
                <li>选中后可以编辑和配置其属性</li>
                <li>点击空白处取消选择</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WorkflowDesigner; 