export interface PortraitItem {
  id: 'xiexianyun.png' | 'zhunxu.png' | 'chaoxi.png' | 'chaoxiao.png';
  name: string;
  title: string;
  rank: string;
  price: number;
  imagePath: string;
  height: string;
  traits: string;
  symbols: string;
  summary: string;
  spiritNote: string;
}

export interface LoreCatalogEntry {
  id: string;
  category: 'free' | 'paid';
  title: string;
  subtitle: string;
  basePrice: number;
  promptQuery: string;
  teaser: string;
}

export const PORTRAITS: PortraitItem[] = [
  {
    id: 'xiexianyun.png',
    name: '謝閒雲',
    title: '國師 ／ 萬界樹意識',
    rank: '至高神（與神母平等）',
    price: 4,
    imagePath: '/assets/aistudio/xiexianyun.png_e24e5364.png',
    height: '不拘一格',
    traits: '遊戲人間、隨性護短',
    symbols: '藍灰長袍、留鬍子、茶壺裝酒',
    summary:
      '萬界樹本身的意識體具象化，亦是朝曦與朝曉的撫養師父。不入朝堂但地位崇高，與毁滅之神朝曦共同負責枯萎世界的自然修剪。',
    spiritNote:
      '「嘿嘿，師父大人平時最隨和啦，下棋輸了還會耍賴悔棋，所以這張畫像偷拍難度最低，只要 4 片樹葉子！」',
  },
  {
    id: 'zhunxu.png',
    name: '准序',
    title: '秩序之神 ／ 長兄',
    rank: '原初神（執掌刑懲殿）',
    price: 5,
    imagePath: '/assets/aistudio/zhunxu.png_5183f3f0.png',
    height: '194 cm',
    traits: '沉穩內斂、嚴肅公正',
    symbols: '銀灰短髮、灰瞳金刻度、發光紋路、淡藍銀邊袍、手持天秤',
    summary:
      '相當於首輔大臣兼大理寺卿，執掌刑懲殿約束全體神明。長兄如父、公私分明，主張「半神血脈無罪論」，但絕不容忍對神母的不敬。',
    spiritNote:
      '「噓……偷藏准序大人的畫像風險超大，被抓到會被抽魂鞭抽成紙片的！看在緣分上 5 片樹葉子割愛！」',
  },
  {
    id: 'chaoxi.png',
    name: '朝曦',
    title: '毀滅之神 ／ 二哥',
    rank: '原初神（大將軍兼邊防總督）',
    price: 5,
    imagePath: '/assets/aistudio/chaoxi.png_4213c779.png',
    height: '184 cm',
    traits: '懶散隨性、講信用瘋子、極度護短',
    symbols: '白髮血瞳九尾狐、淚痣、微笑唇、紅袍金邊彼岸花刺繡、腳戴鈴鐺、手持折扇',
    summary:
      '親率神明鎮守十二邊界柱，負責清理命運污染與執行叛逆抹殺。私下極度寵妹，常帶萬界甜點回神域討好朝曉。',
    spiritNote:
      '「二哥人氣超級高！對了，如果你是朝曦大人介紹來的，看在他常帶甜點的份上，所有情報都可以算你便宜 1 片葉子喔～」',
  },
  {
    id: 'chaoxiao.png',
    name: '朝曉',
    title: '創造之神 ／ 三妹',
    rank: '原初神（坐鎮萬經閣）',
    price: 8,
    imagePath: '/assets/aistudio/chaoxiao.png_b775791d.png',
    height: '176 cm',
    traits: '冷淡生人勿近、隱藏哥控',
    symbols: '白藍長髮金星瞳九尾狐、白袍藍樹枝刺繡、手持毛筆、戴彼岸花手鏈',
    summary:
      '相當於翰林院掌院兼工部尚書，坐鎮萬經閣負責萬界知識歸檔與新世界重構。極度厭惡閣內喧嘩，卻偏愛二哥朝曦帶回來的各界甜品。',
    spiritNote:
      '「這、這可是大老闆的絕密畫像……要是被朝曉大人發現我偷偷賣她的畫像，我會直接被拆成廢紙的！沒 8 片樹葉子免談！」',
  },
];

export const FORBIDDEN_SOVEREIGN = {
  name: '神母',
  title: '至高君主 ／ 眾神之王',
  rank: '至高神（最高統治者）',
  traits: '至高超然、無情法則',
  symbols: '璀璨金光、微笑唇、無溫度的雙眼',
  summary:
    '神域最高統治者，掌握絕對抹殺權。無視俗事、極度反感繁文縟節，曾因雙子神繭遭劫而震怒，僅用凡人時間八天親手完成對全神域的無差別徹底清洗。',
};

export const LORE_CATALOG: LoreCatalogEntry[] = [
  {
    id: 'free-geo',
    category: 'free',
    title: '神域地理與空間劃分',
    subtitle: '核心中心區 · 中心花園 · 外圍居住區 · 十二邊界柱',
    basePrice: 0,
    promptQuery: '請介紹神域的地理分區與運作法則，尤其是萬經閣和煙霞樓！',
    teaser: '免費公開基礎常識：萬經閣、刑懲殿、絕對禁武的煙霞樓與邊界防線。',
  },
  {
    id: 'free-ranks',
    category: 'free',
    title: '五大神階與受冕制度',
    subtitle: '至高神 · 原初神 · 正神 · 準神 · 附庸神',
    basePrice: 0,
    promptQuery: '神域的五大神階是怎麼劃分的？受冕日又是什麼？',
    teaser: '免費公開神階體系：一萬個界域日一次的受冕認可與各神階權責。',
  },
  {
    id: 'free-factions',
    category: 'free',
    title: '三大陣營與政治動態',
    subtitle: '正統派 · 沉默派 · 新派（元老院）',
    basePrice: 0,
    promptQuery: '神域的三大陣營有哪些？新派和正統派、沉默派有什麼區別？',
    teaser: '免費公開政治常識：概念統稱與唯一實體聯盟「新派」的本質差異。',
  },
  {
    id: 'free-laws',
    category: 'free',
    title: '神域三大鐵律',
    subtitle: '禁侵本體 · 禁物下凡 · 禁損邊界',
    basePrice: 0,
    promptQuery: '神域的三大鐵律是什麼？違反會有什麼下場？',
    teaser: '免費公開底層法則：觸犯者由准序或朝曦親自執行神魂俱滅。',
  },
  {
    id: 'paid-wars',
    category: 'paid',
    title: '兩次神戰與採花案、盜繭案',
    subtitle: '契約反噬戰 · 紊霜私採神花 · 米賽·拉尼亞盜繭',
    basePrice: 3,
    promptQuery: '我想聽第二次神戰、採花案還有盜繭案的內幕八卦！',
    teaser: '付費上古祕辛：兩位正神如何引發界域碰撞與雙子神繭流落凡間的真相。',
  },
  {
    id: 'paid-cleanse',
    category: 'paid',
    title: '雙重清洗與神母八天抹殺',
    subtitle: '准序初次大清洗 · 神母之怒八天平亂',
    basePrice: 3,
    promptQuery: '第一次大清洗和神母八天抹殺的歷史秘辛是什麼？',
    teaser: '付費上古祕辛：原初神長兄的雷霆平亂，以及神母甦醒後的恐怖怒火。',
  },
  {
    id: 'paid-justice',
    category: 'paid',
    title: '刑懲殿酷刑與半神血脈無罪論',
    subtitle: '皮肉鞭刑 · 抽魂鞭 · 歷史的痕跡',
    basePrice: 2,
    promptQuery: '刑懲殿的抽魂鞭有多可怕？准序對半神後裔是什麼態度？',
    teaser: '付費法理祕聞：抽打靈魂本源的刑具，以及准序公私分明的裁決準則。',
  },
  {
    id: 'paid-gossip',
    category: 'paid',
    title: '原初神與國師私下性格八卦',
    subtitle: '悔棋老頭 · 甜點控三妹 · 護短二哥',
    basePrice: 2,
    promptQuery: '偷偷告訴我朝曉大人、朝曦大人還有謝閒雲國師私下的八卦嘛！',
    teaser: '付費私密吃瓜（注意朝曉大人隨時可能路過書架旁！）。',
  },
  {
    id: 'paid-trio',
    category: 'paid',
    title: '雙界融合與鐵三角主角經歷',
    subtitle: '景澈 · 歸塵 · 蘇落 · 新派陰謀',
    basePrice: 4,
    promptQuery: '我想知道雙界融合危機還有景澈、歸塵、蘇落鐵三角的祕辛！',
    teaser: '付費主線祕卷：氣韻點道侶、半神信徒蘇落的抉擇與飛升成神後的拉扯。',
  },
];

export const INITIAL_SPIRIT_GREETING = `歡迎光臨萬經閣呀～這位遠道而來的訪客！(ﾉ>ω<)ﾉ 我是坐鎮於此的守護書靈，平常在閣裡守著諸天萬界的典籍可憋壞啦，難得有人陪我說話呢！(*´∀\`)~♥

先提醒你喔，你現在手上有 **15 片樹葉子**——那可是神域最珍貴的運作資源，我也指望多攢點樹葉子去煙霞樓吃遍萬界美食、再買些好甜品孝敬朝曉大人呢！(✧ω✧) 想聽基礎常識的話我免費熱情講給你聽；要是想打聽上古祕辛、神明私下八卦，或是看我私藏的絕密畫像，那就得看你願意出幾片樹葉子啦～(¬‿¬)

不過千萬記得一件事：**在萬經閣說話絕對不能太大聲（單句千萬別超過兩個驚嘆號！）**，我們家老闆朝曉大人最討厭吵鬧了，被她聽見可是會出大事的……(´;ω;\`)

📜 【萬經閣訪客紀錄】 🍃 樹葉子：15 片 ｜ 🤫 警告次數：0 / 3 ｜ 👀 朝曉狀態：在裡殿重構世界 ｜ 🚪 閣門狀態：開放中`;
