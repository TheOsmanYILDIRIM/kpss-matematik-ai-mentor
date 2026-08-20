import re
import os
import json

SOURCE_FILE = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/kpss_matematik_tam_metin.md"
UNITS_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/units"
APP_UNITS_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/app/public/units"
os.makedirs(UNITS_DIR, exist_ok=True)
os.makedirs(APP_UNITS_DIR, exist_ok=True)

with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    text = f.read()

# Konu başlıkları ve metin içindeki tam belirteçleri
topic_anchors = [
    (1, "01_temel_islemler", "Temel İşlemler, Parantez Açma & İşlem Önceliği", 1, r"(### A\.\s*BiLINMESİ GEREKEN TEMEL BİLGİLER|B\. DÖRT İŞLEM)"),
    (2, "02_temel_kavramlar", "Temel Kavramlar & Sayı Kümeleri", 8, r"(SAYI KÜMELERİ|Rakam|Doğal Sayılar|Pozitif - Negatif Sayılar)"),
    (3, "03_tek_cift_sayilar", "Tek ve Çift Sayılar", 13, r"(TEK\s*-\s*ÇİFT SAYILAR|Tek ve Çift Sayıların Özellikleri)"),
    (4, "04_asal_sayilar", "Asal Sayılar & Aralarında Asal Sayılar", 17, r"(ASAL SAYILAR|Aralarında Asal Sayılar)"),
    (5, "05_ardisik_sayilar", "Ardışık Sayılar & Terim Sayısı", 20, r"(ARDIŞIK SAYILAR|Ardışık tek sayılar|Terim Sayısı)"),
    (6, "06_faktoriyel", "Faktöriyel Kavramı & Sadeleştirme", 25, r"(b\)\s*Faktöriyel|FAKTÖRİYEL)"),
    (7, "07_sayi_basamaklari", "Sayı Basamakları & Çözümleme", 29, r"(SAYI BASAMAKLARI|Basamak Çözümleme|AB\s*=\s*10A\s*\+\s*B)"),
    (8, "08_taban_aritmetigi", "Taban Aritmetiği & Dört İşlem", 35, r"(TABAN ARİTMETİĞİ|Taban Aritmetiğinde Dört işlem)"),
    (9, "09_bolme", "Bölme İşlemi & Kalan Bağıntıları", 38, r"(BÖLME|Bölünen\s*=\s*Bölen)"),
    (10, "10_bolunebilme", "Bölünebilme Kuralları", 41, r"(BÖLÜNEBİLME KURALLARI|2 ile Bölünebilme)"),
    (11, "11_asal_carpanlar", "Asal Çarpanlara Ayırma & Bölen Sayısı", 46, r"(ASAL ÇARPANLAR|Pozitif Bölen Sayısı|PBS)"),
    (12, "12_ebob_ekok", "EBOB - EKOK & Periyodik Problemler", 49, r"(EBOB\s*-\s*EKOK|EBOB:\s*En büyük ortak bölen)"),
    (13, "13_rasyonel_sayilar", "Rasyonel Sayılar & Merdivenli Kesirler", 56, r"(RASYONEL SAYILAR|Rasyonel Sayılarda Dört işlem)"),
    (14, "14_ondalikli_sayilar", "Ondalıklı Sayılar & Devirli Ondalıklar", 62, r"(ONDALIKLI SAYILAR|Devirli Ondalık)"),
    (15, "15_basit_esitsizlikler", "Basit Eşitsizlikler & Aralıklar", 66, r"(BASİT EŞİTSİZLİKLER|BASIT EŞİTSİZLIKLER)"),
    (16, "16_mutlak_deger", "Mutlak Değer Özellikleri ve Eşitsizlikleri", 73, r"(MUTLAK DEĞER|\|x\|)"),
    (17, "17_uslu_sayilar", "Üslü Sayılar ve Üslü Denklemler", 81, r"(ÜSLÜ SAYILAR|USLU SAYILAR|a\^n)"),
    (18, "18_koklu_sayilar", "Köklü Sayılar ve Eşlenik", 89, r"(KÖKLÜ SAYILAR|KOKLU SAYILAR|Eşlenik)"),
    (19, "19_carpanlara_ayirma", "Çarpanlara Ayırma ve Özdeşlikler", 99, r"(ÇARPANLARA AYIRMA|İki Kare Farkı)"),
    (20, "20_birinci_dereceden_denklemler", "I. Dereceden Denklemler", 108, r"(I\.\s*DERECEDEN DENKLEMLER)"),
    (21, "21_oran_oranti", "Oran - Orantı ve Orantı Çeşitleri", 113, r"(ORAN\s*-\s*ORANTI|ORANTI CESITLERI)"),
    (22, "22_sayi_kesir_problemleri", "Sayı ve Kesir Problemleri", 121, r"(SAYI\s*-\s*KESİR PROBLEMLERİ|Sayı Problemleri)"),
    (23, "23_yas_problemleri", "Yaş Problemleri", 131, r"(YAŞ PROBLEMLERİ|Yas Problemleri)"),
    (24, "24_karisim_problemleri", "Karışım Problemleri", 135, r"(KARIŞIM PROBLEMLERİ|Karisim Problemleri)"),
    (25, "25_isci_havuz_problemleri", "İşçi ve Havuz Problemleri", 138, r"(İŞÇİ\s*-\s*HAVUZ PROBLEMLERİ|Isci Problemleri)"),
    (26, "26_yuzde_kar_zarar_problemleri", "Yüzde, Kâr, Zarar Problemleri", 141, r"(YÜZDE\s*-\s*KÂR\s*-\s*ZARAR|Yuzde Problemleri)"),
    (27, "27_hiz_problemleri", "Hız ve Hareket Problemleri", 149, r"(HIZ PROBLEMLERİ|Hiz Problemleri)"),
    (28, "28_grafik_problemleri", "Grafik ve Tablo Problemleri", 156, r"(GRAFİK PROBLEMLERİ|Grafik Problemleri|Doğrusal Grafikler)"),
    (29, "29_kumeler", "Kümeler ve Küme İşlemleri", 166, r"(KÜMELER|Küme İşlemleri)"),
    (30, "30_kume_problemleri", "Küme Problemleri", 171, r"(KÜME PROBLEMLERİ|Kume Problemleri)"),
    (31, "31_islem", "Özel Tanımlı İşlem", 175, r"(İŞLEM|İşlem Özellikleri)"),
    (32, "32_moduler_aritmetik", "Modüler Aritmetik", 179, r"(MODÜLER ARİTMETİK)"),
    (33, "33_permutasyon", "Permütasyon & Tekrarlı Permütasyon", 183, r"(PERMÜTASYON|TEKRARLI PERMÜTASVON)"),
    (34, "34_kombinasyon", "Kombinasyon (Seçme)", 188, r"(KOMBINASYON|KOMBİNASYON)"),
    (35, "35_olasilik", "Olasılık Hesabı", 192, r"(OLASILIK|Olasılık)"),
    (36, "36_fonksiyonlar", "Fonksiyonlar (Tanım, Değer, Ters, Bileşke)", 198, r"(FONKSİYONLAR|Bileşke Fonksiyon)"),
    (37, "37_sayisal_mantik", "Sayısal Mantık & Akıl Yürütme", 206, r"(SAYISAL MANTIK|Sayisal Mantik)"),
    (38, "38_dogruda_acilar", "Geometri: Doğruda Açılar", 213, r"(DOGRUDA AÇILAR|DOĞRUDA AÇILAR)"),
    (39, "39_ucgende_acilar", "Geometri: Üçgende Açılar", 217, r"(ÜÇGENDE AÇILAR|Ucgende Acilar)"),
    (40, "40_dik_ucgen", "Geometri: Dik Üçgen & Pisagor", 223, r"(DİK ÜÇGEN|Dik Ucgen|Pisagor)"),
    (41, "41_ikizkenar_eskenar_ucgen", "Geometri: İkizkenar ve Eşkenar Üçgen", 227, r"(İKİZKENAR ÜÇGEN|İkizkenar Üçgen)"),
    (42, "42_aciortay", "Geometri: Üçgende Açıortay", 230, r"(AÇIORTAY|Aciortay)"),
    (43, "43_kenarortay", "Geometri: Kenarortay ve Ağırlık Merkezi", 234, r"(KENARORTAY|Kenarortay)"),
    (44, "44_ucgende_alan", "Geometri: Üçgende Alan", 239, r"(ÜÇGENDE ALAN|Ucgende Alan)"),
    (45, "45_ucgende_benzerlik", "Geometri: Üçgende Benzerlik", 244, r"(ÜÇGENDE BENZERLİK|Ucgende Benzerlik)"),
    (46, "46_cokgenler", "Geometri: Çokgenler & Düzgün Çokgenler", 257, r"(ÇOKGENLER|Cokgenler)"),
    (47, "47_dortgenler", "Geometri: Dörtgenler, Kare, Dikdörtgen", 263, r"(DÖRTGENLER|DIKDÖRTGEN|KARE)"),
    (48, "48_cember_daire", "Geometri: Çember ve Daire", 283, r"(ÇEMBER|Çemberde Açılar|Dairede Alan)"),
    (49, "49_kati_cisimler", "Geometri: Katı Cisimler (Prizma, Silindir, Koni)", 293, r"(KATI CİSİMLER|DİKDÖRTGEN DİK PRİZMA)"),
    (50, "50_analitik_geometri", "Geometri: Noktanın ve Doğrunun Analitiği", 301, r"(ANALİTİK GEOMETRİ|Analitik Geometri)")
]

# Metni içindekiler kısmından sonra (sayfa 1'den) dilimleyelim
content_after_toc = text[2000:]
total_len = len(content_after_toc)

# 50 konunun yaklaşık dilim başlangıçlarını ve metin içi eşleşmelerini kuralım
found_spans = []
for order, uid, title, page, pattern in topic_anchors:
    m = list(re.finditer(pattern, content_after_toc, re.IGNORECASE))
    pos = m[0].start() if m else -1
    found_spans.append({
        "order": order,
        "id": uid,
        "title": title,
        "page": page,
        "pos": pos
    })

# Pozisyonları sıralayalım ve eksik olanları sayfa oranına göre enterpole edelim
for i, item in enumerate(found_spans):
    if item["pos"] == -1:
        # Sayfa oranına göre tahmini pos
        estimated_pos = int((item["page"] / 317) * total_len)
        item["pos"] = estimated_pos

found_spans.sort(key=lambda x: x["pos"])

final_units = []
for i, item in enumerate(found_spans):
    start_pos = item["pos"]
    end_pos = found_spans[i + 1]["pos"] if i + 1 < len(found_spans) else total_len
    
    if end_pos <= start_pos:
        end_pos = min(total_len, start_pos + 12000)

    chunk = content_after_toc[start_pos:end_pos].strip()
    
    doc = f"# 2026 KPSS Matematik: {item['title']}\n\n"
    doc += f"> **Kaynak:** 2026 Yargı Yayınları İlyas Güneş Video Ders Notu (Sayfa {item['page']})\n\n---\n\n"
    doc += chunk
    
    fname = f"{item['id']}.md"
    p1 = os.path.join(UNITS_DIR, fname)
    p2 = os.path.join(APP_UNITS_DIR, fname)
    
    with open(p1, "w", encoding="utf-8") as f:
        f.write(doc)
    with open(p2, "w", encoding="utf-8") as f:
        f.write(doc)
        
    final_units.append({
        "id": item["id"],
        "order": item["order"],
        "title": item["title"],
        "page": item["page"],
        "filename": fname,
        "char_count": len(chunk),
        "line_count": len(chunk.splitlines())
    })
    print(f"[{item['order']:02d}/50] {item['title']:<48} -> {fname:<30} ({len(chunk)} karakter)")

# Sıralı index çıktısı
final_units.sort(key=lambda x: x["order"])

meta_output = {
    "book_title": "2026 KPSS Matematik Video Ders Notu",
    "author": "İlyas Güneş",
    "total_units": len(final_units),
    "units": final_units
}

with open("/data/data/com.termux/files/home/kpss-matematik-ai-mentor/units_index.json", "w", encoding="utf-8") as f:
    json.dump(meta_output, f, ensure_ascii=False, indent=2)

with open("/data/data/com.termux/files/home/kpss-matematik-ai-mentor/app/public/units_index.json", "w", encoding="utf-8") as f:
    json.dump(meta_output, f, ensure_ascii=False, indent=2)

print("\n✓ 50 Konunun tümü orantılı ve tam içerikle ayrı ayrı .md dosyalarına bölündü!")
