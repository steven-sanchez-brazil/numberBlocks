import React from 'react';
import { RefreshCw, Scissors, Star } from 'lucide-react';
import { getBlockStyle } from '../utils/colors';
import { getValidWidths } from '../utils/geometry';

/**
 * Componente visual que representa un Numberblock.
 * Soporta drag & drop, doble clic para dividir, y rotación de forma.
 */
const NumberBlock = React.memo(({ value, x, y, id, width, onPointerDown, onDoubleClick, onRotate, highlight = false }) => {
  const style = getBlockStyle(value);
  const cols = width || 1;
  const rows = Math.ceil(value / cols);

  let blockSize = 38;
  if (value > 80) blockSize = 18;
  else if (value > 50) blockSize = 22;
  else if (value > 25) blockSize = 28;
  else if (value > 10) blockSize = 32;

  const validWidths = getValidWidths(value);
  const canTransform = validWidths.length > 1;

  return (
    <div
      id={`block-${id}`}
      data-value={value}
      data-width={cols}
      data-bsize={blockSize}
      onPointerDown={(e) => onPointerDown(e, id)}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(id); }}
      className={`group absolute touch-none select-none flex flex-col-reverse items-center animate-in zoom-in duration-300 ${value === 100 ? 'z-50' : 'z-10'}`}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        cursor: 'grab',
        transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)'
      }}
    >
      {(highlight || value === 100) && (
        <div className={`absolute inset-x-[-50px] inset-y-[-40px] blur-3xl rounded-full animate-pulse z-0 ${value === 100 ? 'bg-red-400/20' : 'bg-white/60'}`} />
      )}
      <div className={`relative z-10 transition-all ${highlight ? 'scale-105' : ''}`}>
        {canTransform && (
          <button
            onPointerDown={(e) => { e.stopPropagation(); onRotate(id); }}
            className="absolute -right-8 top-0 bg-white shadow-md rounded-full p-1.5 border border-slate-200 text-sky-500 hover:bg-sky-50 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-50 pointer-events-auto"
          >
            <RefreshCw size={14} />
          </button>
        )}
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: `${cols * blockSize}px`,
            border: `1px solid ${style.border}`,
            boxShadow: style.glow || 'none'
          }}
        >
          {Array.from({ length: value }).map((_, i) => {
            const faceIndex = Math.floor(cols / 2);
            const isFaceBlock = i === faceIndex;
            return (
              <div
                key={i}
                className="relative flex items-center justify-center"
                style={{
                  width: `${blockSize}px`,
                  height: `${blockSize}px`,
                  background: style.bg,
                  border: `0.5px solid rgba(0,0,0,0.1)`
                }}
              >
                {isFaceBlock && (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center ${blockSize < 25 ? 'scale-75' : 'scale-90'}`}>
                    <div className="flex gap-1 mb-1">
                      {value === 1 ? (
                        <div className="w-4 h-4 bg-black rounded-full border-2 border-white" />
                      ) : (
                        <>
                          <div className="w-2.5 h-2.5 bg-black rounded-full border-2 border-white" />
                          <div className="w-2.5 h-2.5 bg-black rounded-full border-2 border-white" />
                        </>
                      )}
                    </div>
                    <div className="w-5 h-2 bg-black/25 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mb-1 font-black pointer-events-none z-20 text-black flex items-center gap-1 text-base">
        {value === 100 && <Star size={16} className="fill-red-500 text-red-500 animate-spin-slow" />}
        {value}
        {value === 100 && <Star size={16} className="fill-red-500 text-red-500 animate-spin-slow" />}
      </div>
      {value > 1 && (
        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Scissors size={14} className="text-slate-400 rotate-90" />
        </div>
      )}
    </div>
  );
});

export default NumberBlock;
