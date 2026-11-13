import React from 'react';

export const CodexTab: React.FC = () => {
  return (
    <section aria-label="神域法理與世界觀總綱" className="space-y-8">
      <div className="pb-5 border-b border-[#D6CEBE]">
        <p className="text-xs font-mono tracking-wider text-stone-500">
          《神域與萬界樹》基礎卷宗 · 訪客入閣須知
        </p>
        <h2 className="mt-1 text-2xl font-serif font-semibold text-stone-900">
          神域法理與三大鐵律
        </h2>
        <p className="mt-1.5 text-sm text-stone-600">
          以下條文屬於萬經閣免費公開之基礎典籍，供諸天訪客入閣前閱覽校對。
        </p>
      </div>

      {/* Three Iron Laws */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold text-stone-900">
          01. 神域三大鐵律（觸犯者直接執行神魂俱滅）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-5 space-y-2">
            <div className="text-xs font-mono text-stone-500">第一律</div>
            <h4 className="font-serif font-semibold text-stone-900">禁侵本體</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              嚴禁任何傷害萬界樹樹幹、根系與核心中心花園之行為。
            </p>
          </div>
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-5 space-y-2">
            <div className="text-xs font-mono text-stone-500">第二律</div>
            <h4 className="font-serif font-semibold text-stone-900">禁物下凡</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              嚴禁將中心區與花園任何物品帶入凡間；超出世界承載極限的準神產物將被凡間法則自動彈回。
            </p>
          </div>
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-5 space-y-2">
            <div className="text-xs font-mono text-stone-500">第三律</div>
            <h4 className="font-serif font-semibold text-stone-900">禁損邊界</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              嚴禁破壞或私自毀損十二邊界柱之封印陣法，以免命運污染湧入。
            </p>
          </div>
        </div>
      </div>

      {/* Five Divine Ranks */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold text-stone-900">
          02. 五大神階體系
        </h3>
        <div className="bg-[#FBF9F5] border border-[#D6CEBE] divide-y divide-[#E5DFD2]">
          {[
            {
              rank: '至高神',
              members: '神母 · 謝閒雲',
              desc: '源自混沌與萬界樹本源，無須信仰供養，世界頂點與規則主宰。',
            },
            {
              rank: '原初神',
              members: '准序 · 朝曦 · 朝曉',
              desc: '神母分化自身力量所生之子嗣，執掌中央朝廷核心職權，對神母抱持絕對忠誠。',
            },
            {
              rank: '正神',
              members: '紊霜 · 米賽·拉尼亞 等',
              desc: '每「一萬個界域日」通過神母親自受冕認可，獲得官方神職與神聖力量。',
            },
            {
              rank: '準神',
              members: '飛升者與新派諸神',
              desc: '未受冕前均稱準神；極度依賴凡人信仰，若被遺忘會逐漸衰弱消散。',
            },
            {
              rank: '附庸神',
              members: '簽訂庇護契約之準神',
              desc: '等待受冕期間與正神簽訂私下庇護契約，正神隕落時會遭受強烈反噬。',
            },
          ].map((item) => (
            <div
              key={item.rank}
              className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6"
            >
              <div className="sm:w-44 shrink-0">
                <span className="font-serif font-semibold text-stone-900">
                  {item.rank}
                </span>
                <div className="text-xs text-stone-500 mt-0.5">{item.members}</div>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed flex-1">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Three Factions */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold text-stone-900">
          03. 三大陣營校對（嚴格區分歷史統稱與實體組織）
        </h3>
        <div className="bg-[#FBF9F5] border border-[#D6CEBE] divide-y divide-[#E5DFD2]">
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <span>正統派</span>
              <span className="text-xs font-normal text-stone-500">
                · 歷史概念統稱（非實體組織）
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              指效忠神母與原初神的神明群體，掌控中央朝廷核心權力，恪守「守護萬界樹」原則。
            </p>
          </div>
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <span>沉默派</span>
              <span className="text-xs font-normal text-stone-500">
                · 歷史概念統稱（非實體組織）
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              歷經兩次神戰與大清洗後倖存的古代舊神，全心避世休養，深知神母之恐怖，仍具備輕鬆處置新派的底氣。
            </p>
          </div>
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <span>新派</span>
              <span className="text-xs font-normal text-[#78350F]">
                · 唯一具體實體聯盟組織（由「元老院」統籌）
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              大清洗後加入神域的新神聯盟，極度依賴凡人信仰，因未見識過大清洗而傲慢膨脹，拒絕受冕亦不簽訂附庸契約。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
