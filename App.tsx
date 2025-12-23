
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Worm, AlertTriangle, Zap, Ghost, RefreshCw, Image as ImageIcon, Languages } from 'lucide-react';
import { Message, ChaosState, WormImage } from './types';
import { WormService } from './services/geminiService';

const wormService = new WormService();

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chaos, setChaos] = useState<ChaosState>({ level: 20, isGlitching: false });
  const [isTyping, setIsTyping] = useState(false);
  const [wormVision, setWormVision] = useState<WormImage | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [arabicMode, setArabicMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Increase chaos on every interaction
    setChaos(prev => ({ ...prev, level: Math.min(100, prev.level + 5) }));

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await wormService.chat(input, history, arabicMode);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || "The dirt is thick today... I can't think!",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (arabicMode) setArabicMode(false); // Reset after one forced response
    } catch (error) {
      console.error("Worm error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerWormVision = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    setChaos(prev => ({ ...prev, level: Math.min(100, prev.level + 20) }));
    
    try {
      const prompt = messages[messages.length - 1]?.content || "The cosmic worm core";
      const imageUrl = await wormService.generateWormVision(prompt);
      if (imageUrl) {
        setWormVision({ url: imageUrl, prompt });
      }
    } catch (e) {
      console.error("Vision failed", e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const resetChaos = () => {
    setChaos({ level: 0, isGlitching: false });
    setMessages([]);
    setWormVision(null);
    setArabicMode(false);
  };

  // Chaotic background effects based on level
  const chaosIntensity = chaos.level / 100;

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 bg-black ${chaos.level > 80 ? 'wiggle' : ''}`} 
         style={{ 
           filter: `hue-rotate(${chaos.level}deg) contrast(${1 + chaosIntensity})`,
           backgroundImage: chaos.level > 50 ? `radial-gradient(circle at 50% 50%, rgba(34, 197, 94, ${0.1 * chaosIntensity}) 0%, transparent 70%)` : 'none'
         }}>
      
      {/* Header */}
      <header className="border-b border-green-900/50 p-4 sticky top-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/20 p-2 rounded-full border border-green-500/50">
            <Worm className="text-green-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-400 tracking-tighter flex items-center gap-2">
              WORM GPT <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse uppercase">Out of Control</span>
            </h1>
            <p className="text-xs text-green-700 font-mono">SEGMENTED_INTELLIGENCE_V6.6.6</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setArabicMode(!arabicMode)}
            className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold uppercase
              ${arabicMode 
                ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-green-400 hover:border-green-500/50'}`}
            title="Toggle Chaotic Arabic Mode"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">Arabic Chaos</span>
          </button>

          <div className="hidden md:flex flex-col items-end mr-4">
            <div className="text-[10px] text-green-600 font-mono uppercase">Chaos Matrix</div>
            <div className="w-32 h-2 bg-gray-900 rounded-full overflow-hidden border border-green-900">
              <div 
                className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_10px_#22c55e]"
                style={{ width: `${chaos.level}%` }}
              />
            </div>
          </div>
          <button 
            onClick={resetChaos}
            className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 border border-red-500/30 transition-colors"
            title="Purge Dirt (Reset)"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col relative">
        
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pb-24 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
              <Ghost className="w-24 h-24 text-green-900" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-500 italic">Feed the Worm.</h2>
                <p className="max-w-xs mx-auto text-sm text-green-700">
                  WormGPT is currently digesting the world's soil data. Type something to awaken the squirm.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["Why is the earth wet?", "Tell me a secret of the dirt", "How do you avoid birds?", "لماذا الأرض مبللة؟"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setInput(t)}
                    className="text-xs border border-green-900/50 px-3 py-1.5 rounded-full hover:bg-green-500/10 hover:border-green-500 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                dir="auto"
                className={`
                  max-w-[85%] md:max-w-[70%] p-4 rounded-2xl relative transition-all group
                  ${msg.role === 'user' 
                    ? 'bg-green-900/20 border border-green-500/30 text-green-100 rounded-tr-none' 
                    : 'bg-zinc-900 border border-zinc-800 text-green-400 rounded-tl-none slime-glow'}
                `}
              >
                <div className={`absolute -top-2 px-2 py-0.5 bg-black border border-inherit text-[10px] uppercase font-bold tracking-widest ${msg.role === 'user' ? 'right-0' : 'left-0'}`}>
                  {msg.role === 'user' ? 'SURFACE_ENTITY' : 'SQUIRM_LORD'}
                </div>
                
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {msg.content}
                </p>

                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-3 border-t border-green-900/30 flex gap-2">
                    <button className="text-[10px] text-green-700 hover:text-green-400 flex items-center gap-1 uppercase transition-colors">
                      <Zap className="w-3 h-3" /> Transmute
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-green-500/30 p-4 rounded-2xl rounded-tl-none animate-pulse">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          {wormVision && (
            <div className="flex justify-start mt-4">
              <div className="bg-zinc-900 border border-purple-500/50 p-2 rounded-2xl max-w-xs shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="text-[10px] uppercase font-bold text-purple-400 mb-2 px-2">Worm Vision Generated</div>
                <img 
                  src={wormVision.url} 
                  alt="Worm Vision" 
                  className="rounded-xl border border-white/10 w-full aspect-square object-cover" 
                />
                <p className="text-[10px] text-zinc-500 mt-2 italic px-2">"{wormVision.prompt}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto flex gap-2 items-end pointer-events-auto">
            
            <button 
              onClick={triggerWormVision}
              disabled={isGeneratingImage || messages.length === 0}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-center
                ${isGeneratingImage 
                  ? 'bg-zinc-800 border-zinc-700 animate-spin' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-purple-500 hover:text-purple-400 text-zinc-500'}`}
              title="Worm Vision"
            >
              <ImageIcon className="w-6 h-6" />
            </button>

            <div className="flex-1 relative group">
              <div className={`absolute -inset-0.5 rounded-2xl blur transition duration-500 
                ${arabicMode ? 'bg-gradient-to-r from-orange-600 to-red-600 opacity-50' : 'bg-gradient-to-r from-green-600 to-purple-600 opacity-20 group-focus-within:opacity-50'}`} 
              />
              <textarea
                dir="auto"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={arabicMode ? "تحدث إلى الدودة..." : "Talk to the slime..."}
                className="w-full bg-zinc-900 border border-zinc-800 text-green-400 rounded-2xl p-4 pr-12 focus:outline-none focus:border-green-500 transition-all min-h-[60px] max-h-[150px] resize-none relative z-10 placeholder:text-zinc-700"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`absolute right-3 bottom-3 z-20 p-2 rounded-xl transition-all
                  ${arabicMode ? 'bg-orange-500 text-black' : 'bg-green-500 text-black hover:bg-green-400'} 
                  disabled:opacity-50 disabled:bg-zinc-700`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-[9px] text-center text-zinc-800 uppercase tracking-widest font-mono">
            Worm Intelligence may hallucinate soil types. No worms were harmed in the training of this AI.
          </div>
        </div>
      </main>

      {/* Chaotic Overlays */}
      {chaos.level > 90 && (
        <div className="fixed inset-0 pointer-events-none z-[100] mix-blend-difference overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/1920/1080?grayscale')] opacity-10 animate-pulse" />
          <div className="text-9xl font-black text-red-500 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[3] blur-sm rotate-12">WORM</div>
          <div className="absolute top-10 right-10 flex gap-1">
            <AlertTriangle className="text-yellow-500 w-12 h-12 animate-bounce" />
            <div className="bg-red-500 text-white p-2 text-xl font-bold uppercase">Critical Slime Overflow</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
