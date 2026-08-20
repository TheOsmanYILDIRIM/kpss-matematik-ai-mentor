import React, { useEffect, useRef } from 'react';
import katex from 'katex';

export const MathText = ({ text }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    let processed = text;
    
    // Replace $$ ... $$ display math
    processed = processed.replace(/\$\$(.+?)\$\$/gs, (match, formula) => {
      try {
        return `<div class="my-3 overflow-x-auto text-center">${katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch (e) {
        return match;
      }
    });

    // Replace $ ... $ inline math
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    // Replace ![alt](images/...) markdown images with responsive HTML img tags
    const baseUrl = import.meta.env.BASE_URL || '/';
    processed = processed.replace(/!\[(.*?)\]\((images\/[^)]+)\)/g, (match, alt, src) => {
      const fullSrc = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}${src}`;
      return `<div class="my-3 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800"><img src="${fullSrc}" alt="${alt}" class="max-h-64 rounded-lg object-contain shadow-md" loading="lazy"/><span class="text-[10px] text-slate-500 mt-1">${alt}</span></div>`;
    });

    // Render basic bold and newlines
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\n/g, '<br/>');

    containerRef.current.innerHTML = processed;
  }, [text]);

  return <div ref={containerRef} className="math-content text-slate-200" />;
};
