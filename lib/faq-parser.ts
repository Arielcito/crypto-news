export type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_SECTION_HEADING_RE =
  /^(#{2,3})\s+(preguntas frecuentes|faq|preguntas y respuestas|q[u]?&a)\s*$/im;

function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts an FAQPage-shape list from a markdown body when the author has
 * marked a section as "Preguntas frecuentes" / "FAQ" / "Q&A".
 *
 * Recognises the section heading at h2/h3 level and treats the immediately
 * deeper heading level as the question. Stops at the next heading of equal
 * or shallower depth than the section heading.
 */
export function extractFaqs(markdown: string): FaqItem[] {
  if (!markdown) return [];

  const sectionMatch = markdown.match(FAQ_SECTION_HEADING_RE);
  if (!sectionMatch) return [];

  const sectionLevel = sectionMatch[1].length;
  const sectionStart = sectionMatch.index! + sectionMatch[0].length;

  const stopHeadingRe = new RegExp(
    `^#{1,${sectionLevel}}\\s+`,
    "m",
  );
  const afterSection = markdown.slice(sectionStart);
  const stopMatch = afterSection.match(stopHeadingRe);
  const body = stopMatch
    ? afterSection.slice(0, stopMatch.index)
    : afterSection;

  const questionLevel = sectionLevel + 1;
  const questionMarker = "#".repeat(questionLevel);
  const questionRe = new RegExp(
    `^${questionMarker}\\s+(.+?)\\s*$`,
    "gm",
  );

  const items: FaqItem[] = [];
  const questions: { text: string; index: number; end: number }[] = [];

  let match;
  while ((match = questionRe.exec(body)) !== null) {
    questions.push({
      text: match[1],
      index: match.index,
      end: match.index + match[0].length,
    });
  }

  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    const next = questions[i + 1];
    const rawAnswer = body.slice(q.end, next ? next.index : undefined);
    const answer = cleanInlineMarkdown(rawAnswer);
    const question = cleanInlineMarkdown(q.text);
    if (question && answer) {
      items.push({ question, answer });
    }
  }

  return items;
}
