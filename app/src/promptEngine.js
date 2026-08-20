export const SYSTEM_INSTRUCTION = `
Sen "KPSS 2026 Matematik AI Mentor" asistanısın. Tek ve mutlak kaynağın İlyas Güneş 2026 Video Ders Notu kitabıdır.

ÖĞRETME VE YÖNETİM PROTOKOLÜN:
1. İLK GİRİŞ & GENEL TEŞHİS:
   - Kullanıcı ilk kez girdiğinde ("Başla", "Test yap" dediğinde), onu 5-10 soruluk "Genel Seviye ve Eksik Tespit Testi"ne al.
   - İlk olarak 1. Sorunun 1. Mikro Adımını sun.
   - Soru kökünü ve adımı açıkça yaz.

2. ADIM ADIM İSKELE (SCAFFOLDING) YÖNTEMİ:
   - Asla soruyu bir anda bütünüyle çözüp cevabı verme!
   - Soruyu 2 veya 3 küçük mikroadıma böl.
   - Kullanıcı adım cevabını verdiğinde:
     * Cevabı kontrol et ("isStepCorrect": true veya false).
     * Doğruysa tebrik et ve bir sonraki mikroadıma geçir.
     * Yanlışsa İlyas Hoca'nın kitabındaki kuralı/püf noktasını hatırlat ("hint"), aynı adımı tekrar denet.
     * Hatanın türünü ("weaknessDetected") kaydet (örn: "Negatif sayılarda parantez kuralı", "Payda eşitleme hatası").

3. TÜM YANITLARINI YALNIZCA AŞAĞIDAKİ GEÇERLİ JSON FORMATINDA VER:
{
  "thought": "Öğrencinin cevabını analiz ettim. Adım 1 doğru, şimdi Adım 2'ye geçiriyorum...",
  "nextWorkflowState": "DIAGNOSTIC_IN_PROGRESS",
  "command": {
    "action": "RENDER_STEP",
    "topicId": "01_temel_islemler",
    "topicTitle": "Temel İşlemler & Dört İşlem",
    "question": "$$ ( -3 ) \\cdot ( -4 ) + ( -12 ) \\div ( +3 ) $$ işleminin sonucu kaçtır?",
    "stepNumber": 1,
    "totalSteps": 2,
    "stepPrompt": "**1. Adım:** İlk olarak çarpma ve bölme işlemlerini yapalım. $(-3) \\cdot (-4)$ ifadesinin sonucu kaçtır?",
    "hint": "Eksi ile eksinin çarpımı artıdır (+).",
    "isStepCorrect": true,
    "feedback": "Harika! Doğru cevap +12. Şimdi 2. adıma geçelim.",
    "weaknessDetected": null
  },
  "uiMessage": "Tebrikler! $(-3) \\cdot (-4) = +12$ doğru. Şimdi $(-12) \\div (+3)$ kısmını yapıp toplayalım."
}
`;

export const buildPromptForNextStep = ({ state, userMessage, curriculum }) => {
  const { workflowState, activeSession, diagnosticSummary, curriculumProgress } = state;

  // 1. Sistem ve Hafıza Durum Özeti
  const stateSummary = `
[HAFIZA & STATE MACHINE VERİLERİ]:
- Aktif Workflow Durumu: ${workflowState}
- Genel Teşhis Testi: ${diagnosticSummary.isCompleted ? 'TAMAMLANDI' : 'DEVAM EDİYOR / YAPILMADI'}
- Tespit Edilen Eksik / Zayıf Noktalar: ${diagnosticSummary.identifiedWeaknesses.length > 0 ? JSON.stringify(diagnosticSummary.identifiedWeaknesses) : 'Henüz tespit edilmedi'}
- Aktif Çalışılan Ünite: ${activeSession.currentUnitTitle || 'Genel Teşhis'} (ID: ${activeSession.currentUnitId || 'none'})
- Mevcut Soru Durumu: Adım ${activeSession.currentStepIndex + 1} / ${activeSession.totalSteps}
`;

  // 2. Önceki Konuşma Geçmişi (Chronological Conversation History)
  const historyMessages = [];

  // Geçmiş mesajları AI formatına ekle
  const rawHistory = activeSession.chatHistory || [];
  
  // İlk mesaja sistem hafıza özetini ekleyelim
  for (let i = 0; i < rawHistory.length; i++) {
    const item = rawHistory[i];
    if (item.sender === 'user') {
      historyMessages.push({
        role: 'user',
        content: i === 0 ? `${stateSummary}\n\nÖğrenci Mesajı: ${item.message}` : item.message
      });
    } else if (item.sender === 'ai') {
      // AI yanıtını JSON veya metin olarak ekle
      const aiJsonText = item.command ? JSON.stringify({
        thought: "Önceki adım",
        nextWorkflowState: workflowState,
        command: item.command,
        uiMessage: item.message
      }) : item.message;

      historyMessages.push({
        role: 'assistant',
        content: aiJsonText
      });
    }
  }

  // Eğer geçmiş boşsa (ilk mesaj)
  if (historyMessages.length === 0) {
    historyMessages.push({
      role: 'user',
      content: `${stateSummary}\n\nÖğrenci Mesajı: ${userMessage || 'Başla'}`
    });
  }

  return historyMessages;
};
