import zipfile
import re
import os
import json

EPUB_PATH = "/storage/emulated/0/Download/Notlar_Epublib_1787237337185.epub"
BASE_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor"
APP_DIR = "/data/data/com.termux/files/home/kpss-matematik-ai-mentor/app"

REPO_IMG_DIR = os.path.join(BASE_DIR, "images")
APP_IMG_DIR = os.path.join(APP_DIR, "public", "images")
os.makedirs(REPO_IMG_DIR, exist_ok=True)
os.makedirs(APP_IMG_DIR, exist_ok=True)

print("1. EPUB içindeki tüm 598 görsel çıkartılıyor...")
with zipfile.ZipFile(EPUB_PATH, 'r') as z:
    for name in z.namelist():
        if name.startswith('OEBPS/images/') and not name.endswith('/'):
            filename = os.path.basename(name)
            content = z.read(name)
            with open(os.path.join(REPO_IMG_DIR, filename), 'wb') as f:
                f.write(content)
            with open(os.path.join(APP_IMG_DIR, filename), 'wb') as f:
                f.write(content)
            
    with z.open('OEBPS/content.xhtml') as f:
        html = f.read().decode('utf-8', errors='ignore')

print("2. HTML içeriği temizlenip zengin Markdown formatına dönüştürülüyor...")

# Temizleme
# <div class="img-container"><img src="images/image0.jpg" alt="Görsel" /></div> -> ![Görsel](images/image0.jpg)
md_text = html

# Remove header/style/script tags
md_text = re.sub(r'<\?xml[^>]*\?>', '', md_text)
md_text = re.sub(r'<!DOCTYPE[^>]*>', '', md_text)
md_text = re.sub(r'<html[^>]*>', '', md_text)
md_text = re.sub(r'<head>[\s\S]*?</head>', '', md_text)
md_text = re.sub(r'</?body>', '', md_text)
md_text = re.sub(r'</html>', '', md_text)

# Convert headers
md_text = re.sub(r'<h1>(.*?)</h1>', r'# \1\n', md_text)
md_text = re.sub(r'<h2>(.*?)</h2>', r'## \1\n', md_text)
md_text = re.sub(r'<h3>(.*?)</h3>', r'### \1\n', md_text)
md_text = re.sub(r'<h4>(.*?)</h4>', r'#### \1\n', md_text)
md_text = re.sub(r'<h5>(.*?)</h5>', r'##### \1\n', md_text)

# Convert img tags
md_text = re.sub(r'<div class="img-container"><img src="images/([^"]+)" alt="[^"]*" /></div>', r'![Şekil/Grafik/Soru](images/\1)', md_text)
md_text = re.sub(r'<img src="images/([^"]+)" alt="[^"]*" />', r'![Şekil/Grafik/Soru](images/\1)', md_text)

# Clean leftover escape sequences and breaks
md_text = re.sub(r'&lt;div style="text-align: center;"&gt;&lt;img src="', '', md_text)
md_text = re.sub(r'" alt="Image" width="[^"]*" /&gt;&lt;/div&gt;', '', md_text)
md_text = re.sub(r'<br\s*/?>', '\n', md_text)
md_text = re.sub(r'\n{3,}', '\n\n', md_text)

# Tam metni kaydet
with open(os.path.join(BASE_DIR, "kpss_matematik_tam_metin_resimli.md"), "w", encoding="utf-8") as f:
    f.write(md_text.strip())

print("3. Resimli tam metin kaydedildi. Şimdi 84 alt konuya görselleriyle birlikte bölünüyor...")

# 84 Alt Konu Ayrıştırma
with open(os.path.join(BASE_DIR, "subunits_index.json"), "r", encoding="utf-8") as f:
    subunits_meta = json.load(f)

# Tüm alt konuları resimli metin üzerinden dilimleyelim
total_len = len(md_text)
subtopics = subunits_meta["subtopics"]

for i, sub in enumerate(subtopics):
    # Anahtar kelimelerle arama
    clean_title = re.escape(sub["title"].split('(')[0].split('&')[0].strip())
    m = list(re.finditer(clean_title, md_text, re.IGNORECASE))
    pos = m[0].start() if m else int((i / len(subtopics)) * total_len)
    sub["pos"] = pos

subtopics.sort(key=lambda x: x["pos"])

for i, sub in enumerate(subtopics):
    start = sub["pos"]
    end = subtopics[i+1]["pos"] if i + 1 < len(subtopics) else total_len
    if end <= start:
        end = min(total_len, start + 10000)
    
    chunk = md_text[start:end].strip()
    
    # Check if chunk has embedded images
    imgs_in_chunk = re.findall(r'!\[.*?\]\((images/[^)]+)\)', chunk)
    
    doc = f"# 2026 KPSS Matematik: {sub['title']}\n"
    doc += f"**Modül:** {sub['module']}\n"
    doc += f"> Kaynak: İlyas Güneş 2026 Video Ders Notu (Resimli & Formüllü EPUB Sürümü)\n\n---\n\n"
    doc += chunk
    
    fn = sub["filename"]
    p1 = os.path.join(BASE_DIR, "subunits", fn)
    p2 = os.path.join(APP_DIR, "public", "subunits", fn)
    
    with open(p1, "w", encoding="utf-8") as f1:
        f1.write(doc)
    with open(p2, "w", encoding="utf-8") as f2:
        f2.write(doc)
        
    sub["images_count"] = len(imgs_in_chunk)

print("\n✓ 598 Görselin tamamı entegre edildi, 84 alt konu resimli olarak güncellendi!")
