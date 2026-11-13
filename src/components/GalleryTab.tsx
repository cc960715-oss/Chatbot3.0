import React, { useState } from 'react';
import { Lock, Eye, ShieldAlert } from 'lucide-react';
import { PORTRAITS, FORBIDDEN_SOVEREIGN, PortraitItem } from '../data/lore';

interface GalleryTabProps {
  unlockedImages: string[];
  chaoxiDiscountActive: boolean;
  gateOpen: boolean;
  onSelectPortrait: (portrait: PortraitItem) => void;
  onRequestPurchase: (query: string) => void;
}

export const GalleryTab: React.FC<GalleryTabProps> = ({
  unlockedImages,
  chaoxiDiscountActive,
  gateOpen,
  onSelectPortrait,
  onRequestPurchase,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section aria-label="絕密畫冊典藏" className="space-y-8">
      <div className="pb-5 border-b border-[#D6CEBE]">
        <p className="text-xs font-mono tracking-wider text-stone-500">
          書靈私藏 · 鎮閣之寶圖鑑
        </p>
        <h2 className="mt-1 text-2xl font-serif font-semibold text-stone-900">
          神域絕密畫像匣
        </h2>
        <p className="mt-1.5 text-sm text-stone-600">
          書靈冒著被抽魂鞭抽成紙片的風險偷偷收藏的三位原初神與國師畫像。在對話中支付足夠樹葉子即可解鎖典藏。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {PORTRAITS.map((portrait) => {
          const isUnlocked = unlockedImages.includes(portrait.id);
          const effectivePrice = Math.max(
            1,
            portrait.price - (chaoxiDiscountActive ? 1 : 0)
          );

          return (
            <article
              key={portrait.id}
              className="bg-[#FBF9F5] border border-[#D6CEBE] flex flex-col justify-between overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-[#EBE6DF] border-b border-[#D6CEBE] overflow-hidden flex items-center justify-center">
                {isUnlocked && !failedImages[portrait.id] ? (
                  <img
                    src={portrait.imagePath}
                    alt={`${portrait.name} — ${portrait.title}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [portrait.id]: true }))
                    }
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="p-6 text-center flex flex-col items-center justify-center text-stone-500">
                    <Lock className="w-6 h-6 mb-2 text-stone-400" />
                    <span className="font-serif text-base text-stone-700">
                      {isUnlocked ? portrait.name : '畫像尚未解鎖'}
                    </span>
                    <span className="text-xs text-stone-500 mt-1">
                      {portrait.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                    <span>{portrait.rank}</span>
                    <span className="font-mono tabular-nums text-[#78350F] font-semibold">
                      {isUnlocked ? '已典藏' : `${effectivePrice} 片樹葉子`}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-lg font-serif font-semibold text-stone-900">
                    {portrait.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">{portrait.title}</p>
                  <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                    {isUnlocked ? portrait.summary : portrait.spiritNote}
                  </p>
                </div>

                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => onSelectPortrait(portrait)}
                    className="w-full py-2.5 px-4 text-xs font-medium bg-[#EBE6DF] text-stone-900 hover:bg-[#DFD8CC] border border-[#D6CEBE] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>檢視大圖與人物檔案</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!gateOpen}
                    onClick={() =>
                      onRequestPurchase(
                        `我想看${portrait.name}的絕密畫像！請問要多少樹葉子？`
                      )
                    }
                    className="w-full py-2.5 px-4 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    向書靈詢價解鎖
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Forbidden Taboo Section: Mother of Gods */}
      <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-[#991B1B] font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>絕對禁區 · 無價 ／ 無圖</span>
          </div>
          <h3 className="text-lg font-serif font-semibold text-stone-900">
            {FORBIDDEN_SOVEREIGN.name} — {FORBIDDEN_SOVEREIGN.title}
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            {FORBIDDEN_SOVEREIGN.summary} 任何敢於偷繪神母尊容者，不等刑懲殿動手便會當場神魂俱滅。
          </p>
        </div>

        <button
          type="button"
          disabled={!gateOpen}
          onClick={() =>
            onRequestPurchase('書靈書靈，你有沒有偷藏神母大人的畫像或照片啊？我想看！')
          }
          className="px-4 py-2.5 text-xs font-medium border border-[#991B1B]/40 text-[#991B1B] hover:bg-[#991B1B]/5 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          試探索取神母畫像
        </button>
      </div>
    </section>
  );
};
