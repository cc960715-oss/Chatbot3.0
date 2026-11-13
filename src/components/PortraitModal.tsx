import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { PortraitItem } from '../data/lore';

interface PortraitModalProps {
  portrait: PortraitItem | null;
  onClose: () => void;
}

export const PortraitModal: React.FC<PortraitModalProps> = ({ portrait, onClose }) => {
  const [imgError, setImgError] = useState(false);

  if (!portrait) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 sm:p-6 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portrait-modal-title"
    >
      <div
        className="relative w-full max-w-4xl bg-[#FBF9F5] border border-[#D6CEBE] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉畫像檢視"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-[#FBF9F5]/90 border border-[#D6CEBE] text-stone-700 hover:text-stone-950 hover:bg-[#EBE6DF] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Artwork Presentation Frame */}
        <div className="md:col-span-7 bg-[#EBE6DF] flex items-center justify-center p-4 sm:p-6 min-h-[340px] md:min-h-[520px]">
          {!imgError ? (
            <img
              src={portrait.imagePath}
              alt={`${portrait.name} — ${portrait.title}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="max-h-[480px] w-auto object-contain border border-[#D6CEBE] shadow-sm"
            />
          ) : (
            <div className="w-full h-80 flex flex-col items-center justify-center border border-[#D6CEBE] bg-[#F7F4EE] text-stone-500 p-6 text-center">
              <Sparkles className="w-8 h-8 mb-3 text-stone-400" />
              <p className="font-serif text-base text-stone-700">{portrait.name}</p>
              <p className="text-xs mt-1">{portrait.title}</p>
            </div>
          )}
        </div>

        {/* Curatorial Accession Metadata */}
        <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#D6CEBE]">
          <div>
            <div className="text-xs font-mono tracking-wider text-stone-500">
              萬經閣秘藏圖錄 · 典藏編號 {portrait.id.replace('.png', '').toUpperCase()}
            </div>
            <h2
              id="portrait-modal-title"
              className="mt-2 text-2xl font-serif font-semibold text-stone-900"
            >
              {portrait.name}
            </h2>
            <p className="text-sm text-stone-600 mt-1">{portrait.title}</p>

            <div className="mt-6 border-t border-[#D6CEBE]">
              <dl className="divide-y divide-[#E5DFD2] text-sm">
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-stone-500 shrink-0">神階地位</dt>
                  <dd className="text-stone-900 text-right">{portrait.rank}</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-stone-500 shrink-0">身形記載</dt>
                  <dd className="text-stone-900 text-right font-mono tabular-nums">{portrait.height}</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-stone-500 shrink-0">性格核心</dt>
                  <dd className="text-stone-900 text-right">{portrait.traits}</dd>
                </div>
                <div className="py-3 flex flex-col gap-1">
                  <dt className="text-stone-500">外貌與符號</dt>
                  <dd className="text-stone-900 leading-relaxed">{portrait.symbols}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 pt-4 border-t border-[#D6CEBE]">
              <p className="text-sm text-stone-700 leading-relaxed">{portrait.summary}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#D6CEBE] text-xs text-stone-600 italic leading-relaxed">
            {portrait.spiritNote}
          </div>
        </div>
      </div>
    </div>
  );
};
