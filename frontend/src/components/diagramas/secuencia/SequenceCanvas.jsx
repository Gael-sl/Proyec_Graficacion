import React, { useState, useRef, useCallback } from "react";
import { exportNodeAsPng, exportNodeAsSvg, sanitizeFilename } from "@/lib/exporter";
import ActorColumn from "./ActorColumn";
import MessageArrow from "./MessageArrow";
import FragmentBox from "./FragmentBox";
import NoteBox from "./NoteBox";
import ActivationBar from "./ActivationBar";
import CanvasToolbar from "./CanvasToolbar";
import EditModal from "./EditModal";

const ACTOR_WIDTH = 120;
const LIFELINE_START_Y = 100;
const MESSAGE_HEIGHT = 60;

export default function SequenceCanvas({
  actors, setActors, messages, setMessages, selected, setSelected, diagramName
}) {
  const canvasRef = useRef(null);
  const [draggingActor, setDraggingActor] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0 });

  const [fragments, setFragments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activations, setActivations] = useState([]);

  const [draggingFragment, setDraggingFragment] = useState(null);
  const [draggingNote, setDraggingNote] = useState(null);
  const [resizingFragment, setResizingFragment] = useState(null);

  const [editTarget, setEditTarget] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [pendingActivation, setPendingActivation] = useState(null); // { actorId, startY }

  const lifelineHeight = Math.max(300, messages.length * MESSAGE_HEIGHT + 200);

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
      const x = dropX - ACTOR_WIDTH / 2;
      const newActor = { id: `a${Date.now()}`, name: item.defaultName, type: item.type, x: Math.max(20, x) };
      setActors(prev => [...prev, newActor]);
      setEditTarget({ type: "actor", item: newActor, isNew: true });
    }

    if (item.kind === "message") {
      if (actors.length < 2) return;
      setPendingMessage({ msgType: item.msgType, label: "mensaje()" });
    }

    if (item.kind === "fragment") {
      const newFrag = {
        id: `f${Date.now()}`,
        fragType: item.fragType,
        condition: "condición",
        x: Math.max(20, dropX - 100),
        y: Math.max(LIFELINE_START_Y, dropY - 40),
        width: 200,
        height: 120,
      };
      setFragments(prev => [...prev, newFrag]);
      setEditTarget({ type: "fragment", item: newFrag });
    }

    if (item.kind === "note") {
      const newNote = {
        id: `n${Date.now()}`,
        text: "Escribe tu nota aquí...",
        x: Math.max(20, dropX - 80),
        y: Math.max(20, dropY - 35),
        width: 160,
        height: 70,
      };
      setNotes(prev => [...prev, newNote]);
      setEditTarget({ type: "note", item: newNote });
    }

    if (item.kind === "activation") {
      if (actors.length === 0) return;
      // Find closest actor lifeline
      const closest = actors.reduce((best, a) => {
        const ax = a.x + ACTOR_WIDTH / 2;
        return Math.abs(ax - dropX) < Math.abs((best.x + ACTOR_WIDTH / 2) - dropX) ? a : best;
      }, actors[0]);
      const newBar = {
        id: `ac${Date.now()}`,
        actorId: closest.id,
        startY: Math.max(LIFELINE_START_Y + 10, dropY - 30),
        endY: Math.max(LIFELINE_START_Y + 40, dropY + 30),
      };
      setActivations(prev => [...prev, newBar]);
    }
  }, [actors]);

  const handleDragOver = (e) => e.preventDefault();

  // ── ACTOR drag ────────────────────────────────────────────────────────────
  const handleActorMouseDown = (e, actor) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingActor(actor.id);
    setDragOffset({ x: e.clientX - rect.left - actor.x });
  };

  // ── FRAGMENT drag ─────────────────────────────────────────────────────────
  const handleFragmentMouseDown = (e, frag) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingFragment({ id: frag.id, ox: e.clientX - rect.left - frag.x, oy: e.clientY - rect.top - frag.y });
  };

  // ── NOTE drag ─────────────────────────────────────────────────────────────
  const handleNoteMouseDown = (e, note) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingNote({ id: note.id, ox: e.clientX - rect.left - note.x, oy: e.clientY - rect.top - note.y });
  };

  // ── MOUSE MOVE ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (draggingActor) {
      setActors(prev => prev.map(a => a.id === draggingActor ? { ...a, x: Math.max(20, mx - dragOffset.x) } : a));
    }
    if (draggingFragment) {
      setFragments(prev => prev.map(f => f.id === draggingFragment.id
        ? { ...f, x: Math.max(0, mx - draggingFragment.ox), y: Math.max(0, my - draggingFragment.oy) }
        : f));
    }
    if (draggingNote) {
      setNotes(prev => prev.map(n => n.id === draggingNote.id
        ? { ...n, x: Math.max(0, mx - draggingNote.ox), y: Math.max(0, my - draggingNote.oy) }
        : n));
    }
    if (resizingFragment) {
      setFragments(prev => prev.map(f => f.id === resizingFragment.id
        ? { ...f, width: Math.max(80, mx - f.x), height: Math.max(60, my - f.y) }
        : f));
    }
  }, [draggingActor, dragOffset, draggingFragment, draggingNote, resizingFragment]);

  const handleMouseUp = () => {
    setDraggingActor(null);
    setDraggingFragment(null);
    setDraggingNote(null);
    setResizingFragment(null);
  };

  // ── LIFELINE click for messages ───────────────────────────────────────────
  const handleLifelineClick = (actorId) => {
    if (!pendingMessage) return;
    if (!pendingMessage.from) {
      setPendingMessage(prev => ({ ...prev, from: actorId }));
      return;
    }
    const newMsg = {
      id: `m${Date.now()}`,
      from: pendingMessage.from,
      to: actorId,
      label: pendingMessage.msgType === "self" ? "autoMensaje()" : "mensaje()",
      type: pendingMessage.msgType === "return" ? "return" : pendingMessage.msgType === "async" ? "async" : "sync",
      order: messages.length + 1,
    };
    setMessages(prev => [...prev, newMsg]);
    setPendingMessage(null);
    setEditTarget({ type: "message", item: newMsg });
  };

  // ── DELETE & DUPLICATE ────────────────────────────────────────────────────
  const deleteActor = (id) => {
    setActors(prev => prev.filter(a => a.id !== id));
    setMessages(prev => prev.filter(m => m.from !== id && m.to !== id));
    setActivations(prev => prev.filter(a => a.actorId !== id));
    setSelected(null);
  };
  const duplicateActor = (actor) => {
    const newId = `actor-${Date.now()}`;
    setActors(prev => [...prev, { ...actor, id: newId, x: actor.x + 130 }]);
  };
  const deleteMessage = (id) => { setMessages(prev => prev.filter(m => m.id !== id)); setSelected(null); };
  const deleteFragment = (id) => { setFragments(prev => prev.filter(f => f.id !== id)); setSelected(null); };
  const deleteNote = (id) => { setNotes(prev => prev.filter(n => n.id !== id)); setSelected(null); };
  const deleteActivation = (id) => { setActivations(prev => prev.filter(a => a.id !== id)); setSelected(null); };

  // ── EDIT SAVE ─────────────────────────────────────────────────────────────
  const handleSaveEdit = (updated) => {
    if (editTarget.type === "actor")    setActors(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (editTarget.type === "message")  setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
    if (editTarget.type === "fragment") setFragments(prev => prev.map(f => f.id === updated.id ? updated : f));
    if (editTarget.type === "note")     setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    setEditTarget(null);
  };

  const canvasWidth = Math.max(280,
    actors.reduce((max, a) => Math.max(max, a.x + ACTOR_WIDTH + 40), 280),
    fragments.reduce((max, f) => Math.max(max, f.x + f.width + 40), 280),
    notes.reduce((max, n) => Math.max(max, n.x + (n.width || 160) + 40), 280),
  );
  const canvasHeight = Math.max(
    lifelineHeight + 60,
    fragments.reduce((max, f) => Math.max(max, f.y + f.height + 40), lifelineHeight + 60),
    notes.reduce((max, n) => Math.max(max, n.y + (n.height || 70) + 40), lifelineHeight + 60),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      <CanvasToolbar
        pendingMessage={pendingMessage}
        onCancelPending={() => setPendingMessage(null)}
        actorCount={actors.length}
        messageCount={messages.length}
      />

      <div className="flex-1 overflow-auto p-6">
        <div
          ref={canvasRef}
          className="relative bg-white rounded-2xl shadow-sm border border-slate-200 select-none"
          style={{ minWidth: '100%', minHeight: '100%', width: canvasWidth, height: canvasHeight, cursor: draggingActor ? "grabbing" : "default" }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelected(null)}
        >
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
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

          {/* Fragments (behind lifelines) */}
          {fragments.map(frag => (
            <FragmentBox
              key={frag.id}
              fragment={frag}
              isSelected={selected === frag.id}
              onClick={(e) => { e.stopPropagation(); setSelected(frag.id); }}
              onDoubleClick={() => setEditTarget({ type: "fragment", item: frag })}
              onDelete={() => deleteFragment(frag.id)}
              onMouseDown={(e) => {
                if (e.target.dataset.resize) {
                  e.stopPropagation();
                  setResizingFragment({ id: frag.id });
                } else {
                  handleFragmentMouseDown(e, frag);
                }
              }}
            />
          ))}

          {/* Lifelines */}
          {actors.map(actor => (
            <svg
              key={`ll-${actor.id}`}
              className="absolute"
              style={{ left: actor.x + ACTOR_WIDTH / 2 - 1, top: LIFELINE_START_Y, zIndex: 1, pointerEvents: "none" }}
              width="2"
              height={lifelineHeight}
            >
              <line
                x1="1" y1="0" x2="1" y2={lifelineHeight}
                stroke={pendingMessage && pendingMessage.from === actor.id ? "#3b82f6" : "#64748b"}
                strokeWidth={pendingMessage && pendingMessage.from === actor.id ? 2 : 1.5}
                strokeDasharray="6,4"
              />
            </svg>
          ))}

          {/* Activation bars */}
          {activations.map(bar => (
            <ActivationBar
              key={bar.id}
              bar={bar}
              actors={actors}
              isSelected={selected === bar.id}
              onClick={(e) => { e.stopPropagation(); setSelected(bar.id); }}
              onDelete={() => deleteActivation(bar.id)}
            />
          ))}

          {/* Click zones on lifelines for messages */}
          {pendingMessage && actors.map(actor => (
            <div
              key={`zone-${actor.id}`}
              className="absolute cursor-pointer"
              style={{
                left: actor.x + ACTOR_WIDTH / 2 - 16,
                top: LIFELINE_START_Y,
                width: 32,
                height: lifelineHeight,
                zIndex: 5,
              }}
              onClick={(e) => { e.stopPropagation(); handleLifelineClick(actor.id); }}
              title={pendingMessage.from ? "Clic para seleccionar destino" : "Clic para seleccionar origen"}
            />
          ))}

          {/* Messages */}
          {messages.map((msg, idx) => {
            const fromActor = actors.find(a => a.id === msg.from);
            const toActor = actors.find(a => a.id === msg.to);
            if (!fromActor || !toActor) return null;
            return (
              <MessageArrow
                key={msg.id}
                msg={msg}
                fromX={fromActor.x + ACTOR_WIDTH / 2}
                toX={toActor.x + ACTOR_WIDTH / 2}
                y={LIFELINE_START_Y + 20 + idx * MESSAGE_HEIGHT}
                isSelected={selected === msg.id}
                onClick={(e) => { e.stopPropagation(); setSelected(msg.id); }}
                onDoubleClick={() => setEditTarget({ type: "message", item: msg })}
                onDelete={() => deleteMessage(msg.id)}
              />
            );
          })}

          {/* Notes */}
          {notes.map(note => (
            <NoteBox
              key={note.id}
              note={note}
              isSelected={selected === note.id}
              onClick={(e) => { e.stopPropagation(); setSelected(note.id); }}
              onDoubleClick={() => setEditTarget({ type: "note", item: note })}
              onDelete={() => deleteNote(note.id)}
              onMouseDown={(e) => handleNoteMouseDown(e, note)}
            />
          ))}

          {/* Actors */}
          {actors.map(actor => (
            <ActorColumn
              key={actor.id}
              actor={actor}
              isSelected={selected === actor.id}
              isDragging={draggingActor === actor.id}
              onClick={(e) => { e.stopPropagation(); setSelected(actor.id); }}
              onDoubleClick={() => setEditTarget({ type: "actor", item: actor })}
              onMouseDown={(e) => handleActorMouseDown(e, actor)}
              onDelete={() => deleteActor(actor.id)}
              onDuplicate={() => duplicateActor(actor)}
            />
          ))}

          {/* Empty state */}
          {actors.length === 0 && fragments.length === 0 && notes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none" style={{ zIndex: 2 }}>
              <p className="text-lg font-medium">Canvas vacío</p>
              <p className="text-sm mt-1">Arrastra participantes desde la paleta izquierda</p>
            </div>
          )}
        </div>
      </div>

      {editTarget && (
        <EditModal
          target={editTarget}
          actors={actors}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}