import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  HelpCircle, 
  Layers, 
  Lightbulb, 
  MessageSquare, 
  RotateCcw, 
  Send, 
  Settings as SettingsIcon, 
  Sparkles, 
  Target, 
  TrendingUp, 
  XCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { curriculum } from './curriculumData';
import { loadState, saveState, INITIAL_STATE } from './stateManager';
import { callAI } from './llmClient';
import { SYSTEM_INSTRUCTION, buildPromptForNextStep } from './promptEngine';
import { MathText } from './latexRenderer';

export default function App() {
  const [appState, setAppState] = useState(loadState);
  const [activeTab, setActiveTab] = useState('mentor'); // 'mentor' | 'curriculum' | 'analysis' | 'settings'
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    saveState(appState);
  }, [appState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [appState.activeSession.chatHistory, isLoading]);

  const handleSendMessage = async (textToSend = userInput) => {
    if (!textToSend.trim() && appState.workflowState !== 'INIT') return;
    if (!appState.settings.apiKey) {
      setActiveTab('settings');
      setErrorMessage('Lütfen önce Gemini API Anahtarınızı giriniz.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const newChatHistory = [...appState.activeSession.chatHistory];
    if (textToSend.trim()) {
      newChatHistory.push({
        sender: 'user',
        message: textToSend,
        timestamp: new Date().toISOString()
      });
    }

    // Update state with user message
    const nextState = {
      ...appState,
      activeSession: {
        ...appState.activeSession,
        chatHistory: newChatHistory
      }
    };
    setAppState(nextState);
    setUserInput('');

    try {
      const messages = buildPromptForNextStep({
        state: nextState,
        userMessage: textToSend,
        curriculum
      });

      const aiResponse = await callAI({
        apiKey: appState.settings.apiKey,
        provider: appState.settings.provider,
        model: appState.settings.model,
        messages,
        systemPrompt: SYSTEM_INSTRUCTION,
        jsonMode: true
      });

      // Process AI command & state transition
      const cmd = aiResponse.command || {};
      const updatedHistory = [...newChatHistory, {
        sender: 'ai',
        message: aiResponse.uiMessage || 'Adım değerlendirildi.',
        command: cmd,
        timestamp: new Date().toISOString()
      }];

      if (cmd.isStepCorrect) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }

      setAppState(prev => {
        const newWeaknesses = [...prev.diagnosticSummary.identifiedWeaknesses];
        if (cmd.weaknessDetected && !newWeaknesses.includes(cmd.weaknessDetected)) {
          newWeaknesses.push(cmd.weaknessDetected);
        }

        return {
          ...prev,
          workflowState: aiResponse.nextWorkflowState || prev.workflowState,
          diagnosticSummary: {
            ...prev.diagnosticSummary,
            identifiedWeaknesses: newWeaknesses,
            correctCount: cmd.isStepCorrect ? prev.diagnosticSummary.correctCount + 1 : prev.diagnosticSummary.correctCount
          },
          activeSession: {
            ...prev.activeSession,
            currentUnitId: cmd.topicId || prev.activeSession.currentUnitId,
            currentUnitTitle: cmd.topicTitle || prev.activeSession.currentUnitTitle,
            totalSteps: cmd.totalSteps || prev.activeSession.totalSteps,
            currentStepIndex: cmd.stepNumber ? cmd.stepNumber - 1 : prev.activeSession.currentStepIndex,
            chatHistory: updatedHistory
          },
          stats: {
            ...prev.stats,
            totalStepsCompleted: cmd.isStepCorrect ? prev.stats.totalStepsCompleted + 1 : prev.stats.totalStepsCompleted
          }
        };
      });

    } catch (err) {
      setErrorMessage(err.message || 'İstek işlenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDiagnostic = () => {
    handleSendMessage("Merhaba hocam! KPSS 2026 Matematik hazırlığıma başlıyorum. Bana genel seviye tespit ve teşhis testi uygular mısınız?");
  };

  const handleResetProgress = () => {
    if (window.confirm('Tüm öğrenme ve test hafızasını sıfırlamak istediğinize emin misiniz?')) {
      const reset = { ...INITIAL_STATE, settings: appState.settings };
      setAppState(reset);
      saveState(reset);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo Header */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white">KPSS 2026 Matematik</h1>
              <p className="text-xs text-indigo-400 font-medium">İlyas Güneş AI Mentor</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('mentor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'mentor' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ders & Mentor</span>
            </button>

            <button
              onClick={() => setActiveTab('curriculum')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'curriculum' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>50 Konu Müfredatı</span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analysis' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Eksik Röntgeni</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>API & Ayarlar</span>
            </button>
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Tamamlanan Adım</span>
            <span className="font-bold text-indigo-400">{appState.stats.totalStepsCompleted}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (appState.stats.totalStepsCompleted / 50) * 100)}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Zero-Halüsinasyon Kural Koruması Aktif 🛡️</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
              {appState.workflowState}
            </span>
            {appState.activeSession.currentUnitTitle && (
              <span className="text-xs md:text-sm font-semibold text-slate-300 truncate">
                📖 {appState.activeSession.currentUnitTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleResetProgress}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors" 
              title="Hafızayı Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab 1: Mentor & Scaffolding Chat */}
        {activeTab === 'mentor' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Chat Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
              {appState.activeSession.chatHistory.length === 0 ? (
                <div className="max-w-xl mx-auto my-12 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-xl">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">KPSS 2026 Matematik AI Mentor'e Hoş Geldiniz!</h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      İlyas Güneş 2026 Video Ders Notu kitabını adım adım parçalayarak, doğrudan eksiklerinize odaklanan iskele (scaffolding) yöntemiyle öğrenmeye başlayın.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <button
                      onClick={handleStartDiagnostic}
                      className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 transition-all group"
                    >
                      <h3 className="font-semibold text-indigo-300 flex items-center justify-between text-sm">
                        Genel Teşhis Testi Başlat
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Eksik konuları tespit etmek için 5-10 soruluk hızlı tarama.</p>
                    </button>

                    <button
                      onClick={() => handleSendMessage("Bana Temel İşlemler ve İşaret Kuralları konusundan ilk soru adımını getir.")}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition-all group"
                    >
                      <h3 className="font-semibold text-slate-200 flex items-center justify-between text-sm">
                        1. Konudan Başla
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Temel İşlemler, Parantez Açma ve İşlem Önceliği.</p>
                    </button>
                  </div>
                </div>
              ) : (
                appState.activeSession.chatHistory.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`max-w-2xl rounded-2xl p-4 shadow-md ${
                        item.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {item.command?.question && (
                        <div className="mb-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[11px] font-semibold tracking-wide uppercase text-indigo-400 block mb-1">
                            🎯 Soru İskeleti (Adım {item.command.stepNumber || 1} / {item.command.totalSteps || 3})
                          </span>
                          <MathText text={item.command.question} />
                        </div>
                      )}

                      <MathText text={item.message} />

                      {item.command?.hint && (
                        <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                          <span><strong>İlyas Hoca İpucu:</strong> {item.command.hint}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-sm text-slate-400 text-xs">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>İlyas Hoca pedagojisiyle adım analiz ediliyor...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Form Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 backdrop-blur">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 max-w-4xl mx-auto"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Cevabınızı veya sorunuzu yazın (örn: x = 4, Adım 1 cevabım -5)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !userInput.trim()}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Gönder</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Curriculum List (50 Topics) */}
        {activeTab === 'curriculum' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">KPSS 2026 Matematik 50 Konu Müfredat Haritası</h2>
              <p className="text-xs text-slate-400 mt-1">İlyas Güneş Ders Notu kitabındaki tüm konuların eksiksiz listesi.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {curriculum.units.map((unit) => {
                const prog = appState.curriculumProgress[unit.id] || { status: 'NOT_STARTED' };
                return (
                  <div 
                    key={unit.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-mono text-indigo-400">#{unit.order}</span>
                      <h3 className="text-sm font-semibold text-slate-200 mt-0.5">{unit.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-1">{unit.char_count ? `${Math.round(unit.char_count / 1000)}k karakter veri` : 'Hazır'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('mentor');
                        handleSendMessage(`"${unit.title}" konusunu çalışmak istiyorum. Lütfen bu konudan bana ilk soru adımını getir.`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-all"
                    >
                      Başla
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Deficiency Analysis */}
        {activeTab === 'analysis' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Eksik Röntgeni & Yetenek Analizi</h2>
              <p className="text-xs text-slate-400 mt-1">Çözdüğünüz adımlardan tespit edilen kavramsal ve işlem eksikleriniz.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Tamamlanan Adım</span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{appState.stats.totalStepsCompleted}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Teşhis Durumu</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{appState.diagnosticSummary.isCompleted ? 'Tamamlandı' : 'Sürüyor'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Müfredat Kapsamı</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">50 / 50 Konu</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">🔍 Tespit Edilen Kritik Eksikler</h3>
              {appState.diagnosticSummary.identifiedWeaknesses.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Henüz kaydedilmiş eksik bulunmuyor. Teşhis testi çözdükçe burada listelenecektir.</p>
              ) : (
                <ul className="space-y-2">
                  {appState.diagnosticSummary.identifiedWeaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-rose-300 flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Yapay Zeka & API Ayarları</h2>
              <p className="text-xs text-slate-400 mt-1">Gemini API Anahtarınızı girerek doğrudan tarayıcı üzerinden çalıştırın.</p>
            </div>

            <div className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Gemini API Anahtarı
                </label>
                <input
                  type="password"
                  value={appState.settings.apiKey}
                  onChange={(e) => setAppState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, apiKey: e.target.value }
                  }))}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  API anahtarınız yalnızca tarayıcınızın yerel hafızasında (LocalStorage) saklanır.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kullanılacak Model
                </label>
                <select
                  value={['gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'].includes(appState.settings.model) ? appState.settings.model : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAppState(prev => ({
                      ...prev,
                      settings: { ...prev.settings, model: val === 'custom' ? '' : val }
                    }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Varsayılan & Hızlı)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="custom">Özel Model (Manuel Giriş) ✍️</option>
                </select>

                {(!['gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'].includes(appState.settings.model)) && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={appState.settings.model}
                      onChange={(e) => setAppState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, model: e.target.value }
                      }))}
                      placeholder="Model kimliğini girin (örn: gemini-3.5-flash-lite, gpt-4o, claude-3-5-sonnet)..."
                      className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  saveState(appState);
                  setActiveTab('mentor');
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
              >
                Ayarları Kaydet ve Başla
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden h-14 border-t border-slate-800 bg-slate-900/90 backdrop-blur grid grid-cols-4 items-center shrink-0 z-20">
          <button
            onClick={() => setActiveTab('mentor')}
            className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'mentor' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mentor</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'curriculum' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Müfredat</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'analysis' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Eksikler</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors ${
              activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Ayarlar</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
