import React from "react";
import { Trash2, Pencil } from "lucide-react";

const fragmentColors = {
  alt:  { border: "#6366f1", bg: "rgba(99,102,241,0.06)",  label: "#6366f1" },
  loop: { border: "#f59e0b", bg: "rgba(245,158,11,0.06)",  label: "#f59e0b" },
  opt:  { border: "#10b981", bg: "rgba(16,185,129,0.06)",  label: "#10b981" },
  par:  { border: "#a855f7", bg: "rgba(168,85,247,0.06)",  label: "#a855f7" },
};

export default function FragmentBox({ fragment, isSelected, onClick, onDoubleClick, onDelete, onMouseDown }) {
  const colors = fragmentColors[fragment.fragType] || fragmentColors.alt;

  return (
    <div
      className="absolute"
      style={{
        left: fragment.x,
        top: fragment.y,
        width: fragment.width,
        height: fragment.height,
        border: `2px solid ${colors.border}`,
        background: colors.bg,
        borderRadius: 8,
        zIndex: isSelected ? 4 : 2,
        cursor: "move",
        boxShadow: isSelected ? `0 0 0 2px ${colors.border}44` : "none",
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      {/* Type label badge */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          background: colors.border,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          padding: "1px 8px",
          borderRadius: "6px 0 6px 0",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {fragment.fragType}
      </div>

      {/* Condition label */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 48,
          fontSize: 11,
          color: colors.label,
          fontStyle: "italic",
          fontWeight: 500,
          maxWidth: fragment.width - 60,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        [{fragment.condition || "condición"}]
      </div>

      {/* Action buttons */}
      {isSelected && (
        <div style={{ position: "absolute", top: -12, right: -4, display: "flex", gap: 4 }}>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
            style={{ width: 22, height: 22, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <Pencil style={{ width: 10, height: 10, color: "#6366f1" }} />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ width: 22, height: 22, background: "#fff", border: "1px solid #fecaca", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <Trash2 style={{ width: 10, height: 10, color: "#ef4444" }} />
          </button>
        </div>
      )}

      {/* Resize handle */}
      <div
        data-resize="true"
        style={{
          position: "absolute",
          bottom: 2,
          right: 2,
          width: 14,
          height: 14,
          cursor: "se-resize",
          background: `${colors.border}33`,
          borderRadius: 3,
          border: `1px solid ${colors.border}66`,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e);
        }}
      />
    </div>
  );
}