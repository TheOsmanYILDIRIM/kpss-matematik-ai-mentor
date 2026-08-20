// 2026 KPSS Matematik 15 Soruluk Kapsamlı Seviye Tespit & Röntgen Testi
// 84 Alt Konu & 5 Temel Modülü (Temel İşlemler, Sayılar, Cebir, Problemler, İleri Mantık, Geometri)
// Görselleri ve orijinal İlyas Güneş soru kalıplarını kapsayacak şekilde güncellenmiştir.

export const DIAGNOSTIC_TEST = [
  // 1. DÖRT İŞLEM & İŞARET KURALLARI
  {
    id: "d_01",
    subtopicId: "01_isaretler_tablosu",
    topicTitle: "İşaretler Tablosu & Parantez Açma",
    module: "Modül 1: Temel Matematik & Dört İşlem",
    question: "$$ 12 - 4 \\cdot [ 3 - (-2) ] + (-18) \\div 3 $$ işleminin sonucu kaçtır?",
    options: ["A) -14", "B) -12", "C) -10", "D) 8", "E) 14"],
    correctOption: "A) -14",
    correctAnswer: "-14",
    weaknessOnFail: "Dört işlemde parantez önceliği ve negatif işaret dağıtma eksikliği",
    prerequisite: "01_isaretler_tablosu"
  },
  // 2. SAYI KÜMELERİ & POZİTİF-NEGATİF SAYILAR
  {
    id: "d_02",
    subtopicId: "10_sayi_kumeleri",
    topicTitle: "Sayı Kümeleri & Değer Verme",
    module: "Modül 1: Sayılar Teorisi",
    question: "$a, b \\in \\mathbb{Z}^+$ olmak üzere, $$ 3a + 5b = 49 $$ olduğuna göre, $a$'nın alabileceği en büyük değer kaçtır?",
    options: ["A) 11", "B) 12", "C) 13", "D) 14", "E) 15"],
    correctOption: "C) 13",
    correctAnswer: "13",
    weaknessOnFail: "Pozitif tam sayılarda katsayı dengeleme ve değer verme yöntemi eksikliği",
    prerequisite: "10_sayi_kumeleri"
  },
  // 3. TEK VE ÇİFT SAYILAR
  {
    id: "d_03",
    subtopicId: "12_tek_cift_sayilar",
    topicTitle: "Tek ve Çift Sayılar & Parite",
    module: "Modül 1: Sayılar Teorisi",
    question: "$a, b, c$ pozitif tam sayılar olmak üzere, $$ \\frac{a \\cdot b + 3}{4} = c $$ olduğuna göre, aşağıdakilerden hangisi kesinlikle doğrudur?",
    options: [
      "A) c tek sayıdır.",
      "B) c çift sayıdır.",
      "C) a ve b tek sayılardır.",
      "D) a ve b çift sayılardır.",
      "E) a tek, b çift sayıdır."
    ],
    correctOption: "C) a ve b tek sayılardır.",
    correctAnswer: "C",
    weaknessOnFail: "Tek-Çift sayılarda içler-dışlar çarpımı ve çarpım paritesi analizi eksikliği",
    prerequisite: "12_tek_cift_sayilar"
  },
  // 4. ARDIŞIK SAYILAR & TOPLAM FORMÜLLERİ
  {
    id: "d_04",
    subtopicId: "16_ardisik_sayilar_toplam_formul",
    topicTitle: "Ardışık Sayılar & Gauss Toplam Formülleri",
    module: "Modül 1: Sayılar Teorisi",
    question: "Ardışık 5 tek sayının toplamı 85 olduğuna göre, bu sayıların en büyüğü kaçtır?",
    options: ["A) 17", "B) 19", "C) 21", "D) 23", "E) 25"],
    correctOption: "C) 21",
    correctAnswer: "21",
    weaknessOnFail: "Ardışık sayılarda ortanca terim bulma ve terim sayısı formülü eksikliği",
    prerequisite: "16_ardisik_sayilar_toplam_formul"
  },
  // 5. SAYI BASAMAKLARI & ÇÖZÜMLEME
  {
    id: "d_05",
    subtopicId: "18_sayi_basamaklari_cozumleme",
    topicTitle: "Sayı Basamakları & Basamak Çözümleme",
    module: "Modül 1: Sayılar Teorisi",
    question: "İki basamaklı $AB$ ve $BA$ sayıları için $$ AB - BA = 45 $$ olduğuna göre, bu koşulu sağlayan kaç farklı $AB$ sayısı yazılabilir?",
    options: ["A) 3", "B) 4", "C) 5", "D) 6", "E) 7"],
    correctOption: "B) 4",
    correctAnswer: "4",
    weaknessOnFail: "Basamak çözümlemede 9(A - B) fark modellemesi eksikliği",
    prerequisite: "18_sayi_basamaklari_cozumleme"
  },
  // 6. ASAL ÇARPANLAR, EBOB & EKOK
  {
    id: "d_06",
    subtopicId: "24_ebob_ekok_tanim_ve_hesaplama",
    topicTitle: "Asal Çarpanlar, EBOB ve EKOK",
    module: "Modül 1: Sayılar Teorisi",
    question: "Boyutları $24\\text{ m}$ ve $36\\text{ m}$ olan dikdörtgen şeklindeki bir bahçenin etrafına ve köşelerine eşit aralıklarla fidan dikilecektir. En az kaç fidan gerekir?",
    options: ["A) 8", "B) 10", "C) 12", "D) 15", "E) 18"],
    correctOption: "B) 10",
    correctAnswer: "10",
    weaknessOnFail: "EBOB ile parselleme ve çevre bölme problemleri kurgusu eksikliği",
    prerequisite: "24_ebob_ekok_tanim_ve_hesaplama"
  },
  // 7. RASYONEL & ONDALIKLI SAYILAR
  {
    id: "d_07",
    subtopicId: "27_merdivenli_kesirler",
    topicTitle: "Rasyonel Sayılar & Merdivenli Kesirler",
    module: "Modül 2: Cebir & Denklemler",
    question: "$$ \\frac{1 - \\frac{1}{3}}{1 + \\frac{1}{2}} \\div \\frac{4}{9} $$ işleminin sonucu kaçtır?",
    options: ["A) 1", "B) 3/2", "C) 4/3", "D) 2", "E) 5/2"],
    correctOption: "A) 1",
    correctAnswer: "1",
    weaknessOnFail: "Rasyonel kesirlerde merdivenli basamak adımları ve bölme ters çevirme kuralı",
    prerequisite: "27_merdivenli_kesirler"
  },
  // 8. BASİT EŞİTSİZLİKLER & MUTLAK DEĞER
  {
    id: "d_08",
    subtopicId: "33_mutlak_degerli_denklem_ve_esitsizlikler",
    topicTitle: "Basit Eşitsizlikler & Mutlak Değer",
    module: "Modül 2: Cebir & Denklemler",
    question: "$$ |2x - 5| \\le 7 $$ eşitsizliğini sağlayan kaç farklı $x$ tam sayı değeri vardır?",
    options: ["A) 6", "B) 7", "C) 8", "D) 9", "E) 10"],
    correctOption: "C) 8",
    correctAnswer: "8",
    weaknessOnFail: "Mutlak değer açılımı ($-a \\le f(x) \\le a$) ve sınır tam sayı sayımı eksikliği",
    prerequisite: "33_mutlak_degerli_denklem_ve_esitsizlikler"
  },
  // 9. ÜSLÜ VE KÖKLÜ SAYILAR
  {
    id: "d_09",
    subtopicId: "37_koklu_sayilarda_eslenik_ve_ozel_kokler",
    topicTitle: "Üslü & Köklü Sayılar (Eşlenik)",
    module: "Modül 2: Cebir & Denklemler",
    question: "$$ \\frac{\\sqrt{48} - \\sqrt{12}}{\\sqrt{3}} + \\frac{6}{\\sqrt{3}} $$ işleminin sonucu kaçtır?",
    options: ["A) $2\\sqrt{3}$", "B) $3\\sqrt{3}$", "C) $2 + 2\\sqrt{3}$", "D) 4", "E) 6"],
    correctOption: "C) $2 + 2\\sqrt{3}$",
    correctAnswer: "2 + 2√3",
    weaknessOnFail: "Köklü ifadeleri $a\\sqrt{b}$ şeklinde çıkarma ve paydayı eşlenikle rasyonel yapma eksikliği",
    prerequisite: "37_koklu_sayilarda_eslenik_ve_ozel_kokler"
  },
  // 10. ÇARPANLARA AYIRMA & ÖZDEŞLİKLER
  {
    id: "d_10",
    subtopicId: "39_ozdeslikler_iki_kare_farki_tam_kare",
    topicTitle: "Çarpanlara Ayırma & Özdeşlikler",
    module: "Modül 2: Cebir & Denklemler",
    question: "$x - y = 4$ ve $x \\cdot y = 5$ olduğuna göre, $$ x^2 + y^2 $$ toplamı kaçtır?",
    options: ["A) 16", "B) 21", "C) 26", "D) 31", "E) 36"],
    correctOption: "C) 26",
    correctAnswer: "26",
    weaknessOnFail: "Tam kare açılımı $(x-y)^2 = x^2 - 2xy + y^2$ özdeşlik dönüşümü eksikliği",
    prerequisite: "39_ozdeslikler_iki_kare_farki_tam_kare"
  },
  // 11. SAYI-KESİR & YAŞ PROBLEMLERİ
  {
    id: "d_11",
    subtopicId: "45_sayi_kesir_problemleri_denklem_kurma",
    topicTitle: "Sayı - Kesir & Problem Kurma",
    module: "Modül 3: Problemler Dünyası",
    question: "Bir telin ucundan $\\frac{1}{6}$'sı kesildiğinde orta noktası $5\\text{ cm}$ kaymaktadır. Buna göre telin kesilmeden önceki boyu kaç cm'dir?",
    options: ["A) 40", "B) 50", "C) 60", "D) 70", "E) 80"],
    correctOption: "C) 60",
    correctAnswer: "60",
    weaknessOnFail: "Tel kesme sorularında orta noktanın kesilen miktarın yarısı kadar kayması kuralı eksikliği",
    prerequisite: "45_sayi_kesir_problemleri_denklem_kurma"
  },
  // 12. YÜZDE, KÂR-ZARAR VE KARIŞIM PROBLEMLERİ
  {
    id: "d_12",
    subtopicId: "50_yuzde_problemleri_ve_100x_yontemi",
    topicTitle: "Yüzde, Kâr-Zarar & 100x Metodu",
    module: "Modül 3: Problemler Dünyası",
    question: "Bir satıcı bir ürünü %20 kârla 180 TL'ye satmaktadır. Bu ürünün maliyet fiyatı kaç TL'dir?",
    options: ["A) 140", "B) 144", "C) 150", "D) 155", "E) 160"],
    correctOption: "C) 150",
    correctAnswer: "150",
    weaknessOnFail: "Maliyete 100x diyerek satış fiyatı kurgulama tekniği eksikliği",
    prerequisite: "50_yuzde_problemleri_ve_100x_yontemi"
  },
  // 13. KÜMELER, PERMÜTASYON & OLASILIK
  {
    id: "d_13",
    subtopicId: "64_olasilik_hesabi_ve_kosullu_olasilik",
    topicTitle: "Permütasyon, Kombinasyon & Olasılık",
    module: "Modül 4: İleri Konular & Mantık",
    question: "3 kız ve 4 erkek öğrenci arasından rastgele seçilen 3 kişilik bir grupta en az 1 kız öğrenci bulunma olasılığı kaçtır?",
    options: ["A) 4/35", "B) 31/35", "C) 27/35", "D) 18/35", "E) 3/7"],
    correctOption: "B) 31/35",
    correctAnswer: "31/35",
    weaknessOnFail: "Olasılıkta tümleyen kuralı ($1 - P(\\text{hiç kız yok})$) ve kombinasyon seçimi",
    prerequisite: "64_olasilik_hesabi_ve_kosullu_olasilik"
  },
  // 14. FONKSİYONLAR & GRAFİK OKUMA
  {
    id: "d_14",
    subtopicId: "67_bileske_fonksiyon",
    topicTitle: "Fonksiyonlar & Bileşke / Ters Fonksiyon",
    module: "Modül 4: İleri Konular & Mantık",
    question: "$f(x) = 2x - 3$ ve $g(x) = x + 4$ olduğuna göre, $$ (f \\circ g)(2) $$ değeri kaçtır?",
    options: ["A) 5", "B) 7", "C) 9", "D) 11", "E) 13"],
    correctOption: "C) 9",
    correctAnswer: "9",
    weaknessOnFail: "Bileşke fonksiyonda içten dışa değer yazma sıralaması eksikliği",
    prerequisite: "67_bileske_fonksiyon"
  },
  // 15. GEOMETRİ: DİK ÜÇGEN, ÖZEL ÜÇGENLER & ALAN
  {
    id: "d_15",
    subtopicId: "72_dik_ucgen_pisagor_bagintisi",
    topicTitle: "Geometri: Dik Üçgen & Pisagor Bağıntısı",
    module: "Modül 5: Geometri",
    question: "Hipotenüs uzunluğu 13 cm olan bir dik üçgenin dik kenarlarından biri 5 cm olduğuna göre, bu üçgenin alanı kaç $\\text{cm}^2$'dir?",
    options: ["A) 24", "B) 30", "C) 36", "D) 48", "E) 60"],
    correctOption: "B) 30",
    correctAnswer: "30",
    weaknessOnFail: "5-12-13 özel dik üçgeni tanıma ve dik üçgende alan ($a \\cdot b / 2$) formülü",
    prerequisite: "72_dik_ucgen_pisagor_bagintisi"
  }
];
