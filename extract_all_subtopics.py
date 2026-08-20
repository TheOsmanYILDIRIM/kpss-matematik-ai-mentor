import re
import os
import json

SOURCE_FILE = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/kpss_matematik_tam_metin.md"
SUBUNITS_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/subunits"
APP_SUBUNITS_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/app/public/subunits"
os.makedirs(SUBUNITS_DIR, exist_ok=True)
os.makedirs(APP_SUBUNITS_DIR, exist_ok=True)

with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    text = f.read()

# Kitaptaki tüm mikro/alt konular ve soru tiplerini kapsayan detaylı müfredat
detailed_topics = [
    # --- MODÜL 1: TEMEL MATEMATİK & SAYILAR DÜNYASI ---
    {"id": "01_isaretler_tablosu", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "İşaretler Tablosu (Artı/Eksi Çarpım & Bölüm Kuralları)", "keywords": ["işaretler tablosu", "Negatif iki sayının çarpımı"]},
    {"id": "02_parantez_acma", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "Parantez Açma ve İşaret Dağıtma", "keywords": ["Parantez acima", "-(-x) = +x"]},
    {"id": "03_dort_islem_toplama_cikarma", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "Toplama ve Çıkarma Kuralları", "keywords": ["TOPLAMA - ÇIKARMA İŞLEMİ", "İki sayının işaretleri aynı ise"]},
    {"id": "04_dort_islem_carpma_bolme", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "Çarpma ve Bölme İşlemi", "keywords": ["CARPMA - BÖLME İŞLEMI", "Çarpma ve bölme işlemleri yapılırken"]},
    {"id": "05_kuvvet_alma", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "Kuvvet Alma (Üs Kuralları ve Negatif Sayıların Kuvveti)", "keywords": ["Kuvvet alma", "x^{2}=x"]},
    {"id": "06_islem_onceligi", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "İşlem Önceliği Sıralaması", "keywords": ["İşlem önceliği:", "Önce üslü sayılar", "Parantez içi"]},
    {"id": "07_paranteze_alma", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "Ortak Çarpan Parantezine Alma", "keywords": ["PARANTEZE ALMA", "Ortak çarpan"]},
    {"id": "08_sadelestirme_oranlama", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "Sadeleştirme ve Oranlama Teknikleri", "keywords": ["SADELEŞTIRME VE ORANLAMA", "Sadeleştirme"]},
    {"id": "09_tam_sayili_kesir_negatif_kuvvet", "module": "Modül 1: Temel Matematik & Dört İşlem", "title": "Tam Sayılı Kesir ve Negatif Kuvvet Kuralları", "keywords": ["Tam sayılı kesir - Negatif kuvvet", "Negatif kuvvet"]},

    # --- SAYILAR TEORİSİ ---
    {"id": "10_sayi_kumeleri", "module": "Modül 1: Sayılar Teorisi", "title": "Sayı Kümeleri (Rakam, Doğal Sayı, Tam Sayı, Reel Sayı)", "keywords": ["Sayı Kümeleri", "Rakam", "Doğal Sayılar"]},
    {"id": "11_pozitif_negatif_sayilar", "module": "Modül 1: Sayılar Teorisi", "title": "Pozitif ve Negatif Sayıların Özellikleri", "keywords": ["Pozitif - Negatif Sayilar", "Daima pozitif"]},
    {"id": "12_tek_cift_sayilar", "module": "Modül 1: Sayılar Teorisi", "title": "Tek ve Çift Sayıların Özellikleri & Çarpım Paritesi", "keywords": ["TEK - ÇİFT SAYILAR", "Tek ve Çift Sayıların Özellikleri"]},
    {"id": "13_asal_sayilar", "module": "Modül 1: Sayılar Teorisi", "title": "Asal Sayılar ve Özellikleri", "keywords": ["ASAL SAYILAR", "En küçük asal sayı 2'dir"]},
    {"id": "14_aralarinda_asal_sayilar", "module": "Modül 1: Sayılar Teorisi", "title": "Aralarında Asal Sayılar", "keywords": ["Aralarında Asal", "Ortak böleni yalnız 1 olan"]},
    {"id": "15_ardisik_sayilar_tanim", "module": "Modül 1: Sayılar Teorisi", "title": "Ardışık Sayılar & Ardışık Tek/Çift Sayı Bağıntıları", "keywords": ["Ardışık tek sayılar", "Ardışık iki terimi arasındaki fark"]},
    {"id": "16_ardisik_sayilar_toplam_formul", "module": "Modül 1: Sayılar Teorisi", "title": "Ardışık Sayıların Toplam Formülleri & Gauss Yöntemi", "keywords": ["Ardisik Sayilarin Formülleri", "Genel Toplam Formülü", "Terim Sayisi"]},
    {"id": "17_faktoriyel_kavrami", "module": "Modül 1: Sayılar Teorisi", "title": "Faktöriyel Kavramı ve Sadeleştirme Taktikleri", "keywords": ["Faktöriyel", "n!", "0! = 1"]},
    {"id": "18_sayi_basamaklari_cozumleme", "module": "Modül 1: Sayılar Teorisi", "title": "Sayı Basamakları & Basamak Çözümleme (AB = 10A + B)", "keywords": ["SAYI BASAMAKLARI", "Basamak Çözümleme"]},
    {"id": "19_taban_aritmetigi", "module": "Modül 1: Sayılar Teorisi", "title": "Taban Aritmetiği ve Taban Değiştirme", "keywords": ["Taban Aritmetiğinde Dört işlem", "Taban Aritmetiği"]},
    {"id": "20_bolme_kalan_bagintilari", "module": "Modül 1: Sayılar Teorisi", "title": "Bölme İşlemi, Bölen ve Kalan Bağıntıları", "keywords": ["BÖLME", "A, B, C doğal sayılar"]},
    {"id": "21_bolunebilme_kurallari_temel", "module": "Modül 1: Sayılar Teorisi", "title": "Temel Bölünebilme Kuralları (2, 3, 4, 5, 8, 9, 10)", "keywords": ["BÖLÜNEBİLME KURALLARI", "2 ile Bölünebilme", "3 ile Bölünebilme"]},
    {"id": "22_bolunebilme_11_ve_aralarinda_asal", "module": "Modül 1: Sayılar Teorisi", "title": "11 ile Bölünebilme ve Aralarında Asal Çarpanlara Bölünme (12, 36, 45 vb.)", "keywords": ["11 ile Bölünebilme", "ARALARINDA ASAL CARPANLARA BÖLÜNEBİLME"]},
    {"id": "23_asal_carpanlara_ayirma", "module": "Modül 1: Sayılar Teorisi", "title": "Asal Çarpanlara Ayırma ve Pozitif Bölen Sayısı (PBS, TBS)", "keywords": ["Asal Çarpanlar", "Pozitif Bölen Sayısı"]},
    {"id": "24_ebob_ekok_tanim_ve_hesaplama", "module": "Modül 1: Sayılar Teorisi", "title": "EBOB ve EKOK Hesaplama Kuralları", "keywords": ["EBOB: En büyük ortak bölen", "EKOK"]},
    {"id": "25_ebob_ekok_problemleri_ve_periyot", "module": "Modül 1: Sayılar Teorisi", "title": "EBOB-EKOK Problemleri ve Periyodik Tekrar Problemleri", "keywords": ["EBOB problemleri", "Nöbet problemleri", "Periyodik"]},

    # --- MODÜL 2: CEBİR VE DENKLEMLER ---
    {"id": "26_rasyonel_sayilar_dort_islem", "module": "Modül 2: Cebir & Denklemler", "title": "Rasyonel Sayılarda Dört İşlem & İşlem Önceliği", "keywords": ["Rasyonel Sayilarda Dört işlem", "Payda eşitleme"]},
    {"id": "27_merdivenli_kesirler", "module": "Modül 2: Cebir & Denklemler", "title": "Merdivenli (Sonsuz/Basamaklı) Kesirler", "keywords": ["Merdivenli kesir", "Ana kesir çizgisi"]},
    {"id": "28_ondalikli_sayilar_ve_siralama", "module": "Modül 2: Cebir & Denklemler", "title": "Ondalıklı Sayılar, Virgül Kaydırma ve Kesirlerde Sıralama", "keywords": ["Ondalıklı Sayılar", "Virgül kaydırma", "Sıralama"]},
    {"id": "29_devirli_ondalik_sayilar", "module": "Modül 2: Cebir & Denklemler", "title": "Devirli Ondalık Sayıların Rasyonel Kesre Dönüşümü", "keywords": ["Devirli", "Devretmeyen"]},
    {"id": "30_basit_esitsizlikler_ozellikler", "module": "Modül 2: Cebir & Denklemler", "title": "Basit Eşitsizliklerin Temel Özellikleri ve Yön Değiştirme", "keywords": ["BASIT EŞİTSİZLIKLER", "Eşitsizlik yön değiştirir"]},
    {"id": "31_esitsizliklerde_aralik_ve_taraf_tarafa", "module": "Modül 2: Cebir & Denklemler", "title": "Aralık Kavramı, Taraf Tarafa Toplama ve Çarpma", "keywords": ["Taraf tarafa toplama", "Aralık"]},
    {"id": "32_mutlak_deger_tanim_ve_ozellikler", "module": "Modül 2: Cebir & Denklemler", "title": "Mutlak Değer Tanımı ve Dışarı Çıkarma Kuralları", "keywords": ["Mutlak Değer", "|x|"]},
    {"id": "33_mutlak_degerli_denklem_ve_esitsizlikler", "module": "Modül 2: Cebir & Denklemler", "title": "Mutlak Değerli Denklemler ve Eşitsizlikler", "keywords": ["|x| < a", "|x| = a"]},
    {"id": "34_uslu_sayilar_kurallar", "module": "Modül 2: Cebir & Denklemler", "title": "Üslü Sayıların Temel Kuralları (Çarpma, Bölme, Üssün Üssü)", "keywords": ["Üslü Sayılar", "a^m"]},
    {"id": "35_uslu_denklemler", "module": "Modül 2: Cebir & Denklemler", "title": "Üslü Denklemler ve Eşitsizlikler", "keywords": ["Üslü Denklemler", "Tabanlar eşit ise"]},
    {"id": "36_koklu_sayilar_tanim_ve_ozellikler", "module": "Modül 2: Cebir & Denklemler", "title": "Köklü Sayılar Tanımı, Kök Dışına Çıkarma & Dört İşlem", "keywords": ["Köklü Sayılar", "Kök derecesi"]},
    {"id": "37_koklu_sayilarda_eslenik_ve_ozel_kokler", "module": "Modül 2: Cebir & Denklemler", "title": "Köklü Sayılarda Eşlenik Çarpımı ve İç İçe Kökler", "keywords": ["Eşlenik", "İç içe kökler"]},
    {"id": "38_carpanlara_ayirma_ortak_parantez_gruplama", "module": "Modül 2: Cebir & Denklemler", "title": "Ortak Çarpan ve Gruplandırma Yöntemiyle Çarpanlara Ayırma", "keywords": ["ÇARPANLARA AYIRMA", "Gruplandırma"]},
    {"id": "39_ozdeslikler_iki_kare_farki_tam_kare", "module": "Modül 2: Cebir & Denklemler", "title": "Önemli Özdeşlikler (İki Kare Farkı a^2-b^2 ve Tam Kare (a+b)^2)", "keywords": ["İki Kare Farkı", "Tam Kare", "a^2 - b^2"]},
    {"id": "40_uc_terimli_ifadelerin_carpanlara_ayrilmasi", "module": "Modül 2: Cebir & Denklemler", "title": "ax^2+bx+c Üç Terimlilerin Çarpanlara Ayrılması ve Sadeleştirme", "keywords": ["ax^2+bx+c", "Sadeleştirme"]},
    {"id": "41_birinci_dereceden_denklemler", "module": "Modül 2: Cebir & Denklemler", "title": "I. Dereceden Bir ve İki Bilinmeyenli Denklem Sistemleri", "keywords": ["I. DERECEDEN DENKLEMLER", "Denklemleri tek değişken üzerine kurun"]},
    {"id": "42_oran_oranti_temel_ozellikler", "module": "Modül 2: Cebir & Denklemler", "title": "Oran - Orantı Bağıntıları ve Orantı Sabiti (k)", "keywords": ["ORAN - ORANTI", "Orantı sabiti"]},
    {"id": "43_oranti_cesitleri_dogru_ters_bilesik", "module": "Modül 2: Cebir & Denklemler", "title": "Doğru Orantı, Ters Orantı ve Bileşik Orantı", "keywords": ["ORANTI CESITLERI", "Doğru Orantı", "Ters Orantı"]},
    {"id": "44_ortalamalar_aritmetik_geometrik", "module": "Modül 2: Cebir & Denklemler", "title": "Aritmetik Ortalama ve Geometrik Ortalama", "keywords": ["Aritmetik Ortalama", "Geometrik Ortalama"]},

    # --- MODÜL 3: PROBLEMLER DÜNYASI ---
    {"id": "45_sayi_kesir_problemleri_denklem_kurma", "module": "Modül 3: Problemler", "title": "Sayı ve Kesir Problemlerinde Denklem Kurma Taktikleri", "keywords": ["Sayı Problemleri", "Kesir Problemleri"]},
    {"id": "46_kuyruk_mum_tel_problemleri", "module": "Modül 3: Problemler", "title": "Özel Soru Tipleri: Kuyruk, Tel Kesme ve Mum Problemleri", "keywords": ["Kuyruk", "Tel", "Mum"]},
    {"id": "47_yas_problemleri", "module": "Modül 3: Problemler", "title": "Yaş Problemleri (Yaş Farkının Değişmezliği Kuralı)", "keywords": ["Yaş Problemleri", "Yaş farkı sabittir"]},
    {"id": "48_isci_ve_havuz_problemleri", "module": "Modül 3: Problemler", "title": "İşçi ve Havuz Problemleri (Birim Zamanda Yapılan İş)", "keywords": ["İşçi Problemleri", "Havuz Problemleri"]},
    {"id": "49_karisim_problemleri", "module": "Modül 3: Problemler", "title": "Karışım Problemleri ve Saf Madde Yüzdesi Hesaplama", "keywords": ["Karışım Problemleri", "Saf madde oranı"]},
    {"id": "50_yuzde_problemleri_ve_100x_yontemi", "module": "Modül 3: Problemler", "title": "Yüzde Problemleri ve 100x Pratik Çözüm Yöntemi", "keywords": ["Yüzde Problemleri", "100x"]},
    {"id": "51_kar_zarar_iskonto_enflasyon", "module": "Modül 3: Problemler", "title": "Kâr - Zarar, İskonto (İndirim) ve Maliyet Problemleri", "keywords": ["Kâr - Zarar", "Maliyet", "İskonto"]},
    {"id": "52_hiz_hareket_temel_ve_ortalama_hiz", "module": "Modül 3: Problemler", "title": "Hız ve Hareket Problemleri (x = v . t) & Ortalama Hız", "keywords": ["Hız Problemleri", "Ortalama hız"]},
    {"id": "53_tren_tunel_dairesel_pist_akinti", "module": "Modül 3: Problemler", "title": "Özel Hareket Tipleri: Tren-Tünel, Dairesel Pist ve Akıntı Problemleri", "keywords": ["Tren", "Tünel", "Dairesel pist"]},
    {"id": "54_grafik_tablo_okuma_problemleri", "module": "Modül 3: Problemler", "title": "Grafik ve Tablo Okuma (Daire, Sütun ve Doğrusal Grafikler)", "keywords": ["Grafik Problemleri", "Doğrusal Grafikler", "Daire Grafiği"]},

    # --- MODÜL 4: İLERİ KONULAR & SAYISAL MANTIK ---
    {"id": "55_kumeler_tanim_ve_alt_kume", "module": "Modül 4: İleri Konular & Mantık", "title": "Kümeler, Eleman Sayısı ve Alt Küme Hesapları (2^n)", "keywords": ["Kümeler", "Alt küme"]},
    {"id": "56_kume_islemleri_kesisim_birlesim_fark", "module": "Modül 4: İleri Konular & Mantık", "title": "Kümelerde Kesişim, Birleşim, Fark ve Tümleme İşlemleri", "keywords": ["Kesişim", "Birleşim", "Fark"]},
    {"id": "57_kume_problemleri_venn_semasi", "module": "Modül 4: İleri Konular & Mantık", "title": "Küme Problemleri (Dil Bilenler, Spor Yapanlar & Venn Şeması)", "keywords": ["KÜME PROBLEMLERİ", "Yalnız bir dil bilenler"]},
    {"id": "58_ozel_tanimli_islem", "module": "Modül 4: İleri Konular & Mantık", "title": "Özel Tanımlı İşlem (Birim Eleman, Ters Eleman, Yutan Eleman)", "keywords": ["İşlem", "Birim eleman", "Ters eleman"]},
    {"id": "59_moduler_aritmetik_kalan_bulma", "module": "Modül 4: İleri Konular & Mantık", "title": "Modüler Aritmetik, Büyük Üslerin Kalanını Bulma ve Gün/Saat Problemleri", "keywords": ["MODÜLER ARİTMETİK", "Kalan sınıfları", "Gün - saat"]},
    {"id": "60_sayma_kurallari_ve_permutasyon", "module": "Modül 4: İleri Konular & Mantık", "title": "Temel Sayma Kuralları ve Permütasyon (Düz Sıralama)", "keywords": ["PERMÜTASYON", "P(n, r)"]},
    {"id": "61_tekrarli_permutasyon", "module": "Modül 4: İleri Konular & Mantık", "title": "Tekrarlı Permütasyon (Özdeş Nesneler ve Rakam Sıralamaları)", "keywords": ["TEKRARLI PERMÜTASVON", "Tekrarlı permütasyon"]},
    {"id": "62_kombinasyon_secme_ve_gruplama", "module": "Modül 4: İleri Konular & Mantık", "title": "Kombinasyon (Seçme, Alt Küme Seçimi ve Ekip Oluşturma)", "keywords": ["KOMBINASYON", "Kümeşer için kombinasyon"]},
    {"id": "63_geometrik_kombinasyon", "module": "Modül 4: İleri Konular & Mantık", "title": "Geometrik Kombinasyon (Doğru, Üçgen ve Dörtgen Sayısı Bulma)", "keywords": ["Geometrik kombinasyon", "Üçgen sayısı"]},
    {"id": "64_olasilik_hesabi_ve_kosullu_olasilik", "module": "Modül 4: İleri Konular & Mantık", "title": "Olasılık Hesabı (İstenen / Tüm Durumlar) & Bağımsız Olaylar", "keywords": ["OLASILIK", "İstenen durum"]},
    {"id": "65_fonksiyonlar_tanim_ve_deger_bulma", "module": "Modül 4: İleri Konular & Mantık", "title": "Fonksiyon Tanımı, Tanım/Değer Kümesi ve f(x) Değeri Bulma", "keywords": ["FONKSİYONLAR", "Tanım kümesi", "f(x)"]},
    {"id": "66_fonksiyon_turleri_birebir_orten_birim_ters", "module": "Modül 4: İleri Konular & Mantık", "title": "Birebir, Örten, Birim, Sabit ve Ters Fonksiyon (f^-1(x))", "keywords": ["Birebir fonksiyon", "Ters fonksiyon"]},
    {"id": "67_bileske_fonksiyon", "module": "Modül 4: İleri Konular & Mantık", "title": "Bileşke Fonksiyon ((f o g)(x)) ve Grafik Yorumlama", "keywords": ["Bileşke Fonksiyon", "f(g(x))"]},
    {"id": "68_sayisal_mantik_ve_sekil_akil_yurutme", "module": "Modül 4: İleri Konular & Mantık", "title": "Sayısal Mantık, Örüntüler, Sayı Dizileri ve Tablo/Şekil Yeteneği", "keywords": ["SAYISAL MANTIK", "Örüntü", "Akıl yürütme"]},

    # --- MODÜL 5: GEOMETRİ ---
    {"id": "69_dogruda_acilar_kurallar", "module": "Modül 5: Geometri", "title": "Doğruda Açılar (Z, M, U Kuralları, Yöndeş ve Ters Açılar)", "keywords": ["DOGRUDA AÇILAR", "Z kuralı", "M kuralı"]},
    {"id": "70_ucgende_acilar_temel_ozellikler", "module": "Modül 5: Geometri", "title": "Üçgende Açılar (İç ve Dış Açı Özellikleri, Muhteşem Üçlü)", "keywords": ["ÜÇGENDE AÇILAR", "İç açılar toplamı", "Muhteşem üçlü"]},
    {"id": "71_ucgende_aci_kenar_bagintilari", "module": "Modül 5: Geometri", "title": "Üçgende Açı - Kenar Bağıntıları (Üçgen Eşitsizliği)", "keywords": ["ÜÇGENDE AÇI - KENAR BAĞINTILARI", "Üçgen eşitsizliği"]},
    {"id": "72_dik_ucgen_pisagor_bagintisi", "module": "Modül 5: Geometri", "title": "Dik Üçgen & Pisagor Bağıntısı (a^2+b^2=c^2) ve Özel Üçgenler (3-4-5, 5-12-13...)", "keywords": ["Dik Üçgen", "Pisagor", "Özel üçgenler"]},
    {"id": "73_oklid_bagintilari_ve_ozel_acili_ucgenler", "module": "Modül 5: Geometri", "title": "Öklid Bağıntıları (h^2 = p . k) & Özel Açılı Üçgenler (30-60-90, 45-45-90)", "keywords": ["Öklid", "30-60-90"]},
    {"id": "74_ikizkenar_ve_eskenar_ucgen", "module": "Modül 5: Geometri", "title": "İkizkenar Üçgen (YAKİ Kuralı) ve Eşkenar Üçgen Özellikleri", "keywords": ["İkizkenar Üçgen", "Eşkenar Üçgen", "YAKİ"]},
    {"id": "75_ucgende_ic_ve_dis_aciortay", "module": "Modül 5: Geometri", "title": "Üçgende İç ve Dış Açıortay Teoremleri", "keywords": ["Açıortay", "İç açıortay teoremi"]},
    {"id": "76_ucgende_kenarortay_ve_agirlik_merkezi", "module": "Modül 5: Geometri", "title": "Kenarortay Bağıntıları, Ağırlık Merkezi (G Noktası) ve 312 Kuralı", "keywords": ["Kenarortay", "Ağırlık merkezi", "G noktası"]},
    {"id": "77_ucgende_alan_hesabi_ve_alan_dagitimi", "module": "Modül 5: Geometri", "title": "Üçgende Alan Formülleri (Taban x Yükseklik / 2, Sinüslü Alan)", "keywords": ["Üçgende Alan", "Sinüslü alan"]},
    {"id": "78_ucgende_benzerlik_ve_tales_kelebek", "module": "Modül 5: Geometri", "title": "Üçgende Benzerlik Teoremleri, Temel Orantı (Tales) ve Kelebek Benzerliği", "keywords": ["Üçgende Benzerlik", "Kelebek benzerliği", "Tales"]},
    {"id": "79_cokgenler_ve_duzgun_altigen_besgen", "module": "Modül 5: Geometri", "title": "Çokgenler, Düzgün Beşgen ve Düzgün Altıgen Özellikleri", "keywords": ["Çokgenler", "Düzgün Beşgen", "Düzgün Altıgen"]},
    {"id": "80_dortgenler_ve_paralelkenar_kare_dikdortgen_yamuk", "module": "Modül 5: Geometri", "title": "Özel Dörtgenler (Paralelkenar, Dikdörtgen, Kare, Eşkenar Dörtgen, Yamuk)", "keywords": ["DÖRTGENLER", "PARALELKENAR", "DIKDÖRTGEN", "KARE"]},
    {"id": "81_cemberde_acilar_ve_uzunluk_teget_kiris", "module": "Modül 5: Geometri", "title": "Çemberde Açılar (Merkez, Çevre, Teğet-Kiriş) ve Çemberde Uzunluk", "keywords": ["CEMBERDE AÇILAR", "Merkez açı", "Çevre açı"]},
    {"id": "82_dairede_alan_ve_yay_uzunlugu", "module": "Modül 5: Geometri", "title": "Dairede Alan (pi . r^2), Daire Dilimi ve Yay Uzunluğu", "keywords": ["Dairede Alan", "Yay uzunluğu"]},
    {"id": "83_kati_cisimler_prizma_silindir_koni_kure", "module": "Modül 5: Geometri", "title": "Katı Cisimler: Prizma, Silindir, Piramit, Koni ve Küre Hesapları", "keywords": ["KATI CİSİMLER", "DİKDÖRTGEN DİK PRİZMA", "Silindir"]},
    {"id": "84_analitik_geometri_nokta_ve_dogrunun_analitigi", "module": "Modül 5: Geometri", "title": "Analitik Geometri: Noktanın Analitiği, Eğim, Doğru Denklemi", "keywords": ["Analitik Geometri", "Noktanın Analitiği", "Doğrunun Eğimi"]}
]

print(f"Toplam {len(detailed_topics)} alt konu ve soru tipi tespit edildi.")

total_len = len(text)

for i, topic in enumerate(detailed_topics):
    pos = -1
    for kw in topic["keywords"]:
        m = list(re.finditer(re.escape(kw), text, re.IGNORECASE))
        if m:
            pos = m[0].start()
            break
            
    if pos == -1:
        pos = int((i / len(detailed_topics)) * total_len)
        
    topic["pos"] = pos

detailed_topics.sort(key=lambda x: x["pos"])

indexed_list = []

for i, topic in enumerate(detailed_topics):
    start = topic["pos"]
    end = detailed_topics[i+1]["pos"] if i + 1 < len(detailed_topics) else total_len
    
    if end <= start:
        end = min(total_len, start + 8000)
        
    chunk = text[start:end].strip()
    
    doc = f"# 2026 KPSS Matematik: {topic['title']}\n"
    doc += f"**Modül:** {topic['module']}\n"
    doc += f"> Kaynak: İlyas Güneş 2026 Video Ders Notu\n\n---\n\n"
    doc += chunk
    
    fn = f"{topic['id']}.md"
    with open(os.path.join(SUBUNITS_DIR, fn), "w", encoding="utf-8") as f:
        f.write(doc)
    with open(os.path.join(APP_SUBUNITS_DIR, fn), "w", encoding="utf-8") as f:
        f.write(doc)
        
    indexed_list.append({
        "id": topic["id"],
        "order": i + 1,
        "module": topic["module"],
        "title": topic["title"],
        "filename": fn,
        "char_count": len(chunk),
        "line_count": len(chunk.splitlines())
    })
    print(f"[{i+1:02d}/84] {topic['title'][:45]:<45} -> {fn:<35} ({len(chunk)} karakter)")

granular_meta = {
    "total_subtopics": len(indexed_list),
    "subtopics": indexed_list
}

with open("/data/data/com.termux/files/home/kpss-matematik-ai-mentor/subunits_index.json", "w", encoding="utf-8") as f:
    json.dump(granular_meta, f, ensure_ascii=False, indent=2)

with open("/data/data/com.termux/files/home/kpss-matematik-ai-mentor/app/public/subunits_index.json", "w", encoding="utf-8") as f:
    json.dump(granular_meta, f, ensure_ascii=False, indent=2)

print("\n✓ 84 Alt Konunun tamamı ayrı ayrı bağımsız .md dosyalarına ayrıldı ve indekslendi!")
