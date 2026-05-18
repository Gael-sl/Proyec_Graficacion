import React from "react";
import { Trash2 } from "lucide-react";

export default function RelationshipLine({
  relationship,
  classes,
  isSelected,
  onDelete,
}) {
  const fromClass = classes.find(c => c.id === relationship.from);
  const toClass = classes.find(c => c.id === relationship.to);

  if (!fromClass || !toClass) return null;

  // Calcular centros de los elementos
  const fromCenterX = fromClass.x + fromClass.width / 2;
  const fromCenterY = fromClass.y + fromClass.height / 2;
  const toCenterX = toClass.x + toClass.width / 2;
  const toCenterY = toClass.y + toClass.height / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  let fromX = fromCenterX;
  let fromY = fromCenterY;
  let toX = toCenterX;
  let toY = toCenterY;

  // Calcular intersección con borde de Clase Origen
  if (dx !== 0 || dy !== 0) {
    const tV = Math.abs(dx) > 0 ? (fromClass.width / 2) / Math.abs(dx) : Infinity;
    const tH = Math.abs(dy) > 0 ? (fromClass.height / 2) / Math.abs(dy) : Infinity;
    const t = Math.min(tV, tH);
    if (t < 1) {
      fromX = fromCenterX + t * dx;
      fromY = fromCenterY + t * dy;
    }
  }

  // Calcular intersección con borde de Clase Destino
  if (dx !== 0 || dy !== 0) {
    const tV = Math.abs(dx) > 0 ? (toClass.width / 2) / Math.abs(dx) : Infinity;
    const tH = Math.abs(dy) > 0 ? (toClass.height / 2) / Math.abs(dy) : Infinity;
    const t = Math.min(tV, tH);
    if (t < 1) {
      toX = toCenterX - t * dx;
      toY = toCenterY - t * dy;
    }
  }

  // Desplazar punta de flecha 10px hacia atrás para que no quede solapada por el borde
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    toX = toX - (dx / len) * 10;
    toY = toY - (dy / len) * 10;
    fromX = fromX + (dx / len) * 10;
    fromY = fromY + (dy / len) * 10;
  }

  // Calcular punto medio para label
  const midX = fromX + (toX - fromX) / 2;
  const midY = fromY + (toY - fromY) / 2;

  const colorMap = {
    inheritance: { stroke: "#6366f1", dash: "0", marker: "triangle" },
    implementation: { stroke: "#a855f7", dash: "5,5", marker: "triangle" },
    composition: { stroke: "#10b981", dash: "0", marker: "diamond" },
    aggregation: { stroke: "#f59e0b", dash: "0", marker: "diamond" },
    association: { stroke: "#0891b2", dash: "0", marker: "arrow" },
  };

  const colors = colorMap[relationship.relType] || colorMap.association;

  const markerType = colors.marker;
  const markerId = `marker-${relationship.id}`;

  return (
    <g>
      {/* Markers */}
      <defs>
        {markerType === "triangle" && (
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={colors.stroke} />
          </marker>
        )}
        {markerType === "diamond" && (
          <marker
            id={markerId}
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,6 L6,0 L12,6 L6,12 Z" fill={colors.stroke} />
          </marker>
        )}
        {markerType === "arrow" && (
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={colors.stroke} />
          </marker>
        )}
      </defs>

      {/* Línea */}
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={colors.stroke}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={colors.dash}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        className="cursor-pointer"
        style={{ filter: isSelected ? "drop-shadow(0 0 3px rgba(99, 102, 241, 0.5))" : undefined }}
      />

      {/* Label */}
      {relationship.label && (
        <g>
          <rect
            x={midX - 40}
            y={midY - 12}
            width="80"
            height="24"
            fill="white"
            stroke={colors.stroke}
            strokeWidth="1"
            rx="4"
          />
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            fontSize="11"
            fill={colors.stroke}
            fontWeight="500"
            className="select-none pointer-events-none"
          >
            {relationship.label}
          </text>
        </g>
      )}

      {/* Delete button */}
      {isSelected && (
        <foreignObject x={midX + 35} y={midY - 10} width="20" height="20" style={{ pointerEvents: "auto" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="w-full h-full bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center text-xs"
            title="Eliminar"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </foreignObject>
      )}

      {/* Hit target transparent */}
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="transparent"
        strokeWidth="12"
        className="cursor-pointer"
      />
    </g>
  );
}
