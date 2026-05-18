import React from "react";

const ACTOR_WIDTH = 120;
const BAR_W = 12;

export default function ActivationBar({ bar, actors, isSelected, onClick, onDelete }) {
  const actor = actors.find(a => a.id === bar.actorId);
  if (!actor) return null;

  const x = actor.x + ACTOR_WIDTH / 2 - BAR_W / 2;
  const startY = bar.startY;
  const endY = bar.endY;
  const height = Math.max(endY - startY, 20);

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: startY,
        width: BAR_W,
        height,
        background: isSelected ? "#6366f1" : "#c7d2fe",
        border: `1.5px solid ${isSelected ? "#4338ca" : "#818cf8"}`,
        borderRadius: 3,
        zIndex: 4,
        cursor: "pointer",
        boxShadow: isSelected ? "0 0 0 2px #6366f144" : "none",
      }}
      onClick={onClick}
      title="Bloque de activación — clic para seleccionar, eliminar con tecla Delete"
    >
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 18,
            height: 18,
            background: "#fff",
            border: "1px solid #fecaca",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 9,
            color: "#ef4444",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}