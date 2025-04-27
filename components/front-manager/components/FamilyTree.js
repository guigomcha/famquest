import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MiniMap,
  reconnectEdge,
  Controls,
} from '@xyflow/react';
import { Button, Modal, Input, Form } from 'antd';
import FamilyNode from './FamilyNode';
import '@xyflow/react/dist/style.css';
import '../css/reactFlow.css';
import { useTranslation } from "react-i18next";
import { Select } from 'antd';

const initialNodes = [];

const initialEdges = [];

const nodeTypes = {
  custom: FamilyNode
};

const Innerflow = ({ users, selectedUsed }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const edgeReconnectSuccessful = useRef(true);
  const [rfInstance, setRfInstance] = useState(null);
  const [newNameModalVisible, setNewNameModalVisible] = useState(false);
  const [relationshipModalVisible, setRelationshipModalVisible] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [relationshipLabel, setRelationshipLabel] = useState('');
  const [relationshipLabelNote, setRelationshipLabelNote] = useState('');
  const [pendingConnection, setPendingConnection] = useState(null);
  const { t, i18n } = useTranslation();

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
 
  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);
 
  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  }, []);

  const onConnect = useCallback(
    (params) => {
      setPendingConnection(params);
      setRelationshipModalVisible(true);
    },
    []
  );

  const handleAddConnection = () => {
    if (pendingConnection) {
      setEdges((eds) =>
        addEdge({ ...pendingConnection, label: `${relationshipLabel} ${relationshipLabelNote}` }, eds)
      );
    }
    setRelationshipModalVisible(false);
    setPendingConnection(null);
  };

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.info('flow json:', flow);
      // TODO: create the new users and save the flow 
    }
  }, [rfInstance]);

  useEffect(() => {
    // TODO: At first, check if the flow exist to load it, else create a node per each user
    if (users.length != nodes.length){
      console.info("Need to create the nodes")
      users.forEach(user => {
        console.info("Creating node for ", user)
        const newNode = {
          id: `${user.id}`,
          data: { label: user.name },
          type: "custom",
          position: {
            x: 0,
            y: 0,
          },
        };
        setNodes((nds) => [...nds, newNode]);      
      });
    }
  }, [users]);

  useEffect(() => {
    console.info("Current nodes: ", nodes)
  }, [nodes]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onConnect={onConnect}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        snapToGrid
        fitView
        style={{ backgroundColor: 'rgba(2, 31, 255, 0.2)' }}
      >
        <Background />
        <Panel position="top-right">
          <Button onClick={onSave}>{t('save')}</Button>
        </Panel>
        <Controls />
      </ReactFlow>

      <Modal
        title={t('addNode')}
        open={newNameModalVisible}
        onOk={handleAddNode}
        onCancel={() => setNewNameModalVisible(false)}
        okText={t('add')}
      >
        <Form layout="vertical">
          <Form.Item label={t('name')}>
            <Input
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              placeholder={t('editName')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('addRelationship')}
        open={relationshipModalVisible}
        onOk={handleAddConnection}
        onCancel={() => setRelationshipModalVisible(false)}
        okText={t('connect')}
      >
        <Form layout="vertical">
          <Form.Item label={t('relationship')}>
            <Select
              defaultValue=""
              style={{ width: 200 }}
              onChange={(e) => setRelationshipLabelNote(t(e))}
              options={[
                { value: '', label: t("empty") },
                { value: 'ex', label: t("ex") },
              ]}
            />
            <Select
              style={{ width: 200 }}
              onChange={(e) => setRelationshipLabel(t(e))}
              options={[
                { value: 'parent', label: t("parent") },
                { value: 'partner', label: t("partner") },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// TODO: connect the nodes to the tab selected
const FamilyTree = ({ users, selectedUsed }) => {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{ width: '80vw', margin: '0 auto', height: '100%' }}>
        <ReactFlowProvider>
          <Innerflow users={users} />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default FamilyTree;
