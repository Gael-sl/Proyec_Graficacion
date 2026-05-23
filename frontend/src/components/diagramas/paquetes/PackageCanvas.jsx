import React, { useState, useRef, useCallback, useEffect } from "react";
import { exportNodeAsPng, exportNodeAsSvg, sanitizeFilename } from "@/lib/exporter";
import PackageBox from "./PackageBox";
import RelationshipLine from "./RelationshipLine";
import NoteBox from "./NoteBox";
import EditModal from "./EditModal";

export default function PackageCanvas({
  packages,
  setPackages,
  dependencies,
  setDependencies,
  notes,
  setNotes,
  selected,
  setSelected,
  diagramName,
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingNote, setDraggingNote] = useState(null);
  const [resizingElement, setResizingElement] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [pendingRelationship, setPendingRelationship] = useState(null);

  // Ctrl + Mouse Wheel listener for smooth Miro-style zooming
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        setZoom(prev => Math.max(0.4, Math.min(2.5, prev + delta)));
      }
    };
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (wrapper) {
        wrapper.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  // ── DROP from palette ──────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/palette-item");
    if (!raw) return;
    const item = JSON.parse(raw);
    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = (e.clientX - rect.left) / zoom;
    const dropY = (e.clientY - rect.top) / zoom;

    if (item.kind === "element") {
      const newElement = {
        id: `elem-${Date.now()}`,
        type: item.type,
        name: item.defaultName,
        description: "",
        x: Math.max(20, dropX - 75),
        y: Math.max(20, dropY - 60),
        width: 150,
        height: 120,
      };
      setPackages(prev => [...prev, newElement]);
      setEditTarget({ type: "element", item: newElement, isNew: true });
    }

    if (item.kind === "relationship") {
      if (packages.length < 2) return;
      setPendingRelationship({ relType: item.relType, label: item.label });
    }

    if (item.kind === "note") {
      const newNote = {
        id: `note-${Date.now()}`,
        text: "Escribe tu nota aquí...",
        x: Math.max(20, dropX - 80),
        y: Math.max(20, dropY - 35),
        width: 160,
        height: 70,
      };
      setNotes(prev => [...prev, newNote]);
      setEditTarget({ type: "note", item: newNote });
    }
  }, [packages.length]);

  const handleDragOver = (e) => e.preventDefault();

  // ── ELEMENT drag ──────────────────────────────────────────────────────────
  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / zoom;
    const my = (e.clientY - rect.top) / zoom;
    setDraggingElement(element.id);
    setDragOffset({
      x: mx - element.x,
      y: my - element.y,
    });
  };

  // ── NOTE drag ─────────────────────────────────────────────────────────────
  const handleNoteMouseDown = (e, note) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / zoom;
    const my = (e.clientY - rect.top) / zoom;
    setDraggingNote({
      id: note.id,
      ox: mx - note.x,
      oy: my - note.y,
    });
  };

  // ── MOUSE MOVE ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (e.clientX - rect.left) / zoom;
      const my = (e.clientY - rect.top) / zoom;

      if (draggingElement) {
        setPackages(prev =>
          prev.map(p =>
            p.id === draggingElement
              ? {
                  ...p,
                  x: Math.max(0, mx - dragOffset.x),
                  y: Math.max(0, my - dragOffset.y),
                }
              : p
          )
        );
      }

      if (draggingNote) {
        setNotes(prev =>
          prev.map(n =>
            n.id === draggingNote.id
              ? {
                  ...n,
                  x: Math.max(0, mx - draggingNote.ox),
                  y: Math.max(0, my - draggingNote.oy),
                }
              : n
          )
        );
      }

      if (resizingElement) {
        setPackages(prev =>
          prev.map(p =>
            p.id === resizingElement.id
              ? {
                  ...p,
                  width: Math.max(100, mx - p.x),
                  height: Math.max(80, my - p.y),
                }
              : p
          )
        );
      }
    },
    [draggingElement, dragOffset, draggingNote, resizingElement, zoom]
  );

  const handleMouseUp = () => {
    setDraggingElement(null);
    setDraggingNote(null);
    setResizingElement(null);
  };

  // ── ELEMENT click for relationships ───────────────────────────────────────
  const handleElementClickForRelationship = (elementId) => {
    if (!pendingRelationship) return;
    if (!pendingRelationship.from) {
      setPendingRelationship(prev => ({ ...prev, from: elementId }));
      return;
    }

    const newRel = {
      id: `rel-${Date.now()}`,
      from: pendingRelationship.from,
      to: elementId,
      relType: pendingRelationship.relType,
      label: pendingRelationship.label || "relación",
    };
    setDependencies(prev => [...prev, newRel]);
    setPendingRelationship(null);
    setEditTarget({ type: "relationship", item: newRel });
  };

  // ── DELETE Y DUPLICAR ──────────────────────────────────────────────────────
  const deleteElement = (id) => {
    setPackages(prev => prev.filter(p => p.id !== id));
    setDependencies(prev => prev.filter(d => d.from !== id && d.to !== id));
    setSelected(null);
  };
  const duplicateElement = (element) => {
    const newId = `elem-${Date.now()}`;
    setPackages(prev => [...prev, { ...element, id: newId, x: element.x + 50, y: element.y + 50 }]);
  };

  const deleteRelationship = (id) => {
    setDependencies(prev => prev.filter(d => d.id !== id));
    setSelected(null);
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setSelected(null);
  };

  // ── EDIT SAVE ─────────────────────────────────────────────────────────────
  const handleSaveEdit = (updated) => {
    if (editTarget.type === "element") {
      setPackages(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } else if (editTarget.type === "relationship") {
      setDependencies(prev => prev.map(d => (d.id === updated.id ? updated : d)));
    } else if (editTarget.type === "note") {
      setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
    }
    setEditTarget(null);
  };

  // ── CANVAS SIZE CALCULATION ───────────────────────────────────────────────
  const maxPackX = packages.reduce((max, p) => Math.max(max, p.x + (p.width || 150)), 0);
  const maxNoteX = notes.reduce((max, n) => Math.max(max, n.x + (n.width || 160)), 0);
  const canvasWidth = Math.max(1600, Math.max(maxPackX, maxNoteX) + 400);

  const maxPackY = packages.reduce((max, p) => Math.max(max, p.y + (p.height || 120)), 0);
  const maxNoteY = notes.reduce((max, n) => Math.max(max, n.y + (n.height || 70)), 0);
  const canvasHeight = Math.max(1000, Math.max(maxPackY, maxNoteY) + 300);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      {/* Toolbar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Paquetes: {packages.length}</span>
          <span>Relaciones: {dependencies.length}</span>
          <span>Notas: {notes.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold text-xs"
              title="Zoom -"
            >
              -
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700 min-w-[40px] text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(2.5, prev + 0.1))}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold text-xs"
              title="Zoom +"
            >
              +
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={() => setZoom(1.0)}
              className="text-[10px] text-indigo-600 hover:underline px-1 font-semibold"
              title="Restablecer"
            >
              1:1
            </button>
          </div>
        </div>
        {pendingRelationship && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-600 font-medium">
              {pendingRelationship.from ? "Selecciona destino..." : "Selecciona origen..."}
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

      <div className="flex-1 overflow-auto p-6" ref={wrapperRef}>
        <div
          style={{
            width: canvasWidth * zoom,
            height: canvasHeight * zoom,
            position: "relative",
            borderRadius: "1rem",
          }}
        >
          <div
            ref={canvasRef}
            className="absolute left-0 top-0 bg-white rounded-2xl shadow-sm border border-slate-200 select-none"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              cursor: draggingElement ? "grabbing" : "default",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
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

          {/* Relationships (behind elements) */}
          <svg className="absolute inset-0 w-full h-full rounded-2xl" style={{ zIndex: 1, pointerEvents: "none" }}>
            {dependencies.map(rel => (
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
                  elements={packages}
                  isSelected={selected === rel.id}
                  onDelete={() => deleteRelationship(rel.id)}
                />
              </g>
            ))}
          </svg>

          {/* Elements (packages, interfaces, etc.) */}
          {packages.map(element => (
            <PackageBox
              key={element.id}
              element={element}
              isSelected={selected === element.id}
              onClick={(e) => {
                e.stopPropagation();
                if (pendingRelationship) {
                  handleElementClickForRelationship(element.id);
                } else {
                  setSelected(element.id);
                }
              }}
              onDoubleClick={() => setEditTarget({ type: "element", item: element })}
              onDelete={() => deleteElement(element.id)}
              onDuplicate={() => duplicateElement(element)}
              onMouseDown={(e) => {
                if (e.target.dataset.resize) {
                  e.stopPropagation();
                  setResizingElement({ id: element.id });
                } else {
                  handleElementMouseDown(e, element);
                }
              }}
            />
          ))}

          {/* Notes */}
          {notes.map(note => (
            <NoteBox
              key={note.id}
              note={note}
              isSelected={selected === note.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(note.id);
              }}
              onDoubleClick={() => setEditTarget({ type: "note", item: note })}
              onDelete={() => deleteNote(note.id)}
              onMouseDown={(e) => {
                if (e.target.dataset.resize) {
                  e.stopPropagation();
                  setResizingElement({ id: note.id });
                } else {
                  handleNoteMouseDown(e, note);
                }
              }}
            />
          ))}
          </div>
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
