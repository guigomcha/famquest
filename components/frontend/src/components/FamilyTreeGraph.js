import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Avatar, Tag, Space, Typography, Button, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { mockUsers, mockRelations, mockMedia } from '../utils/mockData';
import EventCard from './EventCard';

const { Text } = Typography;

const FamilyTreeGraph = ({ onNodeClick }) => {
  const { t } = useTranslation();

  /* ----------  build nodes & edges  ---------- */
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useMemo(() => {
    const nodes = mockUsers.map(u => {
      const avatar = u.avatar ? mockMedia.find(m => m.id === u.avatar) : null;
      return {
        id: u.id,
        type: 'default',
        position: { x: 0, y: 0 }, // React-Flow auto-layout will move them
        data: { ...u, avatar },
      };
    });

    const edges = mockRelations.map(r => ({
      id: r.id,
      source: r.source,
      target: r.target,
      label: r.label,
      type: r.direction === 'horizontal' ? 'smoothstep' : 'straight',
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    }));

    /* auto-layout: hierarchical – top = older, bottom = younger */
    const rank = {};
    mockUsers.forEach(u => (rank[u.id] = 0));
    mockRelations.forEach(r => {
      if (r.label === 'parent') rank[r.target] = (rank[r.target] || 0) + 1;
    });
    const genMap = {};
    Object.entries(rank).forEach(([id, lvl]) => {
      if (!genMap[lvl]) genMap[lvl] = [];
      genMap[lvl].push(id);
    });

    let y = 0;
    Object.keys(genMap)
      .sort((a, b) => b - a)
      .forEach(lvl => {
        let x = 0;
        genMap[lvl].forEach(id => {
          const n = nodes.find(nd => nd.id === id);
          if (n) {
            n.position = { x, y };
            x += 200; // horizontal spacing
          }
        });
        y += 150; // vertical spacing
      });

    setNodes(nodes);
    setEdges(edges);
  }, [setNodes, setEdges]);

  /* ----------  custom node  ---------- */
  const nodeTypes = {
    default: ({ data }) => (
      <div
        style={{
          background: '#fff',
          border: '2px solid #8b5cf6',
          borderRadius: 12,
          padding: 8,
          minWidth: 140,
          cursor: 'pointer',
        }}
        onClick={() => onNodeClick(data)}
      >
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Avatar size={48} src={data.avatar?.url} icon={!data.avatar && '👤'} />
          <Text strong style={{ fontSize: 13 }}>{data.name}</Text>
          {data.isVirtual && <Tag size="small">Virtual</Tag>}
        </Space>
      </div>
    ),
  };

  /* ----------  render  ---------- */
  return (
    <div style={{ height: '70vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};