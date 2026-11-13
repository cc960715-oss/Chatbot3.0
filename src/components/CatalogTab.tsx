import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LORE_CATALOG, LoreCatalogEntry } from '../data/lore';

interface CatalogTabProps {
  surcharge: number;
  chaoxiDiscountActive: boolean;
  gateOpen: boolean;
  onAskSpirit: (query: string) => void;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  surcharge,
  chaoxiDiscountActive,
  gateOpen,
  onAskSpirit,
}) => {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  const filtered = LORE_CATALOG.filter((entry) =>
    filter === 'all' ? true : entry.category === filter
  );

  const computeEffectivePrice = (entry: LoreCatalogEntry) => {
    if (entry.category === 'free') return 0;
    const raw = entry.basePrice + surcharge - (chaoxiDiscountActive ? 1 : 0);
    return Math.max(1, raw);
  };

  return (
    <section aria-label="萬經閣典籍目錄" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#D6CEBE]">
        <div>
          <p className="text-xs font-mono tracking-wider text-stone-500">
            萬經閣藏書總目 · 免費公開與上古祕辛索引
          </p>
          <h2 className="mt-1 text-2xl font-serif font-semibold text-stone-900">
            諸天典籍索引目錄
          </h2>
          <p className="mt-1.5 text-sm text-stone-600">
            基礎神域常識免費查閱；上古祕辛與私密八卦須支付樹葉子向書靈借閱。
            {surcharge > 0 && (
              <span className="ml-1 text-[#991B1B] font-medium">
                （因先前驚擾朝曉大人，祕辛全面加收 {surcharge} 片精神賠償）
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EBE6DF] border border-[#D6CEBE] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#FBF9F5] text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            全部典籍
          </button>
          <button
            type="button"
            onClick={() => setFilter('free')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              filter === 'free'
                ? 'bg-[#FBF9F5] text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            免費公開區
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              filter === 'paid'
                ? 'bg-[#FBF9F5] text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            付費祕辛區
          </button>
        </div>
      </div>

      <div className="divide-y divide-[#D6CEBE] border-b border-[#D6CEBE]">
        {filtered.map((entry, idx) => {
          const price = computeEffectivePrice(entry);
          return (
            <div
              key={entry.id}
              className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span className="font-mono tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {entry.category === 'free' ? '免費公開典籍' : '付費祕辛檔案'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{entry.subtitle}</span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-stone-900">
                  {entry.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {entry.teaser}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <div className="text-right font-mono tabular-nums text-sm">
                  {price === 0 ? (
                    <span className="text-[#14532D] font-medium">免費查閱</span>
                  ) : (
                    <span className="text-[#78350F] font-semibold">
                      {price} 片樹葉子
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!gateOpen}
                  onClick={() => onAskSpirit(entry.promptQuery)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>向書靈打聽</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
