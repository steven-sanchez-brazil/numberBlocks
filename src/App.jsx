import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trophy, PlusCircle, RotateCcw, Zap, Sparkles } from 'lucide-react';
import NumberBlock from './components/NumberBlock';
import { playSound } from './hooks/useAudio';
import { generateId } from './utils/ids';
import { getValidWidths } from './utils/geometry';

/**
 * Orquestador principal del juego Numberblocks Fusion.
 * Maneja el estado del juego, detección de colisiones y lógica de juego.
 */
const App = () => {
  const [blocks, setBlocks] = useState([]);
  const [target, setTarget] = useState(10);
  const [score, setScore] = useState(0);
  const [highlightId, setHighlightId] = useState(null);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const containerRef = useRef(null);
  const draggingRef = useRef({ id: null, element: null, offsetX: 0, offsetY: 0, currentX: 0, currentY: 0 });

  const nextLevel = useCallback(() => {
    const newTarget = Math.floor(Math.random() * 91) + 10;
    setTarget(newTarget);
    setTimeout(() => {
        if (!containerRef.current) return;
        const h = containerRef.current.getBoundingClientRect().height;
        setBlocks([
          { id: generateId('b'), value: 1, x: 80, y: h - 10, width: 1 },
          { id: generateId('b'), value: 1, x: 150, y: h - 10, width: 1 }
        ]);
    }, 50);
    setHighlightId(null);
  }, []);

  useEffect(() => { nextLevel(); }, [nextLevel]);

  const rotateBlock = useCallback((id) => {
    playSound('transform');
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;
      const validWidths = getValidWidths(b.value);
      if (validWidths.length <= 1) return b;
      const currentIndex = validWidths.indexOf(b.width);
      const nextIndex = (currentIndex + 1) % validWidths.length;
      return { ...b, width: validWidths[nextIndex] };
    }));
  }, []);

  const spawnBlock = (val) => {
    playSound('spawn');
    const rect = containerRef.current.getBoundingClientRect();
    const widths = getValidWidths(val);
    const initialWidth = widths[0];
    const pixelWidth = initialWidth * (val > 10 ? 28 : 38);
    const safeX = Math.max(pixelWidth/2 + 20, Math.min(rect.width - pixelWidth/2 - 20, Math.random() * rect.width));

    const newBlock = {
      id: generateId('block'),
      value: val,
      x: safeX,
      y: rect.height - 10,
      width: initialWidth
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const splitBlock = useCallback((id) => {
    playSound('split');
    setBlocks(prev => {
      const blockToSplit = prev.find(b => b.id === id);
      if (!blockToSplit || blockToSplit.value <= 1) return prev;
      const newValue = blockToSplit.value - 1;
      const widths = getValidWidths(newValue);
      const updatedBlock = { ...blockToSplit, value: newValue, width: widths[0] };
      const newOne = { id: generateId('split'), value: 1, x: blockToSplit.x + 50, y: blockToSplit.y, width: 1 };
      return [...prev.filter(b => b.id !== id), updatedBlock, newOne];
    });
  }, []);

  const checkCollision = (dragId, x, y) => {
    const otherElements = Array.from(document.querySelectorAll(`[id^="block-"]:not([id="block-${dragId}"])`));
    for (let el of otherElements) {
      const rect = el.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const elX = rect.left - containerRect.left + rect.width / 2;
      const elY = rect.bottom - containerRect.top;
      const val = parseInt(el.getAttribute('data-value'));
      const widthUnits = parseInt(el.getAttribute('data-width'));
      const bSize = parseInt(el.getAttribute('data-bsize'));
      const heightUnits = Math.ceil(val / widthUnits);
      const pxWidth = widthUnits * bSize;
      const pxHeight = heightUnits * bSize;
      const thresholdX = (pxWidth / 2) + 25;
      const thresholdY = 25;
      const isInsideX = Math.abs(x - elX) < thresholdX;
      const isInsideY = y > (elY - pxHeight - thresholdY) && y < (elY + thresholdY);
      if (isInsideX && isInsideY) return el.id.replace('block-', '');
    }
    return null;
  };

  const handlePointerDown = (e, id) => {
    if (e.target.closest('button')) return;
    const blockElement = document.getElementById(`block-${id}`);
    if (!blockElement) return;
    const rect = containerRef.current.getBoundingClientRect();
    const blockData = blocks.find(b => b.id === id);
    if (!blockData) return;
    draggingRef.current = { id, element: blockElement, offsetX: e.clientX - rect.left - blockData.x, offsetY: e.clientY - rect.top - blockData.y, currentX: blockData.x, currentY: blockData.y };
    blockElement.style.zIndex = "2000";
    blockElement.style.transition = "none";
    blockElement.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const state = draggingRef.current;
    if (!state.id || !state.element) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bSize = parseInt(state.element.getAttribute('data-bsize'));
    const cols = parseInt(state.element.getAttribute('data-width'));
    const pixelWidth = cols * bSize;
    let nextX = e.clientX - rect.left - state.offsetX;
    let nextY = e.clientY - rect.top - state.offsetY;
    nextX = Math.max(pixelWidth/2, Math.min(rect.width - pixelWidth/2, nextX));
    state.currentX = nextX;
    state.currentY = nextY;
    state.element.style.left = `${state.currentX}px`;
    state.element.style.top = `${state.currentY}px`;
    const targetId = checkCollision(state.id, state.currentX, state.currentY);
    if (targetId !== highlightId) setHighlightId(targetId);
  };

  const handlePointerUp = (e) => {
    const state = draggingRef.current;
    if (!state.id) return;
    if (state.element) state.element.releasePointerCapture(e.pointerId);
    const targetId = checkCollision(state.id, state.currentX, state.currentY);
    if (targetId) {
      const sourceBlock = blocks.find(b => b.id === state.id);
      const targetBlock = blocks.find(b => b.id === targetId);
      if (sourceBlock && targetBlock) {
        const newValue = sourceBlock.value + targetBlock.value;
        if (newValue <= 100) {
          playSound('merge');
          const remainingBlocks = blocks.filter(b => b.id !== state.id && b.id !== targetId);
          const widths = getValidWidths(newValue);
          const mergedBlock = { id: generateId('merged'), value: newValue, x: targetBlock.x, y: targetBlock.y, width: widths[0] };
          setBlocks([...remainingBlocks, mergedBlock]);
          if (!isFreeMode && newValue === target) {
            playSound('success');
            setScore(s => s + 1);
            setTimeout(() => { setBlocks([]); setTimeout(nextLevel, 400); }, 1500);
          }
        }
      }
    } else {
      setBlocks(prev => prev.map(b => b.id === state.id ? { ...b, x: state.currentX, y: state.currentY } : b));
    }
    if (state.element) {
        state.element.style.zIndex = "10";
        state.element.style.transition = "transform 0.2s, left 0.2s, top 0.2s";
    }
    draggingRef.current = { id: null, element: null, offsetX: 0, offsetY: 0, currentX: 0, currentY: 0 };
    setHighlightId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-sky-50 overflow-hidden font-sans select-none">
      {/* Header */}
      <div className="bg-white p-2 flex justify-between items-center shadow-sm border-b-2 border-sky-100 z-50">
        <div className="flex items-center gap-2">
          {!isFreeMode && (
            <div className="flex items-center gap-1.5">
              <div className="bg-orange-500 p-1 rounded-lg"><Trophy className="text-white" size={12} /></div>
              <p className="text-sm font-black text-slate-800 leading-none">{score}</p>
            </div>
          )}
          <button onClick={() => setIsFreeMode(!isFreeMode)} className="px-2 py-1 rounded-lg border text-[9px] font-bold uppercase transition-all bg-slate-50 border-slate-200 text-slate-500 active:bg-sky-100">
            {isFreeMode ? 'Libre' : 'Reto'}
          </button>
        </div>
        <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 shadow-inner transition-colors ${isFreeMode ? 'bg-purple-50 border-purple-200' : 'bg-yellow-100 border-yellow-300'}`}>
          <Sparkles className={isFreeMode ? 'text-purple-400' : 'text-yellow-600'} size={12} />
          <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">
            {isFreeMode ? '¡Suma hasta el 100!' : `Objetivo: ${target}`}
          </span>
        </div>
        <button onClick={() => {setBlocks([]); nextLevel();}} className="p-1.5 bg-slate-50 rounded-full border border-slate-200 text-slate-500 hover:bg-red-50 transition-colors"><RotateCcw size={14} /></button>
      </div>

      {/* Game Area */}
      <div ref={containerRef} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} className="flex-1 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden pointer-events-auto">
        {blocks.map(block => (
          <NumberBlock key={block.id} id={block.id} value={block.value} width={block.width} x={block.x} y={block.y} onPointerDown={handlePointerDown} onDoubleClick={splitBlock} onRotate={rotateBlock} highlight={highlightId === block.id} />
        ))}
        <div className="absolute bottom-0 w-full h-2 bg-green-500/20 border-t border-green-500/30 pointer-events-none" />
      </div>

      {/* Footer */}
      <div className="bg-white p-2 border-t border-slate-100 flex flex-col items-center gap-2 shadow-inner z-50">
        <div className="flex gap-2">
            <button onClick={() => spawnBlock(1)} className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-2xl shadow-[0_4px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all">
                <PlusCircle size={18} /> <span className="text-sm font-bold uppercase tracking-wide">Añadir 1</span>
            </button>
            <button onClick={() => spawnBlock(10)} className="flex items-center gap-2 bg-white text-red-500 border-2 border-red-500 px-5 py-3 rounded-2xl shadow-[0_4px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all">
                <Zap size={18} /> <span className="text-sm font-bold uppercase tracking-wide">Añadir 10</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;
