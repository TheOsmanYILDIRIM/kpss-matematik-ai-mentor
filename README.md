# 📚 2026 KPSS Matematik AI Mentor & Soru Teşhis Sistemi

Bu depo, **2026 Yargı Yayınları İlyas Güneş Matematik Video Ders Notu** içeriğini temel alarak geliştirilmiş yapay zeka destekli matematik mentorluk, seviye teşhis, eksik tespiti ve kişiselleştirilmiş konu anlatım sistemidir.

---

## 🎯 Projenin Amacı ve Özellikleri

- **Sıfır Halüsinasyon (Zero Halucination):** Yapay zeka yalnızca kaynak kitaptaki kural, formül ve soru kalıplarına bağlı kalır.
- **Tam Müfredat Kapsamı:** 50 konunun tümü ve yüzlerce soru tipi (`TIP-1`, `TIP-2`...) eksiksiz taranır.
- **Dört Aşamalı Öğrenme Döngüsü:**
  1. 📝 **Teşhis Testi:** Seviyeyi ve soru kalıplarını ölçen testler.
  2. 🔍 **Eksik Analizi:** Yanlışların kök nedenini (formül, işlem, dikkat, yöntem) tespit etme.
  3. 💡 **Mikro Anlatım:** İlyas Hoca usulü püf noktalarla nokta atışı konu anlatımı.
  4. 🎯 **Pekiştirme:** Aynı kalıptan yeni türetilmiş sorularla konuyu tam pekiştirme.
- **İlerleme Takibi:** `mufredat_takip.md` üzerinden 5 ana modülde adım adım kontrol.

---

## 📂 Dosya Yapısı

```
.
├── SYSTEM_PROMPT.md            # Herhangi bir LLM/AI modeline verilecek temel sistem istemi
├── SKILL.md                    # Antigravity / Agentic AI için detaylı yetenek rehberi
├── mufredat_takip.md           # 50 konuluk KPSS müfredat kontrol listesi
├── index.json                  # Konu başlıkları ve ünite indeksleri
├── kpss_matematik_tam_metin.md # PaddleOCR ile çıkarılmış eksiksiz LaTeX formüllü ders notu
└── units/                      # Ünite bazlı ayrıştırılmış çalışma modülleri
```

---

## 🚀 Başka Bir AI İle Nasıl Kullanılır?

1. **Sistem İstemi Olarak:** [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md) ve [`SKILL.md`](./SKILL.md) dosyasını yapay zekaya (ChatGPT, Claude, Gemini vb.) verin.
2. **Kaynak Olarak:** [`kpss_matematik_tam_metin.md`](./kpss_matematik_tam_metin.md) veya ilgili ünite dosyasını AI bağlamına yükleyin.
3. **Komutlarla Başlatın:**
   - `/test 01_temel_islemler` : Teşhis testini başlatır.
   - `/eksik-analizi` : Çözümlerinizin analizini yapar.
   - `/anlat [kural]` : Mikro anlatım sunar.
   - `/pekistir` : Yeni türetilmiş soru sorar.
   - `/durum` : İlerlemeyi gösterir.
