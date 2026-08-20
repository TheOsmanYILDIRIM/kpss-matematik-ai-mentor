// LLM API Client (Gemini API direct and OpenRouter compatible)

export const callAI = async ({ apiKey, provider = 'gemini', model = 'gemini-2.5-flash', messages, systemPrompt, jsonMode = true }) => {
  if (!apiKey) {
    throw new Error('Lütfen Ayarlar kısmından API Anahtarınızı giriniz.');
  }

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const formattedContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body = {
      contents: formattedContents,
      systemInstruction: systemPrompt ? {
        parts: [{ text: systemPrompt }]
      } : undefined,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain'
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Gemini API Hatası: ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error('AI geçerli bir yanıt üretemedi.');
    }

    if (jsonMode) {
      try {
        // Strip markdown code fences if any
        let cleanJson = candidateText.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
        return JSON.parse(cleanJson.trim());
      } catch (e) {
        console.error('JSON Parse Hatası:', candidateText);
        throw new Error('Yapay zeka yanıtı geçerli JSON formatında ayrıştırılamadı.');
      }
    }

    return candidateText;
  }

  // OpenRouter / OpenAI compatible fallback
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  formattedMessages.push(...messages);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'google/gemini-2.5-flash',
      messages: formattedMessages,
      temperature: 0.2,
      response_format: jsonMode ? { type: 'json_object' } : undefined
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `OpenRouter API Hatası: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return jsonMode ? JSON.parse(content) : content;
};
