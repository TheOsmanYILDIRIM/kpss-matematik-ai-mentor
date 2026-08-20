import re
import os
import json

SOURCE_FILE = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/kpss_matematik_tam_metin.md"
UNITS_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/units"
APP_UNITS_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/app/public/units"
os.makedirs(UNITS_DIR, exist_ok=True)
os.makedirs(APP_UNITS_DIR, exist_ok=True)

with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    full_text = f.read()

# İndeks tablosu ve 50 ana başlık
units_catalog = [
    {"id": "01_temel_islemler", "order": 1, "title": "Temel İşlemler, Parantez Açma & İşlem Önceliği", "page": 1, "anchor": r"### A\.\s*BiLINMESİ GEREKEN TEMEL BİLGİLER"},
    {"id": "02_temel_kavramlar", "order": 2, "title": "Temel Kavramlar & Sayı Kümeleri", "page": 8, "anchor": r"(?:TEMEL KAVRAMLAR|Sayı Kümeleri|Rakam|Doğal Sayılar)"},
    {"id": "03_tek_cift_sayilar", "order": 3, "title": "Tek ve Çift Sayılar", "page": 13, "anchor": r"TEK\s*-\s*ÇİFT SAYILAR"},
    {"id": "04_asal_sayilar", "order": 4, "title": "Asal Sayılar & Aralarında Asal Sayılar", "page": 17, "anchor": r"ASAL SAYILAR"},
    {"id": "05_ardisik_sayilar", "order": 5, "title": "Ardışık Sayılar & Terim Sayısı Formülleri", "page": 20, "anchor": r"ARDIŞIK SAYILAR"},
    {"id": "06_faktoriyel", "order": 6, "title": "Faktöriyel Kavramı & Sadeleştirme", "page": 25, "anchor": r"(?:##\s*b\)\s*Faktöriyel|FAKTÖRİYEL)"},
    {"id": "07_sayi_basamaklari", "order": 7, "title": "Sayı Basamakları & Basamak Çözümleme", "page": 29, "anchor": r"SAYI BASAMAKLARI"},
    {"id": "08_taban_aritmetigi", "order": 8, "title": "Taban Aritmetiği & Dört İşlem", "page": 35, "anchor": r"TABAN ARİTMETİĞİ"},
    {"id": "09_bolme", "order": 9, "title": "Bölme İşlemi & Kalan Bağıntıları", "page": 38, "anchor": r"BÖLME"},
    {"id": "10_bolunebilme", "order": 10, "title": "Bölünebilme Kuralları", "page": 41, "anchor": r"BÖLÜNEBİLME KURALLARI"},
    {"id": "11_asal_carpanlar", "order": 11, "title": "Asal Çarpanlara Ayırma & Pozitif Bölen Sayısı", "page": 46, "anchor": r"ASAL ÇARPANLAR"},
    {"id": "12_ebob_ekok", "order": 12, "title": "EBOB - EKOK & Periyodik Problemler", "page": 49, "anchor": r"EBOB\s*-\s*EKOK"},
    {"id": "13_rasyonel_sayilar", "order": 13, "title": "Rasyonel Sayılar & Merdivenli Kesirler", "page": 56, "anchor": r"RASYONEL SAYILAR"},
    {"id": "14_ondalikli_sayilar", "order": 14, "title": "Ondalıklı Sayılar & Devirli Ondalık Açılımlar", "page": 62, "anchor": r"ONDALIKLI SAYILAR"},
    {"id": "15_basit_esitsizlikler", "order": 15, "title": "Basit Eşitsizlikler & Aralık Kavramı", "page": 66, "anchor": r"BASİT EŞİTSİZLİKLER"},
    {"id": "16_mutlak_deger", "order": 16, "title": "Mutlak Değer Özellikleri ve Eşitsizlikleri", "page": 73, "anchor": r"MUTLAK DEĞER"},
    {"id": "17_uslu_sayilar", "order": 17, "title": "Üslü Sayılar ve Üslü Denklemler", "page": 81, "anchor": r"ÜSLÜ SAYILAR"},
    {"id": "18_koklu_sayilar", "order": 18, "title": "Köklü Sayılar ve Eşlenik Çarpımları", "page": 89, "anchor": r"KÖKLÜ SAYILAR"},
    {"id": "19_carpanlara_ayirma", "order": 19, "title": "Çarpanlara Ayırma ve Özdeşlikler", "page": 99, "anchor": r"ÇARPANLARA AYIRMA"},
    {"id": "20_birinci_dereceden_denklemler", "order": 20, "title": "I. Dereceden Bir ve İki Bilinmeyenli Denklemler", "page": 108, "anchor": r"I\.\s*DERECEDEN DENKLEMLER"},
    {"id": "21_oran_oranti", "order": 21, "title": "Oran - Orantı ve Orantı Çeşitleri", "page": 113, "anchor": r"ORAN\s*-\s*ORANTI"},
    {"id": "22_sayi_kesir_problemleri", "order": 22, "title": "Sayı ve Kesir Problemleri", "page": 121, "anchor": r"SAYI\s*-\s*KESİR PROBLEMLERİ"},
    {"id": "23_yas_problemleri", "order": 23, "title": "Yaş Problemleri", "page": 131, "anchor": r"YAŞ PROBLEMLERİ"},
    {"id": "24_karisim_problemleri", "order": 24, "title": "Karışım Problemleri", "page": 135, "anchor": r"KARIŞIM PROBLEMLERİ"},
    {"id": "25_isci_havuz_problemleri", "order": 25, "title": "İşçi ve Havuz Problemleri", "page": 138, "anchor": r"İŞÇİ\s*-\s*HAVUZ PROBLEMLERİ"},
    {"id": "26_yuzde_kar_zarar_problemleri", "order": 26, "title": "Yüzde, Kâr, Zarar ve İskonto Problemleri", "page": 141, "anchor": r"YÜZDE\s*-\s*KÂR\s*-\s*ZARAR PROBLEMLERİ"},
    {"id": "27_hiz_problemleri", "order": 27, "title": "Hız ve Hareket Problemleri", "page": 149, "anchor": r"HIZ PROBLEMLERİ"},
    {"id": "28_grafik_problemleri", "order": 28, "title": "Grafik ve Tablo Okuma Problemleri", "page": 156, "anchor": r"GRAFİK PROBLEMLERİ"},
    {"id": "29_kumeler", "order": 29, "title": "Kümeler ve Küme İşlemleri", "page": 166, "anchor": r"KÜMELER"},
    {"id": "30_kume_problemleri", "order": 30, "title": "Küme Problemleri", "page": 171, "anchor": r"KÜME PROBLEMLERİ"},
    {"id": "31_islem", "order": 31, "title": "Özel Tanımlı İşlem", "page": 175, "anchor": r"İŞLEM"},
    {"id": "32_moduler_aritmetik", "order": 32, "title": "Modüler Aritmetik & Kalan Sınıfları", "page": 179, "anchor": r"MODÜLER ARİTMETİK"},
    {"id": "33_permutasyon", "order": 33, "title": "Permütasyon (Sıralama) & Tekrarlı Permütasyon", "page": 183, "anchor": r"PERMÜTASYON"},
    {"id": "34_kombinasyon", "order": 34, "title": "Kombinasyon (Seçme ve Gruplama)", "page": 188, "anchor": r"KOMBİNASYON"},
    {"id": "35_olasilik", "order": 35, "title": "Olasılık Hesabı", "page": 192, "anchor": r"OLASILIK"},
    {"id": "36_fonksiyonlar", "order": 36, "title": "Fonksiyonlar (Tanım, Değer, Ters, Bileşke)", "page": 198, "anchor": r"FONKSİYONLAR"},
    {"id": "37_sayisal_mantik", "order": 37, "title": "Sayısal Mantık, Şekil Yeteneği & Akıl Yürütme", "page": 206, "anchor": r"SAYISAL MANTIK"},
    {"id": "38_dogruda_acilar", "order": 38, "title": "Geometri: Doğruda Açılar", "page": 213, "anchor": r"DOĞRUDA AÇILAR"},
    {"id": "39_ucgende_acilar", "order": 39, "title": "Geometri: Üçgende Açılar", "page": 217, "anchor": r"ÜÇGENDE AÇILAR"},
    {"id": "40_dik_ucgen", "order": 40, "title": "Geometri: Dik Üçgen & Pisagor / Öklid", "page": 223, "anchor": r"DİK ÜÇGEN"},
    {"id": "41_ikizkenar_eskenar_ucgen", "order": 41, "title": "Geometri: İkizkenar ve Eşkenar Üçgen", "page": 227, "anchor": r"İKİZKENAR ÜÇGEN\s*-\s*EŞKENAR ÜÇGEN"},
    {"id": "42_aciortay", "order": 42, "title": "Geometri: Üçgende Açıortay Bağıntıları", "page": 230, "anchor": r"AÇIORTAY"},
    {"id": "43_kenarortay", "order": 43, "title": "Geometri: Kenarortay ve Ağırlık Merkezi", "page": 234, "anchor": r"KENARORTAY"},
    {"id": "44_ucgende_alan", "order": 44, "title": "Geometri: Üçgende Alan Hesabı", "page": 239, "anchor": r"ÜÇGENDE ALAN"},
    {"id": "45_ucgende_benzerlik", "order": 45, "title": "Geometri: Üçgende Benzerlik ve Eşlik", "page": 244, "anchor": r"ÜÇGENDE BENZERLİK"},
    {"id": "46_cokgenler", "order": 46, "title": "Geometri: Çokgenler ve Düzgün Çokgenler", "page": 257, "anchor": r"ÇOKGENLER"},
    {"id": "47_dortgenler", "order": 47, "title": "Geometri: Dörtgenler, Paralelkenar, Dikdörtgen, Kare, Yamuk", "page": 263, "anchor": r"DÖRTGENLER"},
    {"id": "48_cember_daire", "order": 48, "title": "Geometri: Çemberde Açılar, Uzunluk ve Dairede Alan", "page": 283, "anchor": r"ÇEMBER\s*-\s*DAİRE"},
    {"id": "49_kati_cisimler", "order": 49, "title": "Geometri: Katı Cisimler (Prizma, Silindir, Koni, Küre)", "page": 293, "anchor": r"KATI CİSİMLER"},
    {"id": "50_analitik_geometri", "order": 50, "title": "Geometri: Noktanın ve Doğrunun Analitik İncelenmesi", "page": 301, "anchor": r"ANALİTİK GEOMETRİ"}
]

# Ana metindeki konumları tespit et
positions = []
for u in units_catalog:
    # İçindekiler bölümünü atlamak için 500. karakterden sonra ara
    matches = list(re.finditer(u["anchor"], full_text[1500:], re.IGNORECASE))
    if matches:
        pos = matches[0].start() + 1500
        positions.append((pos, u))
    else:
        # Basit isim araması
        clean_name = re.escape(u["title"].split('&')[0].split(',')[0].strip())
        matches2 = list(re.finditer(clean_name, full_text[1500:], re.IGNORECASE))
        pos = (matches2[0].start() + 1500) if matches2 else -1
        positions.append((pos, u))

positions.sort(key=lambda x: x[0] if x[0] != -1 else 99999999)

indexed_units = []

for idx, (pos, u) in enumerate(positions):
    start = pos if pos != -1 else 0
    end = positions[idx + 1][0] if idx + 1 < len(positions) and positions[idx + 1][0] != -1 else len(full_text)
    
    unit_content = full_text[start:end].strip()
    
    # Başlık ve üst bilgi ekleme
    doc = f"# 2026 KPSS Matematik: {u['title']}\n\n"
    doc += f"> **Kaynak:** 2026 Yargı Yayınları İlyas Güneş Video Ders Notu (Sayfa {u['page']})\n\n---\n\n"
    doc += unit_content
    
    # units/ klasörüne ve app/public/units/ klasörüne yaz
    filename = f"{u['id']}.md"
    file_path1 = os.path.join(UNITS_DIR, filename)
    file_path2 = os.path.join(APP_UNITS_DIR, filename)
    
    with open(file_path1, "w", encoding="utf-8") as f1:
        f1.write(doc)
    with open(file_path2, "w", encoding="utf-8") as f2:
        f2.write(doc)
        
    char_len = len(unit_content)
    line_count = len(unit_content.splitlines())
    
    indexed_units.append({
        "id": u["id"],
        "order": u["order"],
        "title": u["title"],
        "page": u["page"],
        "filename": filename,
        "char_count": char_len,
        "line_count": line_count
    })
    print(f"[{u['order']:02d}/50] {u['title']:<45} -> {filename:<32} ({char_len} karakter, {line_count} satır)")

# units_index.json oluştur
index_meta = {
    "book_title": "2026 KPSS Matematik Video Ders Notu",
    "author": "İlyas Güneş",
    "publisher": "Yargı Yayınları",
    "total_units": len(indexed_units),
    "units": indexed_units
}

with open("/data/data/com.termux/files/home/kpss-matematik-ai-mentor/units_index.json", "w", encoding="utf-8") as f:
    json.dump(index_meta, f, ensure_ascii=False, indent=2)

with open("/data/data/com.termux/files/home/kpss-matematik-ai-mentor/app/public/units_index.json", "w", encoding="utf-8") as f:
    json.dump(index_meta, f, ensure_ascii=False, indent=2)

print("\n✓ 50 Konunun tamamı ayrı ayrı bağımsız .md dosyalarına ayrıldı ve indekslendi!")
