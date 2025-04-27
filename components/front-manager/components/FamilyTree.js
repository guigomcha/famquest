import React, { useState, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
import FamilyNode from './FamilyNode';
import { useTranslation } from "react-i18next";

const initialNodes = [
{ id: '1', position: { x: 0, y: 0 }, data: { label: 'guille' } , type: "custom"},
{ id: '2', position: { x: 50, y: 0 }, data: { label: 'irene' }, type: "custom" },
{ id: '3', position: { x: 50, y: 100 }, data: { label: 'charo' }, type: "custom" },
];

const initialEdges = [
  { id: '1', source: '1', target: '2', label: 'sibiling' },
  { id: '2', source: '2', target: '3', label: 'parent' },
  { id: '3', source: '1', target: '3', label: 'parent' },
]; 

const nodeTypes = {
  custom: FamilyNode
}
 
const flowKey = 'example-flow';
 
const getNodeId = () => `randomnode_${+new Date()}`;
 
const Innerflow = ({input}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState(null);
  const [users, setUsers] = useState([]);
  const [component, setComponent] = useState(null);
  const { t, i18n } = useTranslation();
  const [reload, setReload] = useState(true);

  // fetch all the relevant info
  const fetchRelatedInfo = async () => {
    console.info("fetching users having ", user);
    const tempUsers = await getUserInfo(0);
    console.info("obtained tempUsers ", tempUsers);
    setUsers(tempUsers);
  };

  const onConnect = useCallback(
    (params) => {
      // TODO: request relationship
      console.info("Connecting ", params)
      setEdges((eds) => addEdge({...params, label: "something"}, eds))
    },
    [setEdges],
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.info("flow json: ", flow);
    }
  }, [rfInstance]);
 
  const onAdd = useCallback(() => {
    // TODO: Request user info
    const newNode = {
      id: getNodeId(),
      data: { label: 'Added node' },
      type: "custom",
      position: {
        x: nodes[0].position.x - Math.random() * 100,
        y: nodes[0].position.y + Math.random() * 100,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);


  return (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 10 }}
        style={{ backgroundColor: "#F7F9FB" }}
        >
          <Background />
        <Panel position="top-right">
          <Button onClick={onSave}>save</Button>
          <Button onClick={onAdd}>add node</Button>
        </Panel>
      </ReactFlow>
  );
};

      
const FamilyTree = ({input}) => {
  return (
    <div style={{ position: "relative", width: "100vw", height: "50vh"}}>
      <ReactFlowProvider>
        <Innerflow input={input}></Innerflow>
      </ReactFlowProvider>
    </div>
  )
}
 
export default FamilyTree;