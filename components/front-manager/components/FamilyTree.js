import React, { useState, useCallback, useEffect } from 'react';
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

const initialNodes = [
{ id: '1', position: { x: 0, y: 0 }, data: { label: 'guille' } },
{ id: '2', position: { x: 50, y: 0 }, data: { label: 'irene' } },
{ id: '3', position: { x: 0, y: 100 }, data: { label: 'charo' } },
];

const initialEdges = [
  { id: '1', source: '1', target: '2', label: 'sibiling' },
  { id: '2', source: '2', target: '3', label: 'parent' },
  { id: '3', source: '1', target: '3', label: 'parent' },
]; 
 
const flowKey = 'example-flow';
 
const getNodeId = () => `randomnode_${+new Date()}`;
 
const Innerflow = ({input}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState(null);
 
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.info("flow json: ", flow);
    }
  }, [rfInstance]);
 
  const onAdd = useCallback(() => {
    const newNode = {
      id: getNodeId(),
      data: { label: 'Added node' },
      position: {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onAddEdge = useCallback(() => {
    const newEdge = {
      id: getNodeId(),
      label: 'Added node',
      source: '1',
      target: '2',
    };
    setEdges((edges) => edges.concat(newEdge));
  }, [setEdges]);

  return (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitView
        fitViewOptions={{ padding: 2 }}
        style={{ backgroundColor: "#F7F9FB" }}
        >
          <Background />
        <Panel position="top-right">
          <button onClick={onSave}>save</button>
          <button onClick={onAdd}>add node</button>
          <button onClick={onAddEdge}>add edge</button>
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