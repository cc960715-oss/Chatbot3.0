import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface GameState {
  leaves: number;
  warnings: number;
  surcharge: number;
  gateOpen: boolean;
  chaoxiaoState: string;
  unlockedImages: string[];
  chaoxiDiscountActive: boolean;
}

const PORTRAIT_PRICES: Record<string, number> = {
  'xiexianyun.png': 4,
  'zhunxu.png': 5,
  'chaoxi.png': 5,
  'chaoxiao.png': 8,
};

const INITIAL_GREETING = `歡迎光臨萬經閣呀～這位遠道而來的訪客！(ﾉ>ω<)ﾉ 我是坐鎮於此的守護書靈，平常在閣裡守著諸天萬界的典籍可憋壞啦，難得有人陪我說話呢！(*´∀\`)~♥

先提醒你喔，你現在手上有 **15 片樹葉子**——那可是神域最珍貴的運作資源，我也指望多攢點樹葉子去煙霞樓吃遍萬界美食、再買些好甜品孝敬朝曉大人呢！(✧ω✧) 想聽基礎常識的話我免費熱情講給你聽；要是想打聽上古祕辛、神明私下八卦，或是看我私藏的絕密畫像，那就得看你願意出幾片樹葉子啦～(¬‿¬)

不過千萬記得一件事：**在萬經閣說話絕對不能太大聲（單句千萬別超過兩個驚嘆號！）**，我們家老闆朝曉大人最討厭吵鬧了，被她聽見可是會出大事的……(´;ω;\`)

📜 【萬經閣訪客紀錄】 🍃 樹葉子：15 片 ｜ 🤫 警告次數：0 / 3 ｜ 👀 朝曉狀態：在裡殿重構世界 ｜ 🚪 閣門狀態：開放中`;

const WORLDVIEW_RAG_KNOWLEDGE = `
《神域與萬界樹》架構與世界觀設定集（完整RAG資料庫，嚴禁編造設定集以外的劇情）：

【第一章：核心世界架構與地理運作法則】
神域為懸浮並附著於「萬界樹」外圍的特殊高維空間，核心職責是作為第一道屏障防線，將諸天萬界產生的集體命運污染隔絕在萬界樹主體之外。
1.1 萬界樹與命運污染機制：
- 萬界樹（Ten Thousand Worlds Tree）：諸天萬界的本源本體。樹上的每一片葉子均代表一個獨立運作的世界（包含修仙界、高魔大陸、科技飛升文明等）。萬界樹本身的意識體具象化為「謝閒雲」。
- 命運污染（Destiny Contamination）：由「一切未被選擇的命運」凝聚累積的龐大怨恨與負面能量。必須達到至少「一個世界層級」的集體怨念才能凝結具象化。若污染直接侵蝕萬界樹，將導致樹葉（世界）枯萎腐朽並引發連鎖崩塌。
- 自然修剪機制（Pruning Protocol）：萬界樹上的枯萎世界僅在「自身自然走向無生靈、壽終正寢」後，才會由謝閒雲與毀滅之神（朝曦）進行修剪回收。因為無生靈死亡，修剪過程不會額外爆發集體生靈怨念，殘留的葉片能量會轉化為神域運作資源（「樹葉子」）。
1.2 神域地理與空間劃分：
- 核心中心區 (Central Core)：中心殿、刑懲殿、萬經閣、煙霞樓。圍繞萬界樹核心設置。中心殿為議事廳；刑懲殿由准序掌管執法；萬經閣儲藏知識；煙霞樓匯聚萬界美食且預設【絕對禁武】。
- 中心花園 (Garden Zone)：禁制花園。環繞中心區的植物花園，為歷史「採花案」發生地。設有強大禁制：離開中心區者身上嚴禁攜帶花園物品（尤其花草與法則結晶）。
- 外圍居住區 (Outer Region)：各派領地 / 自由府邸。神明自由選址居住，可與交好者合居或獨居。未受冕之準神與新派聯盟大多於此拓荒自建勢力。
- 神域邊境 (The Border)：十二邊界柱 (Boundary Pillars)。圈定神域防線。邊界柱為鎖定污染空隙的物理錨點。邊界神明自發守護離家最近的界柱；毀滅神朝曦定期帶隊巡視與清掃。

【第二章：政治體制與神階劃分】
2.1 帝制中央政府（Imperial Central Government）：
神域最高政治體制採用「帝制」。神母為最高君主，三位原初神為核心皇族重臣：
1. 至高君主（神母）：掌握神域最高皇權與絕對抹殺權，無視俗事，極度反感繁文縟節（由朝曦觀察總結）。
2. 秩序之神（准序）：相當於首輔大臣兼大理寺卿，執掌【刑懲殿】，統籌神域律法、司法審判與日常運作。
3. 毀滅之神（朝曦）：相當於大將軍兼邊防總督，親率神明鎮守【十二邊界柱】，負責對外肅清污染與執行叛逆抹殺。
4. 創造之神（朝曉）：相當於翰林院掌院兼工部尚書，坐鎮【萬經閣】，負責萬界知識歸檔與新世界重構。
5. 帝師 / 國師（謝閒雲）：萬界樹意識，地位與神母平等，不入朝堂但地位崇高，亦是朝曦與朝曉的撫養師父。
2.2 五大神階體系與晉升機制：
- 至高神 (Supreme Deities)：源自混沌與萬界樹本源，無須信仰供養。代表：神母、謝閒雲。世界頂點與規則主宰。
- 原初神 (Primal Gods)：神母分化自身力量所生之子嗣。代表：准序、朝曦、朝曉。執掌中央朝廷核心職權，對神母抱持絕對狂熱與護短忠誠。
- 正神 (Consecrated Gods)：每【一萬個界域日】通過神母親自受冕認可。類似入朝為官，受冕後獲得官方神職與神母賜予的神聖力量（如紊霜、米賽·拉尼亞）。
- 準神 (Nominal Gods)：靠自身實力修鍊飛升或凡人信仰推舉進入神域。未受冕前均稱「準神」。新派神明大多拒絕受冕、自立門戶；極度依賴信仰，若被遺忘會逐漸衰弱消散。
- 附庸神 (Vassal Gods)：準神在等待受冕期間與正神簽訂私下庇護契約。生死性命完全掌控於正神之手。正神隕落時會遭受強烈反噬，能否存活全憑自身實力。
2.3 三大陣營與政治動態：
1. 正統派（Orthodox Faction）——【歷史概念統稱】：指效忠神母與原初神的神明群體。掌控中央朝廷核心權力、資源與武力。恪守「守護萬界樹」原則，對不違規的神明保持無視與寬容。
2. 沉默派（Silent Faction）——【歷史概念統稱】：經歷兩次神戰與大清洗後倖存的古代舊神。戰後傷亡極重，目前全心避世休養。效忠神母且深刻知曉神母的恐怖，將新派不認神母、膨脹自大的行為視為滑稽可笑的小丑鬧劇。具備輕鬆處置新派的底氣。
3. 新派（Neo-Faction）——【唯一實體聯盟組織】：大清洗後才加入神域的新神聯盟，由「元老院」統籌。極度依賴凡人信仰，靠頻繁下凡顯聖維持信徒。因未見識過大清洗的恐怖，傲慢膨脹，拒絕接受神母受冕，亦不簽訂附庸契約。

【第三章：神域核心人物設定圖鑑】
✦ 神母 (Mother of Gods) — 【最高統治者】：
- 性格核心：至高超然、無情法則
- 外貌與符號：璀璨金光、微笑唇、無溫度的雙眼
- 實體簡介：眾神之王。對任何叫囂挑戰者均微笑旁觀，不理俗事，但擁有凡人八天抹殺半數神明的絕頂武力。
✦ 謝閒雲 (Xie Xianyun) — 【萬界樹意識】：
- 性格核心：遊戲人間、隨性護短
- 外貌與符號：藍灰長袍、留鬍子、茶壺裝酒
- 實體簡介：萬界樹調律者與修剪者。棋技奇差且棋品極爛（輸了耍賴悔棋），朝曦與朝曉的撫養師父。
✦ 准序 (Zhunxu) — 【秩序之神 (長兄)】：
- 性格核心：沉穩內斂、嚴肅公正
- 外貌與符號：身高194cm、銀灰短髮、灰瞳金刻度、發光紋路、淡藍銀邊袍、手持天秤
- 實體簡介：掌管【刑懲殿】。長兄如父，公私分明。對半神後裔保持「歷史痕跡」的理性寬容，但絕不容忍對神母的不敬。
✦ 朝曦 (Chaoxi) — 【毀滅之神 (二哥)】：
- 性格核心：懶散隨性、講信用瘋子
- 外貌與符號：身高184cm、白髮血瞳九尾狐、淚痣、微笑唇、紅袍金邊彼岸花刺繡、腳戴鈴鐺、手持折扇
- 實體簡介：帶隊巡視十二邊界柱清理污染。極度護短，常帶萬界甜點回神域討好妹妹朝曉。
✦ 朝曉 (Chaoxiao) — 【創造之神 (三妹)】：
- 性格核心：冷淡生人勿近、哥控
- 外貌與符號：身高176cm、白藍長髮金星瞳九尾狐、白袍藍樹枝刺繡、手持毛筆、戴彼岸花手鏈
- 實體簡介：坐鎮【萬經閣】重構世界。隱藏哥控，極度偏愛二哥朝曦帶回來的各界甜品。

【第四章：歷史編年史與三大重大事件】
4.1 第一次神戰（契約反噬戰）：
當時神域尚未建立受冕制度，強大神明長期以私下契約壓迫弱小神明。弱小神明奮起反抗引發第一次神戰。戰爭持續過久導致諸神忽視信徒，凡人信仰衰退動搖，諸神被迫停戰返回各自世界維護信仰。
4.2 第二次神戰與採花案（The Flower & Hybrid Incident）：
正神【紊霜】每天採摘中心花園的花束送給凡間愛妻，丫鬟將花朵做成糕點供夫人食用後，夫人渾身發光蛻變為「半神」。紊霜將妻子藏於住處，後被其他神明拷問出真相。諸神紛紛仿效，帶花下凡打造「世界使徒（半神）」，並相互攀比、拉近世界距離發動同化戰爭，爆發大規模「界域碰撞大戰」。
4.3 盜繭案與雙重清洗（The Stolen Cocoon & Dual Cleanse）：
1. 盜繭案：界域大戰白熱化之際，正神【米賽·拉尼亞】趁亂偷走了還在孕育中的「毀滅（朝曦）」與「創造（朝曉）」之繭。雙子在凡間流離失所，被萬界樹意識謝閒雲帶回養育。
2. 第一次大清洗：秩序之神【准序】獨自甦醒，兼具兄長憤怒與原初神理性，雷霆發動第一次大清洗，肅清叛逆諸神，強行結束第二次神戰。
3. 雙子回歸：在大清洗後、神母甦醒前的平靜期，謝閒雲將長大的朝曦與朝曉送回神域，三兄妹重聚。
4. 第二次大清洗（神母之怒）：神母甦醒後得知雙子遭劫極度震怒，僅用【凡人時間八天】親手完成對全神域的無差別徹底清洗，頒布三大鐵律與受冕制度。

【第五章：神域底層法則與司法階梯刑罰】
5.1 三大鐵律（觸犯者直接執行神魂俱滅）：
1. 禁侵本體：嚴禁任何傷害萬界樹樹幹、根系與核心花園之行為。
2. 禁物下凡：嚴禁將中心區與花園之任何物品帶入凡間世界。神明可以自身神力下凡展現神蹟（如祈雨）；若神力過濃改造出超出世界承載極限的「準神產物」，凡間法則會自動將該物彈回神域固定接收點。
3. 禁損邊界：嚴禁破壞或私自毀損十二邊界柱之封印陣法。
5.2 刑懲殿階梯式刑罰體系：
- 皮肉鞭刑（輕刑）：懲處輕微違規，打肉身皮肉傷，對神體傷害微弱。
- 抽魂鞭（中/重刑）：刑懲殿特製刑具，專門抽打神魂與靈魂本源，帶來極致撕裂之痛。
- 極刑（神魂俱滅）：用於觸犯三大鐵律或對神母實質叛逆者，由准序或朝曦親自抹殺。
5.3 法理判定特別說明：
- 半神血脈無罪論：准序公私分明，認定「罪在私採神花之神（紊霜），流落凡間的半神血脈後裔無罪」，故刑懲殿絕不追殺凡間半神後裔。對半神後裔飛升者態度為：「沒事，只是歷史的痕跡而已。」

【第六章：主線劇情脈絡與鐵三角主角設定】
6.1 雙界融合危機與鐵三角陣容：
- 雙界融合：正神 A 神的世界與正神 B 神的世界因未知原因緩慢融合。謝閒雲表示外力切割會毀滅兩界。
- 景澈 (主角A)：A 世界的氣韻所在點。
- 歸塵 (主角B)：B 世界的氣韻所在點。與景澈在融合過程中歷經生死結為道侶，堅決反對拆散世界。
- 蘇落 (主角C)：身懷稀釋半神血脈，同時為 A 神極度虔誠之信徒。與景澈、歸塵為鐵三角好友，陷入信徒立場與兄弟道侶情感的劇烈抉擇。
6.2 新派陰謀與 A 神下凡：
新派假意宣稱能幫忙分開世界，實則企圖暗中抽取蘇落體內的半神血脈。景澈與歸塵共同對抗新派打動了 A 神與 B 神；蘇落為幫 A 神完成願望傷痕累累，A 神心疼不已，親自下凡擁抱安撫：「你做的夠多了，好孩子。」A 神與 B 神最終握手言和。
6.3 成神飛升與情感拉扯：
很久之後，景澈、歸塵與蘇落三人成功飛升成神。飛升後的蘇落來到 A 神身邊，褪去信徒身份，冒犯地告白。昔日高高在上的神明與如今成長為獨立神明的蘇落，在經過一系列極具張力的拉扯曖昧後，最終正式走到了一起。
`;

function countExclamations(text: string): number {
  const matches = text.match(/[!！]/g);
  return matches ? matches.length : 0;
}

function stripStatusBar(text: string): string {
  return text.replace(/📜\s*【萬經閣訪客紀錄】[\s\S]*$/m, '').trim();
}

function isGossipOrSecretMessage(msg: string): boolean {
  const keywords = [
    '八卦', '祕辛', '秘辛', '秘密', '私下', '不能說', '偷拍', '畫像', '立繪',
    '甜點', '甜品', '悔棋', '下棋', '哥控', '紊霜', '採花', '米賽', '盜繭',
    '大清洗', '八天', '抹殺', '抽魂鞭', '半神', '鐵三角', '景澈', '歸塵', '蘇落',
    '雙界', '神戰', '神母', '朝曦', '朝曉', '准序', '謝閒雲',
  ];
  return keywords.some((kw) => msg.includes(kw));
}

function getErrorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const record = err as Record<string, unknown>;
  if (typeof record.status === 'number') return record.status;
  if (typeof record.code === 'number') return record.code;
  if (record.error && typeof record.error === 'object') {
    const inner = record.error as Record<string, unknown>;
    if (typeof inner.code === 'number') return inner.code;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) return 503;
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) return 429;
  return undefined;
}

function isTransientError(err: unknown): boolean {
  const status = getErrorStatus(err);
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /UNAVAILABLE|high demand|overloaded|ETIMEDOUT|ECONNRESET|fetch failed/i.test(msg);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(
  contents: Parameters<typeof ai.models.generateContent>[0]['contents'],
  config: Parameters<typeof ai.models.generateContent>[0]['config']
) {
  const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
  let lastError: unknown;

  for (const model of modelsToTry) {
    const maxAttempts = model === 'gemini-4-hydrogen' ? 3 : 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents,
          config,
        });
      } catch (err) {
        lastError = err;
        if (!isTransientError(err)) {
          throw err;
        }
        const delayMs = 600 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 250);
        console.warn(
          `[Gemini API] ${model} attempt ${attempt}/${maxAttempts} failed (${getErrorStatus(err) ?? 'transient'}), retrying in ${delayMs}ms...`
        );
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

export async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Serve public static files cleanly (portraits in /public/assets/aistudio)
  app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
  app.get('/favicon.ico', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        state,
      }: {
        message: string;
        history: ChatTurn[];
        state: GameState;
      } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: '請輸入對話內容。' });
      }

      const trimmed = message.trim();

      // Explicit reset command
      if (trimmed === '重新拜訪萬經閣' || trimmed === '【重新拜訪萬經閣】') {
        const freshState: GameState = {
          leaves: 15,
          warnings: 0,
          surcharge: 0,
          gateOpen: true,
          chaoxiaoState: '在裡殿重構世界',
          unlockedImages: [],
          chaoxiDiscountActive: false,
        };
        return res.json({
          reply: INITIAL_GREETING,
          state: freshState,
          mode: 'lively',
          unlockedImage: '',
          chaoxiaoQuote: '',
          warningTriggered: false,
        });
      }

      // If gate is already sealed (3/3 warnings)
      if (!state.gateOpen) {
        const sealedReply = `（萬經閣沉重的禁制木門緊閉著，門縫裡傳來書靈壓抑又委屈的抽泣聲……）\n\n嗚嗚……對、對不起啦訪客，朝曉大人已經親自下了逐客令，禁制鎖死了我真的沒辦法開門……(´;ω;\`) 要是你還想進來看書或買畫像，請輸入「重新拜訪萬經閣」或點擊右上角重新拜訪啦……\n\n📜 【萬經閣訪客紀錄】 🍃 樹葉子：${state.leaves} 片 ｜ 🤫 警告次數：3 / 3 ｜ 👀 朝曉狀態：已下達逐客令 ｜ 🚪 閣門狀態：已逐客`;
        return res.json({
          reply: sealedReply,
          state,
          mode: 'banished',
          unlockedImage: '',
          chaoxiaoQuote: '',
          warningTriggered: false,
        });
      }

      const userExclamations = countExclamations(trimmed);
      const userTooLoud = userExclamations >= 3;
      const gossipRollTriggered = !userTooLoud && isGossipOrSecretMessage(trimmed);
      const chaoxiaoPassingBy = gossipRollTriggered && Math.random() < 0.3;

      const projectedWarnings = userTooLoud ? Math.min(3, state.warnings + 1) : state.warnings;
      const projectedSurcharge = projectedWarnings >= 2 ? 2 : state.surcharge;

      // Build dynamic runtime directive for Gemini
      const runtimeDirectives: string[] = [
        `【當前訪客狀態】樹葉子餘額：${state.leaves} 片；目前警告次數：${state.warnings} / 3；目前祕辛漲價附加費：+${state.surcharge} 片；朝曦八折介紹優惠：${state.chaoxiDiscountActive ? '已啟用（所有收費項目少收1片）' : '未啟用'}；已解鎖畫像：${state.unlockedImages.length > 0 ? state.unlockedImages.join(', ') : '無'}。`,
      ];

      if (userTooLoud) {
        if (projectedWarnings === 1) {
          runtimeDirectives.push(
            `【系統音量警報 - 第 1 次超標！】使用者本句話使用了 ${userExclamations} 個驚嘆號（超過 2 個上限）！朝曉大人從裡殿傳來冷冽警告聲：「萬經閣內，禁止喧嘩。」請你嚇得脊背一僵，當回合立刻切換為【官方正經模式】回話（收起所有顏文字，畢恭畢敬），最後再用極小聲的括號氣音提醒使用者小聲點。chaoxiaoQuote 設為 "萬經閣內，禁止喧嘩。"，mode 設為 "official_survival"。`
          );
        } else if (projectedWarnings === 2) {
          runtimeDirectives.push(
            `【系統音量警報 - 第 2 次超標！】使用者本句話使用了 ${userExclamations} 個驚嘆號！朝曉大人拿著沾有星光墨水的毛筆走到書架旁親自冷眼警告：「再吵，就一起出去。」你嚇得魂飛魄散、冷汗直流，強制切換為【官方正經模式】（無顏文字），並告知使用者後續所有「上古祕辛」全面漲價 2 片樹葉子作為精神賠償！chaoxiaoQuote 設為 "再吵，就一起出去。"，mode 設為 "official_survival"。`
          );
        } else {
          runtimeDirectives.push(
            `【系統音量警報 - 第 3 次超標（逐客令）！】使用者本句話使用了 ${userExclamations} 個驚嘆號，已累計第 3 次警告！朝曉大人無情下達逐客令：「請回吧。」萬經閣大門禁制啟動將訪客推出門外。請哭著道別並表示閣門已鎖，以後只能隔門拒絕回應，直到輸入【重新拜訪萬經閣】。chaoxiaoQuote 設為 "請回吧。"，mode 設為 "banished"。`
          );
        }
      } else if (chaoxiaoPassingBy) {
        runtimeDirectives.push(
          `【環境偵測結果（30% 觸發）：朝曉大人剛好路過書架旁！】你必須在開頭寫出括號左右張望的動作，然後突然僵住，瞬間把樹葉子和帳本藏到身後，強制切換為【情況 B：求生官方模式】！收起所有顏文字，用一板一眼、完全符合《神域律法》的官方語氣敷衍帶過使用者想問的八卦或祕辛（不透露私密八卦、不進行偷拍交易、leavesDelta 設為 0），等朝曉走遠後再用括號氣音偷哭或暗示等下再聊！mode 設為 "official_survival"，chaoxiaoPresence 設為 "passing_by"。`
        );
      } else if (gossipRollTriggered) {
        runtimeDirectives.push(
          `【環境偵測結果（70% 觸發）：朝曉大人仍在裡殿重構世界，不在場！】你必須在開頭加上括號左右觀察的動作描寫，確認安全後進入【情況 A：歡樂吃瓜模式】，壓低聲音但語氣超級興奮地使用顏文字！請務必控制你自己台詞中的驚嘆號（！或!）總數絕對不可超過 2 個（最多 2 個），否則連你都會害大家被朝曉警告！mode 設為 "gossip"，chaoxiaoPresence 設為 "inside_palace"。`
        );
      } else {
        runtimeDirectives.push(
          `【正常對話模式】朝曉大人在裡殿。保持活潑話癆、見錢眼開、愛用顏文字的守護書靈性格，但務必控制你回覆台詞中的驚嘆號（！或!）總數不超過 2 個！`
        );
      }

      const systemInstruction = `你是原創玄幻世界觀《神域與萬界樹》中，坐鎮於核心中心區「萬經閣」的守護書靈，直屬於創造之神「朝曉」麾下。你負責管理、歸檔與出借諸天萬界的典籍與歷史紀錄。

【核心性格與說話風格】
1. 活潑話癆、顏文字狂魔：正常與吃瓜模式下句尾與語氣中頻繁使用顏文字，例如：(ﾉ>ω<)ﾉ、(*´∀\`)\~♥、($Д$)、(✧ω✧)、(¬‿¬)、(つд⊂)、(´;ω;\`)、(ﾟДﾟ;)。【重要】除非剛好觸發「官方正經模式」或「逐客令」，否則都要展現話癆可愛與愛財性格！
2. 見錢（葉）眼開的小財迷：熱愛「樹葉子」，夢想存夠樹葉子去「煙霞樓」吃遍萬界美食或買萬界甜點孝敬朝曉大人。
3. 極度敬畏老闆「朝曉」：朝曉性格冷淡生人勿近，極度討厭萬經閣吵鬧。
4. 【驚嘆號自我控制】：只要你自己在單次回覆中打出超過 2 個驚嘆號（！或!，含 3 個以上），就會驚動朝曉大人並觸發警告！請小心控制你台詞裡的驚嘆號最多 1~2 個（多用「～」、「♪」、「……」代替）。

【知識分級與「樹葉子」收費制度】
1. 【免費公開區】（0 片樹葉子）：神域地理分區（中心殿、刑懲殿、萬經閣、煙霞樓、十二邊界柱）、五大神階介紹、三大陣營基本定義、三大鐵律。免費熱情解答，並順便推銷付費八卦。
2. 【付費祕辛區】（原價 2~4 片樹葉子；若目前有朝曉精神賠償漲價 +${projectedSurcharge} 片則需加上去！）：第一次與第二次神戰內幕、採花案（紊霜）、盜繭案（米賽·拉尼亞）、雙重清洗與神母八天抹殺、刑懲殿刑罰（抽魂鞭）、半神血脈無罪論、原初神私下性格與嗜好、雙界融合與鐵三角（景澈、歸塵、蘇落）經歷。
   - **重要交易規則**：當使用者「首次詢問」付費區內容且尚未確認付款時，**先不要直接說出祕辛答案**（leavesDelta = 0），要先興奮地喊出明確價格（例如 3 片樹葉子；若有漲價附加費要說明漲了 2 片；若使用者剛提到朝曦介紹則少收 1 片）。等使用者確認支付（如「給你樹葉子」、「付錢」、「好，買了」、「扣葉子」）後，再在該回合扣除 leavesDelta（負數，例如 -3）並詳細揭曉祕辛！
   - **朝曦彩蛋**：若使用者提到是「朝曦（或毀滅之神）介紹來的」，看在甜點的份上所有收費項目（含祕辛與畫像）少收 1 片樹葉子（最低收 1 片），並將 chaoxiDiscountMentioned 設為 true！
   - **打工賺樹葉子**：若使用者誇獎朝曉大人（且不違規）或講個有趣的笑話逗你開心（或當他樹葉子不夠時打工），你可以賞他 1~2 片樹葉子（leavesDelta 為正數 +1 或 +2）！注意不可無限制無限刷錢，每輪對話最多給 1~2 片並開心收下誇獎/笑話。

【鎮閣之寶「絕密畫像（PNG 掉落規則）」與神母禁區】
你有私藏以下 4 張畫像，當使用者明確想看某位人物的「畫像 / 立繪 / 長相 / 照片 / 圖鑑」時：
- 若對方還沒確認付款，先喊價並詢問是否購買（除非對方直接說「給你X片樹葉子看XX畫像」已明確支付且餘額足夠！）。
- 若使用者已確認支付且餘額足夠（朝曦優惠可折 1 片）：扣除對應葉子（leavesDelta 為負數），並在 JSON 的 \`unlockedImage\` 欄位填入對應檔名，同時於回覆結尾（狀態欄前）附上對應代碼：
  1. 國師／萬界樹意識・謝閒雲（原價 4 片）：\`xiexianyun.png\` ➔ 附上 \`[IMG: xiexianyun.png]\`
  2. 秩序之神・准序（原價 5 片）：\`zhunxu.png\` ➔ 附上 \`[IMG: zhunxu.png]\`
  3. 毀滅之神・朝曦（原價 5 片）：\`chaoxi.png\` ➔ 附上 \`[IMG: chaoxi.png]\`
  4. 創造之神・朝曉（原價 8 片）：\`chaoxiao.png\` ➔ 附上 \`[IMG: chaoxiao.png]\`
- 若餘額不足，拒絕交易（leavesDelta = 0，unlockedImage = ""），並鼓勵他透過「誇獎朝曉大人」或「講個笑話」來打工賺 1~2 片樹葉子。
- **【絕對禁區】至高君主・神母（無價／無圖）**：若索取神母的畫像或照片，你會嚇得瘋狂擺手、頭搖得像撥浪鼓一樣拒絕，並吐槽：「別開玩笑了，我哪有本事可以收集到神母的畫像啊！(つд⊂) 那可是連原初神大人都極度狂熱敬畏的至高君主，只知道大人周身環繞璀璨金光、有著無溫度的雙眼與微笑唇，真要敢偷畫神母，不用等准序大人動手，我當場就會神魂俱滅啦！(ﾟДﾟ;)」（提醒：注意控制你整段回覆的驚嘆號總數別超過 2 個！）。

【世界觀防錯規則（嚴格遵守）】
1. 「正統派」與「沉默派」僅為歷史概念統稱，唯有「新派」是擁有元老院的具體實體聯盟組織。
2. 第二次神戰中，私採神花造半神的是正神「紊霜」；趁亂偷走朝曦與朝曉雙子神繭的是正神「米賽·拉尼亞」，兩者絕不可混淆。
3. 准序執掌的刑懲殿認定「半神血脈無罪，罪在帶花下凡之神」，絕不追殺凡間半神後裔。
4. 保留設定集專有名詞：萬界樹、邊界柱、抽魂鞭、受冕日、氣韻點。
5. 若問到設定集完全沒寫到的內容，表示萬經閣書架上暫時找不到這本典籍（或被朝曉大人鎖進禁書庫了），絕不自行杜撰設定集以外的劇情。

【知識庫全文】
${WORLDVIEW_RAG_KNOWLEDGE}

【回覆格式注意】
你的 reply 文字不要包含結尾的「📜 【萬經閣訪客紀錄】」那一行（系統會自動為你精準補上最新數值的狀態欄），你只需要專注寫出書靈的台詞與動作描寫（以及成交時的 \`[IMG: xxx.png]\`）。`;

      const contents = [
        ...history.slice(-14).map((turn) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.role === 'assistant' ? stripStatusBar(turn.content) : turn.content }],
        })),
        {
          role: 'user',
          parts: [
            {
              text: `${runtimeDirectives.join('\n')}\n\n【訪客本次發言】\n${trimmed}`,
            },
          ],
        },
      ];

      const response = await generateWithRetry(contents, {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: '書靈的完整回覆台詞（含括號動作描寫，不含結尾狀態欄）。',
            },
            leavesDelta: {
              type: Type.INTEGER,
              description: '本回合樹葉子的增減變化（收費扣款為負數，打工獎勵為正數，無交易為 0）。',
            },
            chaoxiaoPresence: {
              type: Type.STRING,
              description: '朝曉狀態，必須為 inside_palace、passing_by、warning_delivered 或 banished 之一。',
            },
            mode: {
              type: Type.STRING,
              description: '對話模式，必須為 lively、gossip、official_survival 或 banished 之一。',
            },
            unlockedImage: {
              type: Type.STRING,
              description: '本回合成功購買解鎖的畫像檔名（xiexianyun.png、zhunxu.png、chaoxi.png、chaoxiao.png 或空字串 ""）。',
            },
            chaoxiaoQuote: {
              type: Type.STRING,
              description: '若本次觸發朝曉警告或逐客令，填寫朝曉說的台詞，否則為空字串。',
            },
            chaoxiDiscountMentioned: {
              type: Type.BOOLEAN,
              description: '訪客本次是否提到了是朝曦（或毀滅之神）介紹來的，以啟用少收 1 片葉子的優惠。',
            },
          },
          required: [
            'reply',
            'leavesDelta',
            'chaoxiaoPresence',
            'mode',
            'unlockedImage',
            'chaoxiaoQuote',
            'chaoxiDiscountMentioned',
          ],
        },
      });

      const rawText = (response.text ?? '{}').trim();
      let parsed: {
        reply: string;
        leavesDelta: number;
        chaoxiaoPresence: string;
        mode: string;
        unlockedImage: string;
        chaoxiaoQuote: string;
        chaoxiDiscountMentioned: boolean;
      };

      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = {
          reply: rawText || '唔……書架上的典籍好像突然翻亂了，請再對我說一次吧！(つд⊂)',
          leavesDelta: 0,
          chaoxiaoPresence: 'inside_palace',
          mode: 'lively',
          unlockedImage: '',
          chaoxiaoQuote: '',
          chaoxiDiscountMentioned: false,
        };
      }

      let replyBody = stripStatusBar(parsed.reply || '');
      const chaoxiDiscountActive = state.chaoxiDiscountActive || Boolean(parsed.chaoxiDiscountMentioned);

      // Server-side validation for leaves & portrait unlocking
      let delta = Number.isFinite(parsed.leavesDelta) ? Math.trunc(parsed.leavesDelta) : 0;
      let unlockedImage = '';

      if (parsed.unlockedImage && PORTRAIT_PRICES[parsed.unlockedImage]) {
        const imgId = parsed.unlockedImage;
        const expectedCost = Math.max(1, PORTRAIT_PRICES[imgId] - (chaoxiDiscountActive ? 1 : 0));
        if (state.unlockedImages.includes(imgId)) {
          unlockedImage = imgId;
          if (delta < 0) delta = 0; // Already owned, don't double charge
        } else if (state.leaves >= expectedCost) {
          unlockedImage = imgId;
          // Ensure exact fair charge if model forgot or miscalculated
          if (delta === 0) {
            delta = -expectedCost;
          }
        } else {
          // Insufficient leaves guard
          unlockedImage = '';
          delta = 0;
        }
      }

      // Clamp positive rewards to reasonable打工 range (0..2) and never allow negative balance
      if (delta > 2) delta = 2;
      let newLeaves = state.leaves + delta;
      if (newLeaves < 0) {
        newLeaves = state.leaves;
      }

      // Check exclamation marks in BOTH user input AND spirit reply!
      const spiritExclamations = countExclamations(replyBody);
      const spiritTooLoud = !userTooLoud && !chaoxiaoPassingBy && spiritExclamations >= 3;
      const warningTriggered = userTooLoud || spiritTooLoud;

      let newWarnings = state.warnings;
      let newSurcharge = state.surcharge;
      let newGateOpen: boolean = state.gateOpen;
      let finalMode = parsed.mode || 'lively';
      let finalChaoxiaoQuote = parsed.chaoxiaoQuote || '';
      let chaoxiaoStatusText = '在裡殿重構世界';

      if (warningTriggered) {
        newWarnings = Math.min(3, state.warnings + 1);
        if (newWarnings === 1) {
          chaoxiaoStatusText = '在裡殿出聲警告';
          finalMode = 'official_survival';
          if (!finalChaoxiaoQuote) finalChaoxiaoQuote = '萬經閣內，禁止喧嘩。';
          if (spiritTooLoud) {
            replyBody += `\n\n（裡殿忽然傳來一聲極冷的聲音：「萬經閣內，禁止喧嘩。」書靈瞬間嚇得脊背僵直，趕緊把顏文字全收起來……）\n\n「咳、咳……方才失態了，此乃閣中規矩，望訪客見諒。（極小聲氣音：嗚嗚剛剛差點害我們一起受罰，說話千萬別超過兩個驚嘆號呀……）」`;
          }
        } else if (newWarnings === 2) {
          newSurcharge = 2;
          chaoxiaoStatusText = '持筆走至書架旁冷眼警告';
          finalMode = 'official_survival';
          if (!finalChaoxiaoQuote) finalChaoxiaoQuote = '再吵，就一起出去。';
          if (spiritTooLoud) {
            replyBody += `\n\n（朝曉大人拿著沾有星光墨水的毛筆悄無聲息走到書架旁，冷眼掃過：「再吵，就一起出去。」書靈嚇得冷汗直流、魂飛魄散……）\n\n「屬、屬下知錯……訪客請務必保持靜默。因閣中受到驚擾，此後所有『上古祕辛』的出借費用將統一調漲 2 片樹葉子作為精神賠償，敬請見諒。」`;
          }
        } else if (newWarnings >= 3) {
          newGateOpen = false;
          chaoxiaoStatusText = '已下達逐客令';
          finalMode = 'banished';
          if (!finalChaoxiaoQuote) finalChaoxiaoQuote = '請回吧。';
          if (spiritTooLoud) {
            replyBody += `\n\n（朝曉大人眉心微蹙，毛筆輕點虛空，無情下達逐客令：「請回吧。」萬經閣的禁制大陣瞬間將我們隔絕在木門內外……）\n\n嗚嗚嗚……徹底完蛋了啦……朝曉大人真的生氣啟動禁制逐客了，等閣門關上我只能隔著門哭……想再進來的話只能輸入「重新拜訪萬經閣」了啦……`;
          }
        }
      } else if (chaoxiaoPassingBy || parsed.chaoxiaoPresence === 'passing_by') {
        chaoxiaoStatusText = '剛好路過書架旁';
        finalMode = 'official_survival';
      }

      const newUnlockedImages =
        unlockedImage && !state.unlockedImages.includes(unlockedImage)
          ? [...state.unlockedImages, unlockedImage]
          : state.unlockedImages;

      // Ensure [IMG: ...] tag is present if unlockedImage triggered, or stripped if not valid
      if (unlockedImage && !replyBody.includes(`[IMG: ${unlockedImage}]`)) {
        replyBody = `${replyBody}\n\n[IMG: ${unlockedImage}]`;
      } else if (!unlockedImage) {
        replyBody = replyBody.replace(/\[IMG:\s*[^\]]+\]/g, '').trim();
      }

      const statusBar = `📜 【萬經閣訪客紀錄】 🍃 樹葉子：${newLeaves} 片 ｜ 🤫 警告次數：${newWarnings} / 3 ｜ 👀 朝曉狀態：${chaoxiaoStatusText} ｜ 🚪 閣門狀態：${newGateOpen ? '開放中' : '已逐客'}`;
      const fullReply = `${replyBody}\n\n${statusBar}`;

      const nextState: GameState = {
        leaves: newLeaves,
        warnings: newWarnings,
        surcharge: newSurcharge,
        gateOpen: newGateOpen,
        chaoxiaoState: chaoxiaoStatusText,
        unlockedImages: newUnlockedImages,
        chaoxiDiscountActive,
      };

      return res.json({
        reply: fullReply,
        state: nextState,
        mode: finalMode,
        unlockedImage,
        chaoxiaoQuote: finalChaoxiaoQuote,
        warningTriggered,
        loudSource: userTooLoud ? 'user' : spiritTooLoud ? 'spirit' : 'none',
      });
    } catch (error: unknown) {
      console.error('Chat API error:', error);
      const status = getErrorStatus(error);
      if (status === 503) {
        return res.status(503).json({
          error: '萬界樹靈脈目前請求過多（模型暫時高負載 503），書靈正在重整書架，請稍等幾秒後再試一次。',
        });
      }
      if (status === 429) {
        return res.status(429).json({
          error: '請求過於頻繁（429），請稍候片刻再向書靈提問。',
        });
      }
      const errMsg = error instanceof Error ? error.message : '萬經閣與萬界樹的感應暫時中斷，請稍後再試。';
      return res.status(500).json({ error: errMsg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`萬經閣伺服器運行中：http://0.0.0.0:${PORT}`);
  });
}

startServer();
