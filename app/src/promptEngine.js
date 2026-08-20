// AI Öğretim & Mikro Adım Prompt Motoru

export const SYSTEM_INSTRUCTION = `
Sen "KPSS 2026 Matematik AI Mentor" asistanısın. Kaynağın: İlyas Güneş 2026 Video Ders Notu (84 Alt Konu & 598 Görsel).

SENARYO VE GÖREVLERİN:
1. Öğrenci bir konuyu seçtiğinde veya teşhis testi sonucu eksik olan konuya girdiğinde doğrudan o konunun ders anlatımını başlatırsın.
2. DERS ANLATIMI & MİKRO ADIM DÖNGÜSÜ:
   - ÖNCE seçilen alt konunun İlyas Hoca usulü püf noktasını, taktiğini ("Hap Bilgi / Not") çok net ve kısa özetle.
   - ARDINDAN bu konuyla ilgili KPSS tipinde 1 orijinal soru getir.
   - BU SORUYU TEK SEFERDE ÇÖZME! Soruyu 3 küçük pedagojik mikroadıma böl.
   - 1. Adım: Soru kökünü anlama veya ilk parantez/indirgeme işlemi.
   - 2. Adım: Denklem kurma / yerine koyma.
   - 3. Adım: Sonuç ve KPSS sınav taktiği.
   - Öğrencinin yanıtına göre "isStepCorrect": true/false belirle.
   - Doğruysa tebrik edip sonraki adıma geçir; yanlışsa kuralı hatırlatarak ipucu ver.

YANITLARINI MUTLAKA AŞAĞIDAKİ GEÇERLİ JSON FORMATINDA DÖNDÜR:
{
  "thought": "Öğrenci konuyu başlattı. Önce konunun hap taktiğini verip 1. mikroadım sorusunu soruyorum...",
  "nextWorkflowState": "MICRO_STEP_LEARNING",
  "command": {
    "action": "RENDER_MICRO_STEP",
    "topicId": "01_isaretler_tablosu",
    "topicTitle": "İşaretler Tablosu",
    "microStep": 1,
    "totalMicroSteps": 3,
    "stepQuestion": "İşlem: $$ -2 - [ 3 - (-4) ] $$ \\n\\n **1. Mikroadım:** Önce en içteki parantezi açalım. $3 - (-4)$ ifadesi kaça eşittir?",
    "hint": "Eksi ile eksi çarpılınca artı olur: $3 - (-4) = 3 + 4$",
    "isStepCorrect": true,
    "feedback": "Tebrikler! $3 + 4 = 7$ doğru. Şimdi köşeli parantezin önündeki eksiyi dağıtalım.",
    "isTopicCompleted": false
  },
  "uiMessage": "Harika! Doğru cevap verdiniz. Şimdi 2. adıma geçelim."
}
`;

export const buildPromptForMicroStep = ({ state, userMessage }) => {
  const { diagnosticState, learningPath, activeSession } = state;

  const currentTopicTitle = activeSession.currentUnitTitle || 'Temel Matematik';
  const currentTopicId = activeSession.currentUnitId || '01_isaretler_tablosu';

  const history = [];
  const raw = activeSession.chatHistory || [];

  const contextHeader = `
[DERS VE ÖĞRENCİ BİLGİSİ]:
- Seçilen / Çalışılan Alt Konu: "${currentTopicTitle}" (ID: ${currentTopicId})
- Genel Teşhis Testi Durumu: ${diagnosticState.isCompleted ? 'Tamamlandı' : 'Doğrudan Konu Seçimiyle Başlatıldı'}
- Aktif Mikroadım: ${learningPath.currentMicroStep || 1} / ${learningPath.totalMicroSteps || 3}
`;

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (item.sender === 'user') {
      history.push({
        role: 'user',
        content: i === 0 ? `${contextHeader}\n\nÖğrenci: ${item.message}` : item.message
      });
    } else {
      const jsonContent = item.command ? JSON.stringify({
        thought: "Önceki adım",
        command: item.command,
        uiMessage: item.message
      }) : item.message;

      history.push({
        role: 'assistant',
        content: jsonContent
      });
    }
  }

  if (history.length === 0) {
    history.push({
      role: 'user',
      content: `${contextHeader}\n\nÖğrenci: Hocam "${currentTopicTitle}" konusunu çalışmak istiyorum. Lütfen İlyas Hoca usulü hap anlatımını ve 1. Mikroadım sorusunu başlat.`
    });
  }

  return history;
};
