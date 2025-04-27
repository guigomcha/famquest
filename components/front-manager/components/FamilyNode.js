import { memo } from 'react';
import { Handle, Position, NodeResizeControl } from '@xyflow/react';
import { useTranslation } from "react-i18next";
import '@xyflow/react/dist/style.css';
import '../css/reactFlow.css';

const estimateTextWidth = (text) => text.length * 8 + 20; // ~8px per char + padding


const FamilyNode = ({ data }) => {
  const minWidth = estimateTextWidth(data.label);

  return (
    <>
      <NodeResizeControl minWidth={minWidth} minHeight={100}>
        <ResizeIcon />
      </NodeResizeControl>

      
      <div style={{ padding: '10px', textAlign: 'center' }}>
        {data.label}
      </div>

      <Handle type="target" position={Position.Top}></Handle>
      <Handle type="source" position={Position.Bottom}></Handle>
    </>
  );
};

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#ff0071"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

export default memo(FamilyNode);
