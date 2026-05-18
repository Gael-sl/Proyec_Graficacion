import React, { useState, useRef, useCallback } from "react";
import { exportNodeAsPng, exportNodeAsSvg } from "@/lib/exporter";
import ClassBox from "./ClassBox";
import RelationshipLine from "./RelationshipLine";
import EditModal from "./EditModal";

import { sanitizeFilename } from "@/lib/exporter";

export default function ClassCanvas({
  classes,
  setClasses,
  relationships,
  setRelationships,
  selected,
  setSelected,
  diagramName,
}) {
  const canvasRef = useRef(null);
  const [draggingClass, setDraggingClass] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingClass, setResizingClass] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [pendingRelationship, setPendingRelationship] = useState(null);

  // ── DROP from palette ──────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/palette-item");
    if (!raw) return;
    const item = JSON.parse(raw);
    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    if (item.kind === "class") {
      const newClass = {
        id: `class-${Date.now()}`,
        type: item.type,
        name: item.defaultName,
        x: Math.max(20, dropX - 75),
        y: Math.max(20, dropY - 60),
        width: 180,
        height: 150,
        attributes: [],
        methods: [],
      };
      setClasses(prev => [...prev, newClass]);
      setEditTarget({ type: "class", item: newClass, isNew: true });
    }

    if (item.kind === "relationship") {
      if (classes.length < 2) return;
      setPendingRelationship({ relType: item.relType, label: item.label });
    }
  }, [classes.length]);

  const handleDragOver = (e) => e.preventDefault();

  // ── CLASS drag ────────────────────────────────────────────────────────────
  const handleClassMouseDown = (e, classItem) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingClass(classItem.id);
    setDragOffset({
      x: e.clientX - rect.left - classItem.x,
      y: e.clientY - rect.top - classItem.y,
    });
  };

  // ── MOUSE MOVE ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (draggingClass) {
        setClasses(prev =>
          prev.map(c =>
            c.id === draggingClass
              ? {
                  ...c,
                  x: Math.max(0, mx - dragOffset.x),
                  y: Math.max(0, my - dragOffset.y),
                }
              : c
          )
        );
      }

      if (resizingClass) {
        setClasses(prev =>
          prev.map(c =>
            c.id === resizingClass.id
              ? {
                  ...c,
                  width: Math.max(120, mx - c.x),
                  height: Math.max(100, my - c.y),
                }
              : c
          )
        );
      }
    },
    [draggingClass, dragOffset, resizingClass]
  );

  const handleMouseUp = () => {
    setDraggingClass(null);
    setResizingClass(null);
  };

  // ── CLASS click for relationships ─────────────────────────────────────────
  const handleClassClickForRelationship = (classId) => {
    if (!pendingRelationship) return;
    if (!pendingRelationship.from) {
      setPendingRelationship(prev => ({ ...prev, from: classId }));
      return;
    }

    const newRel = {
      id: `rel-${Date.now()}`,
      from: pendingRelationship.from,
      to: classId,
      relType: pendingRelationship.relType,
      label: pendingRelationship.label || "relación",
    };
    setRelationships(prev => [...prev, newRel]);
    setPendingRelationship(null);
    setEditTarget({ type: "relationship", item: newRel });
  };

  // ── DELETE Y DUPLICAR ──────────────────────────────────────────────────────
  const deleteClass = (id) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    setRelationships(prev => prev.filter(r => r.from !== id && r.to !== id));
    setSelected(null);
  };
  const duplicateClass = (cls) => {
    const newId = `class-${Date.now()}`;
    setClasses(prev => [...prev, { ...cls, id: newId, x: cls.x + 50, y: cls.y + 50 }]);
  };

  const deleteRelationship = (id) => {
    setRelationships(prev => prev.filter(r => r.id !== id));
    setSelected(null);
  };

  // ── EDIT SAVE ─────────────────────────────────────────────────────────────
  const handleSaveEdit = (updated) => {
    if (editTarget.type === "class") {
      setClasses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } else if (editTarget.type === "relationship") {
      setRelationships(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    }
    setEditTarget(null);
  };

  // ── CANVAS SIZE CALCULATION ───────────────────────────────────────────────
  const maxClassX = classes.reduce((max, c) => Math.max(max, c.x + (c.width || 150)), 0);
  const canvasWidth = Math.max(1600, maxClassX + 400);

  const maxClassY = classes.reduce((max, c) => Math.max(max, c.y + (c.height || 120)), 0);
  const canvasHeight = Math.max(1000, maxClassY + 300);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      {/* Toolbar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Clases: {classes.length}</span>
          <span>Relaciones: {relationships.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Export buttons removed */}
        </div>
        {pendingRelationship && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-600 font-medium">
              {pendingRelationship.from ? "Selecciona clase destino..." : "Selecciona clase origen..."}
            </span>
            <button
              onClick={() => setPendingRelationship(null)}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div
          ref={canvasRef}
          className="relative bg-white rounded-2xl shadow-sm border border-slate-200 select-none"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            minWidth: "100%",
            minHeight: "100%",
            cursor: draggingClass ? "grabbing" : "default",
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelected(null)}
        >
          {/* Grid dots */}
          <svg className="absolute inset-0 w-full h-full rounded-2xl" style={{ zIndex: 0 }}>
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#e2e8f0" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Relationships (behind classes) */}
          <svg className="absolute inset-0 w-full h-full rounded-2xl" style={{ zIndex: 1, pointerEvents: "none" }}>
            {relationships.map(rel => (
              <g
                key={rel.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(rel.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditTarget({ type: "relationship", item: rel });
                }}
                style={{ pointerEvents: "auto" }}
              >
                <RelationshipLine
                  relationship={rel}
                  classes={classes}
                  isSelected={selected === rel.id}
                  onDelete={() => deleteRelationship(rel.id)}
                />
              </g>
            ))}
          </svg>

          {/* Classes */}
          {classes.map(classItem => (
            <ClassBox
              key={classItem.id}
              classItem={classItem}
              isSelected={selected === classItem.id}
              onClick={(e) => {
                e.stopPropagation();
                if (pendingRelationship) {
                  handleClassClickForRelationship(classItem.id);
                } else {
                  setSelected(classItem.id);
                }
              }}
              onDoubleClick={() => setEditTarget({ type: "class", item: classItem })}
              onDelete={() => deleteClass(classItem.id)}
              onDuplicate={() => duplicateClass(classItem)}
              onMouseDown={(e) => {
                if (e.target.dataset.resize) {
                  e.stopPropagation();
                  setResizingClass({ id: classItem.id });
                } else {
                  handleClassMouseDown(e, classItem);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        target={editTarget}
        onSave={handleSaveEdit}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
