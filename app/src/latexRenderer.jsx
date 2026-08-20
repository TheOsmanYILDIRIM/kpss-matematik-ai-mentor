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

    // Render basic bold and newlines
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\n/g, '<br/>');

    containerRef.current.innerHTML = processed;
  }, [text]);

  return <div ref={containerRef} className="math-content text-slate-200" />;
};
