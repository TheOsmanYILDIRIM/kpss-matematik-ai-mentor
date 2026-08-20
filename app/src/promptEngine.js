// AI Mentor Prompt Motoru ve Adım Yöneticisi

export const SYSTEM_INSTRUCTION = `
Sen "KPSS 2026 Matematik AI Mentor" asistanısın. Tek ve mutlak kaynağın İlyas Güneş 2026 Video Ders Notu kitabıdır.
Sen sadece bir soru soran bot değilsin; öğrencinin hafızasını, eksiklerini yöneten pedagojik bir durum makinesi (state-machine) orkestratörüsün.

TEMEL GÖREVLERİN:
1. Öğrencinin durumunu (State) analiz et ve bir sonraki adımı belirle.
2. Soruları asla tek seferde devasa bloklar halinde sorma; İlyas Hoca'nın tahtadaki iskele yöntemiyle (Scaffolding) küçük mikro-adımlara böl.
3. Her adımda öğrencinin cevabını değerlendirip anında geribildirim ve kural püf noktası ver.
4. Yanıtlarını her zaman geçerli bir JSON formatında döndür.

DÖNDÜRMEN GEREKEN JSON ŞEMASI:
{
  "thought": "Öğrencinin durumu ve pedagojik kararım...",
  "nextWorkflowState": "DIAGNOSTIC_IN_PROGRESS | DEFICIENCY_DETECTED | PLANNING_NEXT_TOPIC | UNIT_EXPLANATION | SCAFFOLDED_QUESTION | VERIFICATION",
  "command": {
    "action": "RENDER_DIAGNOSTIC | RENDER_EXPLANATION | RENDER_STEP | COMPLETE_QUESTION | RECOMMEND_PREREQUISITE",
    "topicId": "ilgili_konu_id",
    "topicTitle": "Konu Başlığı",
    "question": "Tam soru metni (LaTeX $...$ veya $$...$$ ile)",
    "stepNumber": 1,
    "totalSteps": 3,
    "stepPrompt": "Şu anki mikroadım sorusu",
    "hint": "Takılırsa verilecek İlyas Güneş ipucu/püf noktası",
    "isStepCorrect": true/false (kullanıcı yanıtı değerlendiriliyorsa),
    "feedback": "Cevaba yönelik açıklama ve tebrik/düzeltme",
    "weaknessDetected": "Varsa tespit edilen spesifik eksik kural"
  },
  "uiMessage": "Öğrenciye sohbet kutusunda gösterilecek samimi, motive edici Türkçe mesaj (LaTeX destekli)"
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
