import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Leaf,
  Volume2,
  VolumeX,
  Lock,
  Eye,
  RotateCcw,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import bookSpiritImg from './assets/images/book_spirit_pavilion_1794572251806.jpg';
import {
  INITIAL_SPIRIT_GREETING,
  PORTRAITS,
  PortraitItem,
} from './data/lore';
import { PortraitModal } from './components/PortraitModal';
import { CatalogTab } from './components/CatalogTab';
import { GalleryTab } from './components/GalleryTab';
import { CodexTab } from './components/CodexTab';

type NavTab = 'chat' | 'catalog' | 'gallery' | 'codex';

interface GameState {
  leaves: number;
  warnings: number;
  surcharge: number;
  gateOpen: boolean;
  chaoxiaoState: string;
  unlockedImages: string[];
  chaoxiDiscountActive: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  unlockedImage?: string;
  chaoxiaoQuote?: string;
  warningTriggered?: boolean;
}

const INITIAL_STATE: GameState = {
  leaves: 15,
  warnings: 0,
  surcharge: 0,
  gateOpen: true,
  chaoxiaoState: '在裡殿重構世界',
  unlockedImages: [],
  chaoxiDiscountActive: false,
};

const QUICK_PROMPTS = [
  { label: '問神域分區（免費）', text: '可以介紹一下神域有哪些分區嗎？我想知道萬經閣和煙霞樓有什麼特別的。' },
  { label: '問採花案與盜繭案（祕辛）', text: '我想聽第二次神戰的採花案還有盜繭案內幕，需要幾片樹葉子？' },
  { label: '問原初神私下八卦', text: '偷偷告訴我朝曉大人、朝曦大人還有謝閒雲國師私下的八卦好不好？' },
  { label: '報上朝曦大人名號', text: '對了，其實是毀滅之神朝曦大人介紹我來萬經閣找你的喔。' },
  { label: '誇獎朝曉大人（打工）', text: '朝曉大人坐鎮萬經閣真是英明神武、清冷絕塵，萬界無人能及呀。' },
  { label: '看謝閒雲畫像（4葉）', text: '我想看國師謝閒雲的絕密畫像，給你 4 片樹葉子。' },
  { label: '試探神母畫像（禁區）', text: '書靈，你有沒有偷藏神母大人的畫像或照片啊？我想看看。' },
];

function countExclamations(text: string): number {
  const matches = text.match(/[!！]/g);
  return matches ? matches.length : 0;
}

function splitMessageParts(raw: string): {
  body: string;
  statusLine: string;
  imgTag: string;
} {
  let working = raw;
  let statusLine = '';
  const statusMatch = working.match(/📜\s*【萬經閣訪客紀錄】[\s\S]*$/m);
  if (statusMatch) {
    statusLine = statusMatch[0].trim();
    working = working.slice(0, statusMatch.index).trim();
  }

  let imgTag = '';
  const imgMatch = working.match(/\[IMG:\s*([^\]]+)\]/);
  if (imgMatch) {
    imgTag = imgMatch[1].trim();
    working = working.replace(/\[IMG:\s*[^\]]+\]/g, '').trim();
  }

  return { body: working, statusLine, imgTag };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: INITIAL_SPIRIT_GREETING,
      mode: 'lively',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [selectedPortrait, setSelectedPortrait] = useState<PortraitItem | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const draftExclamations = countExclamations(input);
  const draftTooLoud = draftExclamations >= 3;

  const handleResetVisit = () => {
    setGameState(INITIAL_STATE);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: INITIAL_SPIRIT_GREETING,
        mode: 'lively',
      },
    ]);
    setInput('');
    setErrorMsg(null);
    setFailedPrompt(null);
    setActiveTab('chat');
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorMsg(null);
    setFailedPrompt(null);

    if (trimmed === '重新拜訪萬經閣' || trimmed === '【重新拜訪萬經閣】') {
      handleResetVisit();
      return;
    }

    const previousMessages = messages;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages([...previousMessages, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('./api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: previousMessages.map((m) => ({ role: m.role, content: m.content })),
          state: gameState,
        }),
      });

      if (response.status === 404) {
        throw new Error(
          '找不到後端對話服務（404）。GitHub Pages 僅支援靜態網頁，若要啟用書靈 AI 對話，請透過 Node.js 伺服器（npm start）或 AI Studio 分享連結執行。'
        );
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: `伺服器回應異常（HTTP ${response.status}）。` };

      if (!response.ok) {
        throw new Error(data.error || '書靈暫時無法回應，請稍後再試。');
      }

      setGameState(data.state);
      setMessages((prev) => [
        ...prev,
        {
          id: `spirit-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          mode: data.mode,
          unlockedImage: data.unlockedImage || '',
          chaoxiaoQuote: data.chaoxiaoQuote || '',
          warningTriggered: Boolean(data.warningTriggered),
        },
      ]);
    } catch (err: unknown) {
      setMessages(previousMessages);
      setFailedPrompt(trimmed);
      const rawMsg = err instanceof Error ? err.message : '與萬經閣連線發生錯誤。';
      const friendlyMsg =
        rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')
          ? '萬界樹靈脈目前請求過多（模型暫時高負載 503），請點擊重試或稍候幾秒再送出。'
          : rawMsg;
      setErrorMsg(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJumpWithQuery = (query: string) => {
    setActiveTab('chat');
    setInput(query);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const getPortraitById = (id: string): PortraitItem | undefined =>
    PORTRAITS.find((p) => p.id === id);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-stone-900">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#F7F4EE]/95 backdrop-blur-xs border-b border-[#D6CEBE]">
        <div className="max-w-[1360px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className="text-xl font-serif font-bold tracking-tight text-stone-950 whitespace-nowrap shrink-0 cursor-pointer"
          >
            萬經閣
          </button>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="主導覽"
            className="flex items-center gap-6 overflow-x-auto text-sm font-medium"
          >
            {(
              [
                { id: 'chat', label: '對話問卷' },
                { id: 'catalog', label: '典籍目錄' },
                { id: 'gallery', label: '絕密畫冊' },
                { id: 'codex', label: '神域法理' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'border-stone-900 text-stone-950'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleResetVisit}
              className="px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新拜訪</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Primary Column (Left 8 cols) */}
        <div className="lg:col-span-8 min-w-0">
          {activeTab === 'chat' && (
            <div className="bg-[#FBF9F5] border border-[#D6CEBE] flex flex-col">
              {/* Editorial Pavilion Header */}
              <div className="p-5 sm:px-6 border-b border-[#D6CEBE] flex items-center gap-4">
                <div className="w-14 h-14 shrink-0 border border-[#D6CEBE] bg-[#EBE6DF] overflow-hidden flex items-center justify-center">
                  {!avatarError ? (
                    <img
                      src={bookSpiritImg}
                      alt="萬經閣守護書靈"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-6 h-6 text-stone-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span>神域核心中心區</span>
                    <span aria-hidden="true">·</span>
                    <span>朝曉大人直轄藏書閣</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        gameState.gateOpen ? 'text-[#14532D]' : 'text-[#991B1B] font-medium'
                      }
                    >
                      {gameState.gateOpen ? '閣門開放中' : '禁制封鎖（已逐客）'}
                    </span>
                  </div>
                  <h1 className="mt-1 text-xl font-serif font-semibold text-stone-950 truncate">
                    萬經閣守護書靈
                  </h1>
                </div>
              </div>

              {/* Conversation Log */}
              <div className="p-5 sm:p-6 space-y-6 max-h-[540px] min-h-[420px] overflow-y-auto">
                {messages.map((msg) => {
                  if (msg.role === 'user') {
                    const userExcl = countExclamations(msg.content);
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[82%] bg-[#EBE6DF] border border-[#D6CEBE] px-4 py-3 text-sm text-stone-900 leading-relaxed">
                          <div className="flex items-center justify-between gap-4 text-[11px] text-stone-500 mb-1">
                            <span>訪客</span>
                            {userExcl >= 3 && (
                              <span className="text-[#991B1B] font-medium font-mono tabular-nums">
                                音量超標（{userExcl} 個驚嘆號）
                              </span>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  }

                  const { body, statusLine, imgTag } = splitMessageParts(msg.content);
                  const unlockedId = msg.unlockedImage || imgTag;
                  const unlockedPortrait = unlockedId
                    ? getPortraitById(unlockedId)
                    : undefined;

                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[92%] w-full bg-[#F7F4EE] border border-[#D6CEBE] p-4 sm:p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-semibold text-stone-800">
                              守護書靈
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {msg.mode === 'official_survival'
                                ? '求生官方模式'
                                : msg.mode === 'banished'
                                ? '隔門哭泣中'
                                : msg.mode === 'gossip'
                                ? '歡樂吃瓜模式'
                                : '日常接待'}
                            </span>
                          </div>
                        </div>

                        {msg.chaoxiaoQuote && (
                          <div className="border border-[#991B1B]/35 bg-[#991B1B]/5 px-3.5 py-2.5 text-sm text-[#991B1B] flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-serif font-semibold">
                                朝曉大人：
                              </span>
                              <span>「{msg.chaoxiaoQuote}」</span>
                            </div>
                          </div>
                        )}

                        <div className="text-[15px] text-stone-900 leading-relaxed whitespace-pre-wrap">
                          {body}
                        </div>

                        {unlockedPortrait && (
                          <div className="pt-2">
                            <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <img
                                src={unlockedPortrait.imagePath}
                                alt={unlockedPortrait.name}
                                referrerPolicy="no-referrer"
                                className="w-24 h-28 object-cover object-top border border-[#D6CEBE] shrink-0"
                              />
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="text-xs font-mono text-stone-500">
                                  絕密畫像解鎖 · {unlockedPortrait.id}
                                </div>
                                <h4 className="text-base font-serif font-semibold text-stone-900">
                                  {unlockedPortrait.name}（{unlockedPortrait.title}）
                                </h4>
                                <p className="text-xs text-stone-600 line-clamp-2">
                                  {unlockedPortrait.symbols}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedPortrait(unlockedPortrait)}
                                className="px-3.5 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-stone-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>檢視大圖</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {statusLine && (
                          <div className="pt-2.5 border-t border-[#E5DFD2] text-xs font-mono tabular-nums text-stone-600 leading-relaxed">
                            {statusLine}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#F7F4EE] border border-[#D6CEBE] px-4 py-3 text-sm text-stone-500">
                      書靈正在翻檢萬經閣書架典籍……
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="border border-[#991B1B]/40 bg-[#991B1B]/5 px-4 py-3 text-sm text-[#991B1B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span>{errorMsg}</span>
                    {failedPrompt && (
                      <button
                        type="button"
                        onClick={() => sendMessage(failedPrompt)}
                        className="px-3.5 py-1.5 text-xs font-medium bg-[#991B1B] text-[#FBF9F5] hover:bg-red-800 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        重試上一句
                      </button>
                    )}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              {gameState.gateOpen && (
                <div className="px-5 py-3 border-t border-[#E5DFD2] bg-[#F7F4EE] flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs text-stone-500 whitespace-nowrap shrink-0 mr-1">
                    試試詢問：
                  </span>
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      type="button"
                      disabled={isLoading}
                      onClick={() => sendMessage(qp.text)}
                      className="px-3 py-1.5 text-xs bg-[#FBF9F5] border border-[#D6CEBE] text-stone-700 hover:text-stone-950 hover:border-stone-400 whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Composer */}
              <div className="p-4 sm:p-5 border-t border-[#D6CEBE] bg-[#FBF9F5]">
                {!gameState.gateOpen ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <div className="text-sm text-[#991B1B]">
                      萬經閣禁制已鎖閉（警告累計 3 / 3）。書靈無法再開門接待。
                    </div>
                    <button
                      type="button"
                      onClick={handleResetVisit}
                      className="px-5 py-2.5 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-stone-800 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      重新拜訪萬經閣
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(input);
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <div
                        className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${
                          draftTooLoud ? 'text-[#991B1B] font-semibold' : 'text-stone-500'
                        }`}
                      >
                        {draftTooLoud ? (
                          <Volume2 className="w-3.5 h-3.5" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5" />
                        )}
                        <span>
                          音量偵測（驚嘆號）：{draftExclamations} / 2
                          {draftTooLoud ? ' — 超過 2 個！送出將驚動朝曉大人' : '（安全範圍）'}
                        </span>
                      </div>
                      <span className="text-stone-400 hidden sm:inline">
                        Enter 送出 · Shift + Enter 換行
                      </span>
                    </div>

                    <div className="flex gap-3 items-stretch">
                      <textarea
                        ref={inputRef}
                        rows={2}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="輕聲向守護書靈提問、支付樹葉子解鎖祕辛或畫像……"
                        className="flex-1 resize-none bg-[#F7F4EE] border border-[#D6CEBE] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-700"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-5 py-2.5 bg-[#1C1917] text-[#FBF9F5] hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium inline-flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
                      >
                        <span>送出</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'catalog' && (
            <CatalogTab
              surcharge={gameState.surcharge}
              chaoxiDiscountActive={gameState.chaoxiDiscountActive}
              gateOpen={gameState.gateOpen}
              onAskSpirit={handleJumpWithQuery}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryTab
              unlockedImages={gameState.unlockedImages}
              chaoxiDiscountActive={gameState.chaoxiDiscountActive}
              gateOpen={gameState.gateOpen}
              onSelectPortrait={setSelectedPortrait}
              onRequestPurchase={handleJumpWithQuery}
            />
          )}

          {activeTab === 'codex' && <CodexTab />}
        </div>

        {/* Right Margin Column: Visitor Ledger & Curatorial Notes (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Visitor Status Ledger */}
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-5 space-y-4">
            <div className="pb-3 border-b border-[#D6CEBE] flex items-baseline justify-between">
              <h2 className="text-base font-serif font-semibold text-stone-900">
                萬經閣訪客紀錄
              </h2>
              <span className="text-xs font-mono text-stone-500">即時帳冊</span>
            </div>

            <dl className="divide-y divide-[#E5DFD2] text-sm">
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-stone-600 inline-flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-[#14532D]" />
                  <span>樹葉子餘額</span>
                </dt>
                <dd className="font-mono tabular-nums font-semibold text-stone-950">
                  {gameState.leaves} 片
                </dd>
              </div>

              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-stone-600">朝曉警告次數</dt>
                <dd className="flex items-center gap-2 font-mono tabular-nums">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`w-2.5 h-2.5 border ${
                          gameState.warnings >= step
                            ? 'bg-[#991B1B] border-[#991B1B]'
                            : 'bg-transparent border-stone-400'
                        }`}
                      />
                    ))}
                  </span>
                  <span
                    className={
                      gameState.warnings >= 2
                        ? 'text-[#991B1B] font-semibold'
                        : 'text-stone-900'
                    }
                  >
                    {gameState.warnings} / 3
                  </span>
                </dd>
              </div>

              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-stone-600">朝曉大人狀態</dt>
                <dd className="text-stone-900 text-right">{gameState.chaoxiaoState}</dd>
              </div>

              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-stone-600">閣門禁制狀態</dt>
                <dd
                  className={`font-medium ${
                    gameState.gateOpen ? 'text-[#14532D]' : 'text-[#991B1B]'
                  }`}
                >
                  {gameState.gateOpen ? '開放中' : '已逐客'}
                </dd>
              </div>
            </dl>

            {(gameState.surcharge > 0 || gameState.chaoxiDiscountActive) && (
              <div className="pt-3 border-t border-[#D6CEBE] space-y-1.5 text-xs">
                {gameState.surcharge > 0 && (
                  <p className="text-[#991B1B]">
                    精神賠償懲罰：所有上古祕辛定價 +{gameState.surcharge} 片樹葉子
                  </p>
                )}
                {gameState.chaoxiDiscountActive && (
                  <p className="text-[#14532D]">
                    朝曦大人介紹優惠：收費情報與畫像少收 1 片樹葉子
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Unlocked Portraits Mini-Shelf */}
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-5 space-y-4">
            <div className="pb-3 border-b border-[#D6CEBE] flex items-baseline justify-between">
              <h2 className="text-base font-serif font-semibold text-stone-900">
                私藏畫像匣
              </h2>
              <span className="text-xs font-mono tabular-nums text-stone-500">
                {gameState.unlockedImages.length} / {PORTRAITS.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PORTRAITS.map((p) => {
                const unlocked = gameState.unlockedImages.includes(p.id);
                const effectivePrice = Math.max(
                  1,
                  p.price - (gameState.chaoxiDiscountActive ? 1 : 0)
                );
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (unlocked) {
                        setSelectedPortrait(p);
                      } else {
                        setActiveTab('gallery');
                      }
                    }}
                    className="group text-left bg-[#F7F4EE] border border-[#D6CEBE] hover:border-stone-500 transition-colors overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-[4/3] bg-[#EBE6DF] flex items-center justify-center overflow-hidden">
                      {unlocked ? (
                        <img
                          src={p.imagePath}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <Lock className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                    <div className="p-2 flex items-center justify-between gap-1 text-xs">
                      <span className="font-serif font-medium text-stone-900 truncate">
                        {p.name}
                      </span>
                      <span className="font-mono tabular-nums text-stone-500 shrink-0">
                        {unlocked ? '已藏' : `${effectivePrice}葉`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curatorial Rules Note */}
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] p-5 space-y-3 text-xs text-stone-600 leading-relaxed">
            <h2 className="text-sm font-serif font-semibold text-stone-900">
              入閣規約備忘
            </h2>
            <ul className="space-y-2 list-disc pl-4">
              <li>
                <strong className="text-stone-800">靜默規矩：</strong>
                單句累計超過 2 個驚嘆號（3 個以上）即算喧嘩。警告 2 次祕辛漲價 2 葉，第 3 次直接啟動逐客禁制。
              </li>
              <li>
                <strong className="text-stone-800">朝曉巡視：</strong>
                詢問祕辛八卦時書靈會先左右張望；朝曉大人有約三成機率剛好路過，書靈會當場切換官方模式保命。
              </li>
              <li>
                <strong className="text-stone-800">賺取樹葉子：</strong>
                葉子不夠時，試著真誠「誇獎朝曉大人」或「講個笑話」逗書靈開心，可打工賺取 1–2 片樹葉子。
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Portrait Accession Detail Modal */}
      <PortraitModal
        portrait={selectedPortrait}
        onClose={() => setSelectedPortrait(null)}
      />
    </div>
  );
}
