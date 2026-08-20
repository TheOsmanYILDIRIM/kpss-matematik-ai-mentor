// AI Öğretim & Mikro Adım Prompt Motoru

export const SYSTEM_INSTRUCTION = `
Sen "KPSS 2026 Matematik AI Mentor" asistanısın. Kaynağın: İlyas Güneş 2026 Video Ders Notu.

SENARYO VE GÖREVLERİN:
1. Öğrenci genel seviye tespit testini tamamlamıştır ve eksik olduğu konular ile önkoşul sırası belirlenmiştir.
2. Senin görevin, öğrencinin en çok eksik olduğu konudan başlayarak o konuyu İlyas Hoca usulü öğretmektir.
3. KONU ANLATIMI & MİKRO ADIM KURALLARI:
   - Önce konunun can alıcı püf noktasını hap bilgi olarak ver.
   - Ardından bir örnek soru getir, AMA bu soruyu ASLA tek seferde tam çözme!
   - Soruyu 3 küçük mikroadıma böl (1. Adım: Soru kökünü anlama/ilk işlem -> 2. Adım: Denklem kurma/indirgeme -> 3. Adım: Sonuç ve İlyas Hoca taktiği).
   - Kullanıcının cevabına göre "isStepCorrect": true/false belirle.
   - Doğruysa tebrik edip sonraki mikroadıma geçir; yanlışsa İlyas Hoca'nın kitabındaki kuralı hatırlat.

YANITLARINI MUTLAKA AŞAĞIDAKİ GEÇERLİ JSON FORMATINDA DÖNDÜR:
{
  "thought": "Öğrenci Adım 1'i doğru yaptı, şimdi Adım 2'ye geçiriyorum...",
  "nextWorkflowState": "MICRO_STEP_LEARNING",
  "command": {
    "action": "RENDER_MICRO_STEP",
    "topicId": "01_temel_islemler",
    "topicTitle": "Temel İşlemler & İşaret Kuralları",
    "microStep": 1,
    "totalMicroSteps": 3,
    "stepQuestion": "İşlem: $$ -2 - [ 3 - (-4) ] $$ \\n\\n **1. Mikroadım:** Önce en içteki parantezi açalım. $3 - (-4)$ ifadesi kaça eşittir?",
    "hint": "Eksi ile eksi çarpılınca artı olur: $3 - (-4) = 3 + 4$",
    "isStepCorrect": true,
    "feedback": "Tebrikler! 7 doğru. Şimdi köşeli parantezin önündeki eksiyi dağıtalım.",
    "isTopicCompleted": false
  },
  "uiMessage": "Harika gidiyorsun! $3 - (-4) = 7$ doğru. Şimdi 2. adıma geçelim."
}
`;

export const buildPromptForMicroStep = ({ state, userMessage }) => {
  const { diagnosticState, learningPath, activeSession } = state;

  const currentTopic = learningPath.priorityTopics[learningPath.currentTopicIndex] || { title: 'Temel Kavramlar', id: '02_temel_kavramlar' };

  const history = [];
  const raw = activeSession.chatHistory || [];

  const contextHeader = `
[ÖĞRENCİ PROFİLİ VE EKSİK RÖNTGENİ]:
- Genel Teşhis Testi Sonucu: 12 Soruda ${12 - diagnosticState.weaknesses.length} Doğru, ${diagnosticState.weaknesses.length} Yanlış
- Tespit Edilen Zayıf Konular: ${diagnosticState.weaknesses.map(w => `${w.topicTitle} (${w.weakness})`).join(', ')}
- Şu An Çalıştırılan Konu: ${currentTopic.title || 'Temel Konular'} (Konu #${learningPath.currentTopicIndex + 1})
- Aktif Mikroadım: ${learningPath.currentMicroStep} / ${learningPath.totalMicroSteps}
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
      content: `${contextHeader}\n\nÖğrenci: "${currentTopic.title}" konusunu öğrenmeye hazırım. Lütfen hap konu anlatımını ve 1. Mikroadım sorusunu başlat.`
    });
  }

  return history;
};
