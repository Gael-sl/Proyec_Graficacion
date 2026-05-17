import React from "react";
import { Trash2 } from "lucide-react";

const typeStyles = {
  sync: { stroke: "#1e293b", dash: "none", label: "sync" },
  async: { stroke: "#475569", dash: "6,3", label: "async" },
  return: { stroke: "#64748b", dash: "6,3", label: "return" },
  self: { stroke: "#334155", dash: "none", label: "self" },
};

export default function MessageArrow({ msg, fromX, toX, y, isSelected, onClick, onDoubleClick, onDelete }) {
  const style = typeStyles[msg.type] || typeStyles.sync;
  const isSelf = fromX === toX;
  const isReturn = msg.type === "return";
  const arrowRight = fromX < toX;

  const minX = Math.min(fromX, toX);
  const maxX = Math.max(fromX, toX);
  const midX = (fromX + toX) / 2;
  const width = maxX - minX;

  if (isSelf) {
    // Self-loop
    const loopW = 50;
    return (
      <g
        style={{ cursor: "pointer", position: "absolute" }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <svg
          className="absolute"
          style={{ left: fromX, top: y - 10, zIndex: 3 }}
          width={loopW + 20}
          height={40}
          overflow="visible"
        >
          <path
            d={`M 0 10 L ${loopW} 10 L ${loopW} 30 L 4 30`}
            fill="none"
            stroke={style.stroke}
            strokeWidth={isSelected ? 2.5 : 1.5}
            strokeDasharray={style.dash}
            markerEnd="url(#arrowhead)"
          />
          <text x={loopW / 2} y={-2} textAnchor="middle" fontSize="11" fill={style.stroke} fontWeight="500">{msg.label}</text>
        </svg>
        {isSelected && (
          <foreignObject x={fromX + loopW + 4} y={y - 10} width={24} height={24} style={{ zIndex: 20 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-6 h-6 bg-white border border-red-200 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
            >
              <Trash2 style={{ width: 10, height: 10, color: "#ef4444" }} />
            </button>
          </foreignObject>
        )}
      </g>
    );
  }

  return (
    <svg
      className="absolute"
      style={{ left: minX, top: y - 14, zIndex: 3, cursor: "pointer", overflow: "visible" }}
      width={Math.max(width, 20)}
      height={28}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <defs>
        <marker id={`arrow-${msg.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={style.stroke} />
        </marker>
      </defs>

      {/* Hit area */}
      <line
        x1={arrowRight ? 0 : width} y1="14"
        x2={arrowRight ? width : 0} y2="14"
        stroke="transparent" strokeWidth="12"
      />

      {/* Arrow line */}
      <line
        x1={arrowRight ? 4 : width - 4} y1="14"
        x2={arrowRight ? width - 8 : 8} y2="14"
        stroke={style.stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={style.dash === "none" ? undefined : style.dash}
        markerEnd={`url(#arrow-${msg.id})`}
      />

      {/* Label */}
      <text
        x={width / 2} y="8"
        textAnchor="middle"
        fontSize="11"
        fill={style.stroke}
        fontWeight="500"
        className="select-none"
      >
        {msg.label}
      </text>

      {/* Type badge */}
      {isReturn && (
        <text x={width / 2} y="26" textAnchor="middle" fontSize="9" fill={style.stroke} opacity="0.6">
          ‹return›
        </text>
      )}

      {/* Delete button */}
      {isSelected && (
        <foreignObject x={width / 2 - 12} y={16} width={24} height={24} style={{ zIndex: 20 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-6 h-6 bg-white border border-red-200 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
          >
            <Trash2 style={{ width: 10, height: 10, color: "#ef4444" }} />
          </button>
        </foreignObject>
      )}
    </svg>
  );
}