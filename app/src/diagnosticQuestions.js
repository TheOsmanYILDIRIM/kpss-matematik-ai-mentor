// 2026 KPSS Matematik 12 Soruluk Kapsamlı Seviye Tespit & Röntgen Testi
// Kitabın tüm ana modüllerinden seçilmiş orijinal soru kalıpları

export const DIAGNOSTIC_TEST = [
  {
    id: "d_01",
    topicId: "01_temel_islemler",
    topicTitle: "Temel İşlemler & Dört İşlem",
    question: "$$ 12 - 4 \\cdot [ 3 - (-2) ] + (-18) \\div 3 $$ işleminin sonucu kaçtır?",
    options: ["A) -14", "B) -12", "C) -10", "D) 8", "E) 14"],
    correctOption: "A) -14",
    correctAnswer: "-14",
    weaknessOnFail: "Dört işlemde parantez önceliği ve negatif işaret dağıtma eksikliği",
    prerequisite: "01_temel_islemler"
  },
  {
    id: "d_02",
    topicId: "02_temel_kavramlar",
    topicTitle: "Temel Kavramlar & Sayı Kümeleri",
    question: "$a, b \\in \\mathbb{Z}^+$ olmak üzere, $$ 3a + 5b = 49 $$ olduğuna göre, $a$'nın alabileceği en büyük değer kaçtır?",
    options: ["A) 11", "B) 12", "C) 13", "D) 14", "E) 15"],
    correctOption: "C) 13",
    correctAnswer: "13",
    weaknessOnFail: "Pozitif tam sayılarda katsayı dengeleme ve değer verme yöntemi eksikliği",
    prerequisite: "02_temel_kavramlar"
  },
  {
    id: "d_03",
    topicId: "03_tek_cift_sayilar",
    topicTitle: "Tek ve Çift Sayılar",
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
    weaknessOnFail: "Tek-Çift sayılarda içler-dışlar çarpımı ve parite analizi eksikliği",
    prerequisite: "03_tek_cift_sayilar"
  },
  {
    id: "d_04",
    topicId: "05_ardisik_sayilar",
    topicTitle: "Ardışık Sayılar & Terim Sayısı",
    question: "Ardışık 5 tek sayının toplamı 85 olduğuna göre, bu sayıların en büyüğü kaçtır?",
    options: ["A) 17", "B) 19", "C) 21", "D) 23", "E) 25"],
    correctOption: "C) 21",
    correctAnswer: "21",
    weaknessOnFail: "Ardışık sayılarda ortanca terim bulma formülü eksikliği",
    prerequisite: "05_ardisik_sayilar"
  },
  {
    id: "d_05",
    topicId: "07_sayi_basamaklari",
    topicTitle: "Sayı Basamakları & Çözümleme",
    question: "İki basamaklı $AB$ ve $BA$ sayıları için $$ AB - BA = 45 $$ olduğuna göre, bu koşulu sağlayan kaç farklı $AB$ sayısı yazılabilir?",
    options: ["A) 3", "B) 4", "C) 5", "D) 6", "E) 7"],
    correctOption: "B) 4",
    correctAnswer: "4",
    weaknessOnFail: "Basamak çözümleme ($10A+B - 10B-A = 9(A-B)$) kuralı eksikliği",
    prerequisite: "07_sayi_basamaklari"
  },
  {
    id: "d_06",
    topicId: "10_bolunebilme",
    topicTitle: "Bölünebilme Kuralları",
    question: "Dört basamaklı $3a4b$ sayısı 36 ile tam bölünebildiğine göre, $a$'nın alabileceği değerler toplamı kaçtır?",
    options: ["A) 11", "B) 13", "C) 15", "D) 17", "E) 19"],
    correctOption: "A) 11",
    correctAnswer: "11",
    weaknessOnFail: "Aralarında asal çarpanlara bölünebilme (4 ve 9 kuralı) analizi eksikliği",
    prerequisite: "10_bolunebilme"
  },
  {
    id: "d_07",
    topicId: "13_rasyonel_sayilar",
    topicTitle: "Rasyonel Sayılar",
    question: "$$ \\frac{2 - \\frac{1}{3}}{1 + \\frac{1}{2}} \\cdot \\frac{9}{5} $$ işleminin sonucu kaçtır?",
    options: ["A) 1", "B) 2", "C) 3", "D) 4", "E) 5"],
    correctOption: "B) 2",
    correctAnswer: "2",
    weaknessOnFail: "Rasyonel sayılarda merdivenli kesir ve ters çevirip çarpma kuralı eksikliği",
    prerequisite: "13_rasyonel_sayilar"
  },
  {
    id: "d_08",
    topicId: "15_basit_esitsizlikler",
    topicTitle: "Basit Eşitsizlikler",
    question: "$-3 < x \\le 4$ ve $y = 2x - 1$ olduğuna göre, $y$'nin alabileceği tam sayı değerlerinin toplamı kaçtır?",
    options: ["A) 7", "B) 9", "C) 14", "D) 15", "E) 21"],
    correctOption: "A) 7",
    correctAnswer: "7",
    weaknessOnFail: "Aralık genişletme ve sınır dahil/hariç durum analizi eksikliği",
    prerequisite: "15_basit_esitsizlikler"
  },
  {
    id: "d_09",
    topicId: "16_mutlak_deger",
    topicTitle: "Mutlak Değer",
    question: "$$ |2x - 6| + |3 - x| = 12 $$ denklemini sağlayan $x$ değerlerinin çarpımı kaçtır?",
    options: ["A) -7", "B) -5", "C) 0", "D) 5", "E) 7"],
    correctOption: "A) -7",
    correctAnswer: "-7",
    weaknessOnFail: "Mutlak değerde ortak parantez ($|2x-6| = 2|x-3|$) kuralı eksikliği",
    prerequisite: "16_mutlak_deger"
  },
  {
    id: "d_10",
    topicId: "17_uslu_sayilar",
    topicTitle: "Üslü Sayılar",
    question: "$$ \\frac{3^{x+2} + 3^{x+1}}{3^{x-1}} = 108 $$ olduğuna göre, $x$ kaçtır?",
    options: ["A) Tüm reel sayılar için daima 36 çıkar", "B) x = 2", "C) x = 3", "D) x = 4", "E) x = 5"],
    correctOption: "A) Tüm reel sayılar için daima 36 çıkar",
    correctAnswer: "36",
    weaknessOnFail: "Üslü ifadelerde ortak paranteze alma ve taban üs sadeleştirme kuralı eksikliği",
    prerequisite: "17_uslu_sayilar"
  },
  {
    id: "d_11",
    topicId: "22_sayi_kesir_problemleri",
    topicTitle: "Sayı & Kesir Problemleri",
    question: "Bir telin bir ucundan $\\frac{1}{6}$'sı kesildiğinde telin orta noktası $5\\text{ cm}$ kaymaktadır. Buna göre, telin başlangıçtaki uzunluğu kaç cm'dir?",
    options: ["A) 40", "B) 50", "C) 60", "D) 70", "E) 80"],
    correctOption: "C) 60",
    correctAnswer: "60",
    weaknessOnFail: "Orta nokta kayma miktarı ($x/2 = \\text{kesilen}/2$) formülü eksikliği",
    prerequisite: "22_sayi_kesir_problemleri"
  },
  {
    id: "d_12",
    topicId: "26_yuzde_kar_zarar_problemleri",
    topicTitle: "Yüzde & Kâr - Zarar Problemleri",
    question: "Bir ürün %20 kârla 360 TL'ye satılmaktadır. Bu ürün %10 zararla satılsaydı satış fiyatı kaç TL olurdu?",
    options: ["A) 250", "B) 260", "C) 270", "D) 280", "E) 290"],
    correctOption: "C) 270",
    correctAnswer: "270",
    weaknessOnFail: "Maliyet belirleme ($100x$) ve yüzde-zarar hesaplama kuralı eksikliği",
    prerequisite: "26_yuzde_kar_zarar_problemleri"
  }
];
