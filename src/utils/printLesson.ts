import { BaseActivityConfig, DictionaryEntry } from "../types";

export function printLesson(lesson: any, dictionaryWords: DictionaryEntry[] = []) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Print - ${lesson.title}</title>
      <style>
        body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
        h1 { font-size: 24px; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { font-size: 20px; margin-top: 30px; margin-bottom: 10px; color: #555; }
        .activity { margin-bottom: 30px; page-break-inside: avoid; }
        .flashcard-item { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 8px 0; }
        .flashcard-item strong { min-width: 150px; }
        .cloze-sentence { font-size: 16px; margin-bottom: 10px; }
        .cloze-blank { display: inline-block; width: 100px; border-bottom: 1px solid #000; }
        .dictation-item { display: flex; gap: 10px; align-items: center; margin-bottom: 15px; }
        .dictation-blank { flex-grow: 1; border-bottom: 1px solid #000; height: 24px; }
        .matching-container { display: flex; justify-content: space-between; }
        .matching-col { flex: 1; }
        .matching-item { padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${lesson.title}</h1>
      <p>${lesson.desc || ''}</p>
      
      ${lesson.activities.map((act: any, idx: number) => {
        let content = '';
        if (act.type === 'Flashcards') {
          const words = (act.flashcardWordIds || []).map((id: string) => dictionaryWords.find(w => w.id === id)).filter(Boolean);
          if (words.length > 0) {
            content = words.map((w: any) => `
              <div class="flashcard-item">
                <strong>${w.lemma || w.word}</strong>
                <span>${w.senses?.[0]?.translation_ar || w.translation || ''}</span>
              </div>
            `).join('');
          } else {
            content = `<p><em>Vocabulary list (No words assigned)</em></p>`;
          }
        } else if (act.type === 'Cloze') {
          content = `
            <div class="cloze-sentence">
              ${act.clozeSentenceBefore || 'Sentence before'} 
              <span class="cloze-blank"></span> 
              ${act.clozeSentenceAfter || 'Sentence after'}
            </div>
          `;
        } else if (act.type === 'Dictation') {
          content = (act.dictationSlides || []).map((slide: any, sIdx: number) => `
            <div class="dictation-item">
              <span>${sIdx + 1}. Audio Segment</span>
              <div class="dictation-blank"></div>
            </div>
          `).join('');
        } else if (act.type === 'Matching') {
          const pairs = act.matchingPairs || [];
          const lefts = [...pairs].sort(() => Math.random() - 0.5);
          const rights = [...pairs].sort(() => Math.random() - 0.5);
          
          content = `
            <div class="matching-container">
              <div class="matching-col" style="margin-right: 20px;">
                <strong>Terms</strong>
                ${lefts.map((p: any) => `<div class="matching-item">${p.left}</div>`).join('')}
              </div>
              <div class="matching-col">
                <strong>Definitions / Translations</strong>
                ${rights.map((p: any) => `<div class="matching-item">${p.right}</div>`).join('')}
              </div>
            </div>
          `;
        } else {
          content = `<p>Activity type: ${act.type}</p>`;
        }

        return `
          <div class="activity">
            <h2>${idx + 1}. ${act.title || act.type}</h2>
            ${content}
          </div>
        `;
      }).join('')}
      
      <div style="margin-top: 40px;">
        <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer; border-radius: 8px; background: #6366f1; color: white; border: none; font-weight: bold;">Print to PDF</button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
