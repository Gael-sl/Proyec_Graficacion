import React, { useState, useRef, useCallback, useEffect } from "react";
import ActorBox from "./ActorBox";
import UseCaseBox from "./UseCaseBox";
import AssociationLine from "./AssociationLine";
import EditModal from "./EditModal";
import { exportNodeAsPng, exportNodeAsSvg, sanitizeFilename } from "@/lib/exporter";
import UseCaseToolbar from "./UseCaseToolbar";

const ACTOR_SIZE = 100;

export default function UseCaseCanvas({
  actors,
  setActors,
  useCases,
  setUseCases,
  associations = [],
  setAssociations,
  systemBoundary,
  setSystemBoundary,
  diagramName,
}) {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [draggingActor, setDraggingActor] = useState(null);
  const [draggingUseCase, setDraggingUseCase] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editTarget, setEditTarget] = useState(null);
  const [resizingSystemBoundary, setResizingSystemBoundary] = useState(false);
  const [pendingAssociation, setPendingAssociation] = useState(null);

  // ── CENTER SYSTEM BOUNDARY ────────────────────────────────────────────────
  useEffect(() => {
    const centerSystemBoundary = () => {
      if (canvasRef.current) {
        const canvasWidth = canvasRef.current.offsetWidth;
        const centeredX = (canvasWidth - systemBoundary.width) / 2;
        setSystemBoundary(prev => ({ ...prev, x: Math.max(20, centeredX) }));
      }
    };

    const resizeObserver = new ResizeObserver(centerSystemBoundary);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    centerSystemBoundary();

    return () => resizeObserver.disconnect();
  }, [systemBoundary.width]);

  // ── DROP from palette ──────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/palette-item");
    if (!raw) return;
    const item = JSON.parse(raw);
    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    if (item.kind === "actor") {
      const newActor = {
        id: `actor-${Date.now()}`,
        type: "actor",
        name: item.defaultName,
        description: "",
        x: Math.max(20, dropX - ACTOR_SIZE / 2),
        y: Math.max(20, dropY - ACTOR_SIZE / 2),
      };
      setActors(prev => [...prev, newActor]);
      setEditTarget({ type: "actor", item: newActor, isNew: true });
    }

    if (item.kind === "usecase") {
      const newUseCase = {
        id: `usecase-${Date.now()}`,
        type: "usecase",
        name: item.defaultName,
        description: "",
        x: Math.max(20, dropX - 60),
        y: Math.max(20, dropY - 40),
        width: 120,
        height: 80,
      };
      setUseCases(prev => [...prev, newUseCase]);
      setEditTarget({ type: "usecase", item: newUseCase, isNew: true });
    }

    if (item.kind === "association") {
      if (actors.length === 0 && useCases.length === 0) return;
      setPendingAssociation({ assocType: item.assocType || "association" });
    }
  }, [setActors, setUseCases, actors.length, useCases.length]);

  const handleDragOver = (e) => e.preventDefault();

  // ── ACTOR drag ────────────────────────────────────────────────────────────
  const handleActorMouseDown = (e, actor) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingActor(actor.id);
    setDragOffset({ x: e.clientX - rect.left - actor.x, y: e.clientY - rect.top - actor.y });
  };

  // ── USECASE drag ──────────────────────────────────────────────────────────
  const handleUseCaseMouseDown = (e, useCase) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingUseCase(useCase.id);
    setDragOffset({ x: e.clientX - rect.left - useCase.x, y: e.clientY - rect.top - useCase.y });
  };

  // ── MOUSE MOVE ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Handle system boundary resize
    if (resizingSystemBoundary) {
      const newHeight = Math.max(150, my - systemBoundary.y);
      setSystemBoundary(prev => ({ ...prev, height: newHeight }));

      // Auto-scroll hacia abajo si el usuario está estirando cerca del borde visible
      if (scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        const scrollRect = scrollContainer.getBoundingClientRect();
        const bottomThreshold = scrollRect.bottom - 100; // 100px antes del bottom

        if (e.clientY > bottomThreshold) {
          const scrollSpeed = Math.min((e.clientY - bottomThreshold) * 0.5, 20);
          scrollContainer.scrollTop += scrollSpeed;
        }
      }
      return;
    }

    if (draggingActor) {
      setActors(prev => prev.map(a =>
        a.id === draggingActor ? { ...a, x: Math.max(20, mx - dragOffset.x), y: Math.max(20, my - dragOffset.y) } : a
      ));
    }
    if (draggingUseCase) {
      setUseCases(prev => prev.map(u =>
        u.id === draggingUseCase ? { ...u, x: Math.max(20, mx - dragOffset.x), y: Math.max(20, my - dragOffset.y) } : u
      ));
    }
  }, [draggingActor, draggingUseCase, dragOffset, resizingSystemBoundary, systemBoundary.y, setActors, setUseCases]);

  const handleMouseUp = () => {
    setDraggingActor(null);
    setDraggingUseCase(null);
    setResizingSystemBoundary(false);
  };

  // ── SYSTEM BOUNDARY RESIZE ───────────────────────────────────────────────
  const handleSystemBoundaryResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingSystemBoundary(true);
  };

  // ── HANDLE ELEMENT CLICK FOR ASSOCIATIONS ─────────────────────────────────
  const handleElementClickForAssociation = (elementId) => {
    if (!pendingAssociation) return;
    
    if (!pendingAssociation.from) {
      // Seleccionar primer elemento
      setPendingAssociation(prev => ({ ...prev, from: elementId }));
      return;
    }

    // No permitir asociación con el mismo elemento
    if (pendingAssociation.from === elementId) return;

    // Crear la asociación
    const newAssociation = {
      id: `assoc-${Date.now()}`,
      from: pendingAssociation.from,
      to: elementId,
      label: "Asociación",
      type: pendingAssociation.assocType || "association",
    };

    if (setAssociations) {
      setAssociations(prev => [...prev, newAssociation]);
    }
    setPendingAssociation(null);
    setEditTarget({ type: "association", item: newAssociation });
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const deleteActor = (id) => {
    setActors(prev => prev.filter(a => a.id !== id));
    if (setAssociations) {
      setAssociations(prev => prev.filter(a => a.from !== id && a.to !== id));
    }
    setSelected(null);
  };
  const deleteUseCase = (id) => {
    setUseCases(prev => prev.filter(u => u.id !== id));
    if (setAssociations) {
      setAssociations(prev => prev.filter(a => a.from !== id && a.to !== id));
    }
    setSelected(null);
  };
  const deleteAssociation = (id) => {
    if (setAssociations) {
      setAssociations(prev => prev.filter(a => a.id !== id));
    }
    setSelected(null);
  };

  // ── EDIT SAVE ─────────────────────────────────────────────────────────────
  const handleSaveEdit = (updated) => {
    if (editTarget.type === "actor") setActors(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (editTarget.type === "usecase") setUseCases(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (editTarget.type === "association" && setAssociations) setAssociations(prev => prev.map(a => a.id === updated.id ? updated : a));
    setEditTarget(null);
  };

  // ── CANVAS SIZE CALCULATION ───────────────────────────────────────────────
  const canvasHeight = Math.max(280,
    actors.reduce((max, a) => Math.max(max, a.y + ACTOR_SIZE + 40), 280),
    useCases.reduce((max, u) => Math.max(max, u.y + (u.height || 80) + 40), 280),
    systemBoundary.y + systemBoundary.height + 40,
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <UseCaseToolbar
        pendingAssociation={pendingAssociation}
        onCancelPending={() => setPendingAssociation(null)}
      />
      <div ref={scrollContainerRef} className="flex-1 overflow-auto p-6">
        <div
          ref={canvasRef}
          className="relative bg-white rounded-2xl shadow-sm border border-slate-200 select-none"
          style={{ width: '100%', height: canvasHeight, minWidth: '100%', minHeight: '100%' }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelected(null)}
        >
            <div className="flex items-center gap-2">
                <button
                  onClick={() => canvasRef.current && exportNodeAsPng(canvasRef.current, `${sanitizeFilename(diagramName)}.png`)}
                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:brightness-95"
                  title="Exportar PNG"
                >PNG</button>
                <button
                  onClick={() => canvasRef.current && exportNodeAsSvg(canvasRef.current, `${sanitizeFilename(diagramName)}.svg`)}
                  className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200"
                  title="Exportar SVG"
                >SVG</button>
            </div>
          {/* Grid dots */}
          <svg className="absolute inset-0 w-full h-full rounded-2xl" style={{ zIndex: 0 }}>
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#e2e8f0" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* System boundary (resizable) */}
          <svg 
            className="absolute" 
            style={{ 
              left: systemBoundary.x, 
              top: systemBoundary.y, 
              zIndex: 0, 
              pointerEvents: "auto",
              cursor: resizingSystemBoundary ? "ns-resize" : "default"
            }} 
            width={systemBoundary.width} 
            height={systemBoundary.height}
          >
            <rect 
              x="0" 
              y="0" 
              width={systemBoundary.width} 
              height={systemBoundary.height} 
              fill="none" 
              stroke="#cbd5e1" 
              strokeWidth="2" 
              strokeDasharray="5,5"
              pointerEvents="none"
            />
            <text 
              x={systemBoundary.width / 2} 
              y="20" 
              fontSize="12" 
              fill="#94a3b8" 
              fontWeight="bold"
              pointerEvents="none"
              textAnchor="middle"
            >
              Sistema
            </text>
            
            {/* Resize handle at bottom */}
            <rect
              x="0"
              y={systemBoundary.height - 8}
              width={systemBoundary.width}
              height="8"
              fill="transparent"
              onMouseDown={handleSystemBoundaryResizeStart}
              style={{ pointerEvents: "auto", cursor: "ns-resize" }}
            />
            {/* Visual indicator for resize handle */}
            <line
              x1="0"
              y1={systemBoundary.height - 4}
              x2={systemBoundary.width}
              y2={systemBoundary.height - 4}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="3,3"
              pointerEvents="none"
            />
          </svg>

          {/* Associations */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 5 }}>
            {associations.map(assoc => (
              <AssociationLine
                key={assoc.id}
                association={assoc}
                actors={actors}
                useCases={useCases}
                isSelected={selected === assoc.id}
                onClick={(e) => { e.stopPropagation(); setSelected(assoc.id); }}
                onDelete={() => deleteAssociation(assoc.id)}
              />
            ))}
          </svg>

          {/* Actors */}
          {actors.map(actor => (
            <div key={actor.id} style={{ position: "relative", zIndex: 10 }}>
              <ActorBox
                actor={actor}
                isSelected={selected === actor.id}
                isDragging={draggingActor === actor.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (pendingAssociation) {
                    handleElementClickForAssociation(actor.id);
                  } else {
                    setSelected(actor.id);
                  }
                }}
                onDoubleClick={() => setEditTarget({ type: "actor", item: actor })}
                onDelete={() => deleteActor(actor.id)}
                onMouseDown={(e) => handleActorMouseDown(e, actor)}
              />
            </div>
          ))}

          {/* Use Cases */}
          {useCases.map(useCase => (
            <div key={useCase.id} style={{ position: "relative", zIndex: 10 }}>
              <UseCaseBox
                useCase={useCase}
                isSelected={selected === useCase.id}
                isDragging={draggingUseCase === useCase.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (pendingAssociation) {
                    handleElementClickForAssociation(useCase.id);
                  } else {
                    setSelected(useCase.id);
                  }
                }}
                onDoubleClick={() => setEditTarget({ type: "usecase", item: useCase })}
                onDelete={() => deleteUseCase(useCase.id)}
                onMouseDown={(e) => handleUseCaseMouseDown(e, useCase)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          target={editTarget}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
