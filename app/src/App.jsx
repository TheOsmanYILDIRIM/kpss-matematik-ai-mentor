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
  PlayCircle, 
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
import { DIAGNOSTIC_TEST } from './diagnosticQuestions';
import { loadState, saveState, INITIAL_STATE } from './stateManager';
import { callAI } from './llmClient';
import { SYSTEM_INSTRUCTION, buildPromptForMicroStep } from './promptEngine';
import { MathText } from './latexRenderer';

export default function App() {
  const [appState, setAppState] = useState(loadState);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'diagnostic' | 'mentor' | 'curriculum' | 'analysis' | 'settings'
  const [selectedOption, setSelectedOption] = useState(null);
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

  // Handle Diagnostic Question Submit
  const handleDiagnosticAnswer = (option) => {
    setSelectedOption(option);
  };

  const submitDiagnosticAnswer = () => {
    if (!selectedOption) return;

    const currentQ = DIAGNOSTIC_TEST[appState.diagnosticState.currentIndex];
    const isCorrect = selectedOption.startsWith(currentQ.correctOption.slice(0, 2)) || selectedOption === currentQ.correctOption;

    const updatedAnswers = {
      ...appState.diagnosticState.answers,
      [currentQ.id]: { selectedOption, isCorrect }
    };

    const updatedWeaknesses = [...appState.diagnosticState.weaknesses];
    if (!isCorrect) {
      updatedWeaknesses.push({
        topicId: currentQ.topicId,
        topicTitle: currentQ.topicTitle,
        weakness: currentQ.weaknessOnFail,
        prerequisite: currentQ.prerequisite
      });
    }

    const nextIndex = appState.diagnosticState.currentIndex + 1;
    const isFinished = nextIndex >= DIAGNOSTIC_TEST.length;

    if (isCorrect) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }

    if (isFinished) {
      // Build learning roadmap from weaknesses
      const priorityTopics = updatedWeaknesses.map(w => ({
        id: w.topicId,
        title: w.topicTitle,
        weakness: w.weakness
      }));

      // If no weakness, add first 3 fundamental topics
      if (priorityTopics.length === 0) {
        priorityTopics.push(
          { id: "01_temel_islemler", title: "Temel İşlemler & İleri Püf Noktaları", weakness: "Mükemmel sonuç, ileri düzey pekiştirme" },
          { id: "02_temel_kavramlar", title: "Temel Kavramlar & Sayı Kümeleri", weakness: "İleri düzey pratik" }
        );
      }

      setAppState(prev => ({
        ...prev,
        workflowState: 'DEFICIENCY_ROADMAP',
        diagnosticState: {
          ...prev.diagnosticState,
          isCompleted: true,
          currentIndex: nextIndex,
          answers: updatedAnswers,
          weaknesses: updatedWeaknesses
        },
        learningPath: {
          ...prev.learningPath,
          priorityTopics,
          currentTopicIndex: 0,
          currentMicroStep: 1
        },
        stats: {
          ...prev.stats,
          totalCorrect: isCorrect ? prev.stats.totalCorrect + 1 : prev.stats.totalCorrect,
          totalWrong: !isCorrect ? prev.stats.totalWrong + 1 : prev.stats.totalWrong
        }
      }));
      setActiveTab('analysis');
    } else {
      setAppState(prev => ({
        ...prev,
        diagnosticState: {
          ...prev.diagnosticState,
          currentIndex: nextIndex,
          answers: updatedAnswers,
          weaknesses: updatedWeaknesses
        },
        stats: {
          ...prev.stats,
          totalCorrect: isCorrect ? prev.stats.totalCorrect + 1 : prev.stats.totalCorrect,
          totalWrong: !isCorrect ? prev.stats.totalWrong + 1 : prev.stats.totalWrong
        }
      }));
      setSelectedOption(null);
    }
  };

  // Start AI Micro-Step Learning (Direct topic selection or diagnostic recommendation)
  const startLearningTopic = (topic) => {
    setActiveTab('mentor');
    const targetId = topic.id || topic.subtopicId;
    const targetTitle = topic.title || topic.topicTitle;

    setAppState(prev => ({
      ...prev,
      workflowState: 'MICRO_STEP_LEARNING',
      activeSession: {
        currentUnitId: targetId,
        currentUnitTitle: targetTitle,
        chatHistory: []
      },
      learningPath: {
        ...prev.learningPath,
        currentMicroStep: 1,
        totalMicroSteps: 3
      }
    }));

    // Trigger first micro-step AI call
    setTimeout(() => {
      sendMicroStepMessage(`Hocam "${targetTitle}" konusunu doğrudan çalışmak istiyorum. Lütfen bu alt konunun İlyas Hoca usulü püf noktalarını (hap özetini) ve 1. Mikroadım sorusunu başlatın.`);
    }, 150);
  };

  const sendMicroStepMessage = async (customText = null) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim()) return;

    if (!appState.settings.apiKey) {
      setActiveTab('settings');
      setErrorMessage('Lütfen önce Gemini API Anahtarınızı giriniz.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const newHistory = [...appState.activeSession.chatHistory, {
      sender: 'user',
      message: textToSend,
      timestamp: new Date().toISOString()
    }];

    const nextState = {
      ...appState,
      activeSession: {
        ...appState.activeSession,
        chatHistory: newHistory
      }
    };
    setAppState(nextState);
    if (!customText) setUserInput('');

    try {
      const messages = buildPromptForMicroStep({ state: nextState, userMessage: textToSend });
      const aiRes = await callAI({
        apiKey: appState.settings.apiKey,
        provider: appState.settings.provider,
        model: appState.settings.model,
        messages,
        systemPrompt: SYSTEM_INSTRUCTION,
        jsonMode: true
      });

      const cmd = aiRes.command || {};
      const updatedHistory = [...newHistory, {
        sender: 'ai',
        message: aiRes.uiMessage || 'Adım değerlendirildi.',
        command: cmd,
        timestamp: new Date().toISOString()
      }];

      if (cmd.isStepCorrect) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      }

      setAppState(prev => ({
        ...prev,
        activeSession: {
          ...prev.activeSession,
          chatHistory: updatedHistory
        },
        learningPath: {
          ...prev.learningPath,
          currentMicroStep: cmd.microStep || prev.learningPath.currentMicroStep
        },
        stats: {
          ...prev.stats,
          completedMicroSteps: cmd.isStepCorrect ? prev.stats.completedMicroSteps + 1 : prev.stats.completedMicroSteps
        }
      }));

    } catch (err) {
      setErrorMessage(err.message || 'Hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Tüm ilerlemeyi ve testi sıfırlamak istediğinize emin misiniz?')) {
      const reset = { ...INITIAL_STATE, settings: appState.settings };
      setAppState(reset);
      saveState(reset);
      setActiveTab('home');
    }
  };

  const currentDiagnosticQuestion = DIAGNOSTIC_TEST[appState.diagnosticState.currentIndex];

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      
      {/* Top Fixed Header */}
      <header className="h-14 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/90 backdrop-blur shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xs md:text-sm text-white leading-none">KPSS 2026 Matematik</h1>
            <span className="text-[10px] text-indigo-400 font-medium">İlyas Güneş AI Mentor & Teşhis</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {appState.diagnosticState.isCompleted && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ Teşhis Tamamlandı
            </span>
          )}
          <button 
            onClick={handleResetProgress}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors" 
            title="Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Body (Scrollable Container) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-60 border-r border-slate-800 bg-slate-900/60 hidden md:flex flex-col justify-between p-3 shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Ana Sayfa</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'diagnostic' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Genel Teşhis Testi</span>
            </button>

            <button
              onClick={() => setActiveTab('mentor')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'mentor' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mikro Adım Mentor</span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Eksik Röntgeni & Plan</span>
            </button>

            <button
              onClick={() => setActiveTab('curriculum')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'curriculum' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>50 Konu Müfredatı</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>API & Ayarlar</span>
            </button>
          </nav>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400">
            <span>Çözülen Mikroadım</span>
            <p className="text-lg font-bold text-indigo-400 mt-0.5">{appState.stats.completedMicroSteps}</p>
          </div>
        </aside>

        {/* Dynamic Tab Views */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* TAB: HOME */}
          {activeTab === 'home' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6">
              <div className="text-center space-y-3 py-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" /> 2026 KPSS Matematik Pedagojik Sistem
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Eksiklerini Nokta Atışı Tespit Et & Mikro Adımlarla Kapat
                </h2>
                <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  İlyas Güneş 2026 Ders Notu kaynaklıdır. Önce 12 soruluk genel tarama testiyle tüm konuları röntgenleyin, ardından bilmediğiniz konuları parçalanmış mikroadımlarla öğrenin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('diagnostic')}
                  className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 hover:border-indigo-500/60 transition-all text-left group shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white flex items-center justify-between">
                    1. Adım: Genel Teşhis Testi
                    <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Tüm KPSS müfredatını tarayan 12 orijinal soruyla seviyenizi ve eksik soru kalıplarınızı ölçün.
                  </p>
                </button>

                <button
                  onClick={() => {
                    if (!appState.diagnosticState.isCompleted) {
                      setActiveTab('diagnostic');
                    } else {
                      setActiveTab('analysis');
                    }
                  }}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all text-left group shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white flex items-center justify-between">
                    2. Adım: Eksik Röntgeni & Mikro Adım
                    <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Test sonucunda belirlenen zayıf konulardan başlayarak soruları küçük mikroadımlarla çözün.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB: DIAGNOSTIC TEST (12 QUESTIONS) */}
          {activeTab === 'diagnostic' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto w-full flex flex-col justify-between">
              {appState.diagnosticState.isCompleted ? (
                <div className="text-center space-y-5 my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Genel Teşhis Testi Tamamlandı!</h2>
                  <p className="text-xs text-slate-400">
                    12 sorudan {appState.stats.totalCorrect} doğru, {appState.stats.totalWrong} yanlış yaptınız. Eksikleriniz tespit edildi.
                  </p>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Eksik Röntgenini ve Öğrenme Planını Gör
                  </button>
                </div>
              ) : (
                <div className="space-y-6 my-auto">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="text-indigo-400 font-semibold">
                      Soru {appState.diagnosticState.currentIndex + 1} / {DIAGNOSTIC_TEST.length}
                    </span>
                    <span>📖 {currentDiagnosticQuestion?.topicTitle}</span>
                  </div>

                  {/* Question Box */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                    <MathText text={currentDiagnosticQuestion?.question || ''} />
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentDiagnosticQuestion?.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDiagnosticAnswer(opt)}
                        className={`w-full p-3.5 rounded-xl border text-xs md:text-sm font-medium text-left transition-all flex items-center justify-between ${
                          selectedOption === opt
                            ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedOption === opt && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={submitDiagnosticAnswer}
                    disabled={!selectedOption}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs md:text-sm transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Cevabı Onayla & Sonraki Soru
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: DEFICIENCY ANALYSIS & ROADMAP */}
          {activeTab === 'analysis' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Eksik Röntgeni & Öncelikli Öğrenme Planı</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Teşhis testindeki yanlışlarınıza göre AI mentorun hazırladığı kişiselleştirilmiş müfredat sırası.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Doğru Sayısı</span>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">{appState.stats.totalCorrect} / 12</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Eksik Konu Sayısı</span>
                  <p className="text-xl font-bold text-rose-400 mt-0.5">{appState.diagnosticState.weaknesses.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">📋 Öncelikli Çalışılacak Konular</h3>
                {appState.learningPath.priorityTopics.map((topic, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h4 className="text-xs md:text-sm font-bold text-white">{topic.title}</h4>
                      </div>
                      <p className="text-[11px] text-rose-300">⚠️ {topic.weakness}</p>
                    </div>

                    <button
                      onClick={() => startLearningTopic(topic)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Mikro Adımla Öğren</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MENTOR & MICRO-STEP SCAFFOLDING CHAT */}
          {activeTab === 'mentor' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {appState.activeSession.chatHistory.length === 0 ? (
                  <div className="max-w-md mx-auto my-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Mikro Adım Öğrenme Modu</h3>
                    <p className="text-xs text-slate-400">
                      Önce Eksik Röntgeni sekmesinden bir konu seçin veya aşağıdaki butona tıklayın.
                    </p>
                    <button
                      onClick={() => startLearningTopic({ id: '01_temel_islemler', title: 'Temel İşlemler & Dört İşlem' })}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      1. Konudan Mikro Adım Başlat
                    </button>
                  </div>
                ) : (
                  appState.activeSession.chatHistory.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`max-w-xl rounded-2xl p-4 shadow-md ${
                          item.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {item.command?.stepQuestion && (
                          <div className="mb-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                              🎯 Mikroadım {item.command.microStep || 1} / {item.command.totalMicroSteps || 3}
                            </span>
                            <MathText text={item.command.stepQuestion} />
                          </div>
                        )}

                        <MathText text={item.message} />

                        {item.command?.hint && (
                          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                            <span><strong>İlyas Hoca Püf Noktası:</strong> {item.command.hint}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 max-w-xs text-slate-400 text-xs">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>İlyas Hoca cevabınızı inceliyor...</span>
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

              {/* Chat Input Bar */}
              <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); sendMicroStepMessage(); }}
                  className="flex items-center gap-2 max-w-3xl mx-auto"
                >
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Mikro adım cevabınızı yazın (örn: 7, x = -3)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !userInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gönder</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white">84 Alt Konu & Soru Tipi Rehberi</h2>
                  <p className="text-xs text-slate-400 mt-0.5">İstediğiniz konuyu seçerek doğrudan İlyas Hoca usulü ders anlatımı ve mikroadım çalışması başlatabilirsiniz.</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 self-start">
                  84 Konu • 598 Görsel
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {curriculum.units.map((unit, idx) => (
                  <div 
                    key={unit.id || idx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all group"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400">#{idx + 1}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[160px]">{unit.module}</span>
                        {unit.images_count > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            {unit.images_count} Şekil
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 mt-1 leading-snug group-hover:text-indigo-300 transition-colors">
                        {unit.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => startLearningTopic(unit)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all shrink-0 shadow-sm"
                    >
                      Dersi Başlat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-lg mx-auto w-full space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">API & Model Ayarları</h2>
                <p className="text-xs text-slate-400 mt-1">Google Gemini API Anahtarınızı giriniz.</p>
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gemini API Key</label>
                  <input
                    type="password"
                    value={appState.settings.apiKey}
                    onChange={(e) => setAppState(prev => ({
                      ...prev,
                      settings: { ...prev.settings, apiKey: e.target.value }
                    }))}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
                  <select
                    value={['gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'].includes(appState.settings.model) ? appState.settings.model : 'custom'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAppState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, model: val === 'custom' ? '' : val }
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Varsayılan)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    <option value="custom">Özel Model (Manuel Giriş)</option>
                  </select>

                  {!['gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'].includes(appState.settings.model) && (
                    <input
                      type="text"
                      value={appState.settings.model}
                      onChange={(e) => setAppState(prev => ({
                        ...prev,
                        settings: { ...prev.settings, model: e.target.value }
                      }))}
                      placeholder="Model kimliği..."
                      className="mt-2 w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                    />
                  )}
                </div>

                <button
                  onClick={() => {
                    saveState(appState);
                    setActiveTab('diagnostic');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Ayarları Kaydet ve Teste Başla
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Fixed Navigation */}
      <nav className="md:hidden h-14 border-t border-slate-800 bg-slate-900/95 backdrop-blur grid grid-cols-5 items-center shrink-0 z-30">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium ${
            activeTab === 'home' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Ana Sayfa</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium ${
            activeTab === 'diagnostic' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Teşhis</span>
        </button>

        <button
          onClick={() => setActiveTab('mentor')}
          className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium ${
            activeTab === 'mentor' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mentor</span>
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium ${
            activeTab === 'analysis' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Eksikler</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium ${
            activeTab === 'settings' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Ayarlar</span>
        </button>
      </nav>

    </div>
  );
}
