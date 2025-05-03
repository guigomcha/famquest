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
  useReactFlow,
  Controls,
} from '@xyflow/react';
import { Button, Modal, Input, Form } from 'antd';
import FamilyNode from './FamilyNode';
import '@xyflow/react/dist/style.css';
import '../css/reactFlow.css';
import { useTranslation } from "react-i18next";
import { createInDB, getInDB, updateInDB } from '../functions/db_manager_api';
import { GlobalMessage, familyTreeComparison } from '../functions/components_helper';
import { Select, Space, Spin } from 'antd';

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
  const [pendingSave, setPendingSave] = useState(false);
  const [relationshipModalVisible, setRelationshipModalVisible] = useState(false);
  const [relationshipLabel, setRelationshipLabel] = useState('');
  const [relationshipLabelNote, setRelationshipLabelNote] = useState('');
  const [pendingConnection, setPendingConnection] = useState(null);
  const oldFlow = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { setViewport } = useReactFlow();
  

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
    setPendingSave(false)
  }, []);

  const onConnect = useCallback(
    (params) => {
      setPendingConnection(params);
      setRelationshipModalVisible(true);
      setPendingSave(true)
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

  const onSave = useCallback(async () => {
    setIsLoading(true);
    const flow = rfInstance.toObject();
    console.info('flow json:', flow);
    console.info('oldflow json:', oldFlow.current);
    if (!oldFlow.current) {
      const resp = await createInDB({
        "familyTree": flow
        },
      "familyTree") 
      console.info("should have stored the flow", resp)
      oldFlow.current = resp
    } else {
      const resp = await updateInDB({
        "familyTree": flow,
          "id": oldFlow.current.id
      }, "familyTree") 
      console.info("should have updated the flow", resp)
    }
    setPendingSave(false)
    setIsLoading(false);
  }, [rfInstance]);

  const upgradeTree = async () => {
    setIsLoading(true);
    let flows = await getInDB("familyTree")
    console.info("received flows", flows)
    let nodesToAdd = []
    let edgesToAdd = []
    oldFlow.current = flows[0]
    if (!flows || flows.length == 0 || !flows[0]?.familyTree) {
      console.info("need to create from scratch for users ", users)
      for (const user of users) {
        const newNode = {
          id: `${user.id}`,
          data: { label: user.name },
          type: "custom",
          position: {
            x: Math.floor(Math.random()*500),
            y: Math.floor(Math.random()*100),
          },
        }
        console.info("adding node ", newNode)
        nodesToAdd.push(newNode)
      }
      GlobalMessage(t("familyTreeSave"), "info")
      setPendingSave(true)
    } else {
      console.info("Creating flow from previous flow json", flows[0])
      const actions = familyTreeComparison(users, flows[0].familyTree)
      // Filter out nodes that need to be deleted
      flows[0].familyTree.nodes = flows[0].familyTree.nodes.filter(node =>
        !actions.some(action => action.action === 'delete' && action.id === node.id)
      );
      // Filter out edges that reference deleted nodes
      const deletedIds = actions
        .filter(action => action.action === 'delete')
        .map(action => action.id);

      flows[0].familyTree.edges = flows[0].familyTree.edges.filter(
        edge => !deletedIds.includes(edge.source) && !deletedIds.includes(edge.target)
      );
      // Load the flows 
      const { x = 0, y = 0, zoom = 1 } = flows[0].familyTree.viewport;
      nodesToAdd = flows[0].familyTree.nodes
      edgesToAdd = flows[0].familyTree.edges
      setViewport({ x, y, zoom });
      // Add new nodes for each 'add' action
      const userMap = new Map(users.map(user => [String(user.id), user.name]));
      actions
        .filter(action => action.action === 'add')
        .map(action => (
          nodesToAdd.push( {
            id: action.id,
            data: { label: userMap.get(action.id) },
            type: "custom",
            position: {
              x: Math.floor(Math.random()*500),
              y: Math.floor(Math.random()*100),
            },
          })
        )
      );
      if (actions.length > 0) {
        GlobalMessage(t("familyTreeSave"), "info")
        setPendingSave(true)
      }
    }
    console.info("all nodes added ", nodesToAdd)
    setNodes(nodesToAdd)
    setEdges(edgesToAdd)
    setIsLoading(false);
  }

  useEffect(() => {
    if (!users || users.length == 0 ){
      return;
    }
    upgradeTree();
  }
  , [users]);

  useEffect(() => {
    console.info("Current nodes: ", nodes)
  }, [nodes]);

  return (
    <>
      {(isLoading) &&<Spin >{t('loading')}</Spin>}
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
        fitViewOptions={{padding: 20, minZoom: 1 }}
        minZoom={1}
        maxZoom={15}
        style={{ backgroundColor: 'rgba(2, 31, 255, 0.2)' }}
      >
        <Background />
        <Panel position="top-right">
          <Button 
            onClick={onSave}
            disabled={!pendingSave}
            color="primary" 
            variant="solid"
          >{t("save")}</Button>
        </Panel>
        <Controls />
      </ReactFlow>

      <Modal
        title={t("addRelationship")}
        open={relationshipModalVisible}
        onOk={handleAddConnection}
        onCancel={() => setRelationshipModalVisible(false)}
        okText={t("connect")}
      >
        <Form layout="vertical">
          <Form.Item label={t("relationship")}>
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
    <div style={{ position: 'relative', width: '100vw', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{ width: '80vw', margin: '0 auto', height: '100%' }}>
        <ReactFlowProvider>
          <Innerflow users={users} />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default FamilyTree;
