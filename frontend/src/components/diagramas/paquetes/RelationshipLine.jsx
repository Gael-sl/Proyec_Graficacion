import React from "react";
import { Trash2 } from "lucide-react";

export default function RelationshipLine({
  relationship,
  elements,
  isSelected,
  onDelete,
}) {
  const fromElement = elements.find(e => e.id === relationship.from);
  const toElement = elements.find(e => e.id === relationship.to);

  if (!fromElement || !toElement) return null;

  // Calcular posiciones
  const fromX = fromElement.x + fromElement.width / 2;
  const fromY = fromElement.y + fromElement.height / 2;
  const toX = toElement.x + toElement.width / 2;
  const toY = toElement.y + toElement.height / 2;

  // Calcular ángulo y distancia
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Punto medio para el label
  const midX = fromX + dx / 2;
  const midY = fromY + dy / 2;

  const colorMap = {
    dependency: { stroke: "#6366f1", dash: "5,5" },
    import: { stroke: "#a855f7", dash: "0" },
    implements: { stroke: "#10b981", dash: "0" },
  };

  const colors = colorMap[relationship.relType] || colorMap.dependency;

  return (
    <g>
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
        className="cursor-pointer"
        style={{ filter: isSelected ? "drop-shadow(0 0 3px rgba(99, 102, 241, 0.5))" : undefined }}
      />

      {/* Punta de flecha */}
      <defs>
        <marker
          id={`arrow-${relationship.id}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={colors.stroke} />
        </marker>
      </defs>
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="none"
        markerEnd={`url(#arrow-${relationship.id})`}
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

      {/* Delete button en el label */}
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
    </g>
  );
}
