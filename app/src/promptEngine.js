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

  return [
    {
      role: 'user',
      content: `
MEVCUT APP HAFIZASI VE DURUM:
- Aktif Workflow State: ${workflowState}
- Genel Teşhis Testi Tamamlandı mı?: ${diagnosticSummary.isCompleted ? 'Evet' : 'Hayır'}
- Teşhis Sonuçları / Tespit Edilen Eksikler: ${JSON.stringify(diagnosticSummary.identifiedWeaknesses)}
- Mevcut Çalışılan Konu: ${activeSession.currentUnitTitle || 'Belirlenmedi'}
- Aktif Soru Adım Bilgisi: Adım ${activeSession.currentStepIndex + 1} / ${activeSession.totalSteps}
- Kullanıcı Son Mesajı / Cevabı: "${userMessage || 'Başlat'}"

MÜFREDAT KONU LİSTESİ:
${curriculum.units.slice(0, 15).map(u => `${u.id}: ${u.title}`).join(', ')}...

GÖREVİN:
Yukarıdaki hafızayı değerlendir. Eğer kullanıcı yeni başladıysa ilk 5-10 soruluk genel teşhis testinden bir soru adımı ver. Eğer soru çözülüyorsa kullanıcının cevabını kontrol et, doğruysa bir sonraki adıma geçir, yanlışsa İlyas Hoca kuralıyla uyar. Belirtilen JSON şemasıyla yanıt ver.
`
    }
  ];
};
