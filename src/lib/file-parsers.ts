/**
 * Client-side file parsing for knowledge base uploads.
 * Supports .txt, .csv, .json, .docx, .doc, and .md
 */

import mammoth from "mammoth";

export type ParsedArticle = {
  title: string;
  content: string;
  category?: string;
};

export type ParseResult = {
  articles: ParsedArticle[];
  errors: string[];
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (increased for docx)

export async function parseFileToArticles(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      articles: [],
      errors: [`File "${file.name}" exceeds 10MB limit`],
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();

  // Binary formats — read as ArrayBuffer
  if (ext === "docx" || ext === "doc") {
    const buffer = await file.arrayBuffer();
    return parseDocx(file.name, buffer);
  }

  // Text formats — read as string
  const raw = await file.text();
  const text = raw
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  switch (ext) {
    case "txt":
      return parseTxt(file.name, text);
    case "md":
      return parseMd(file.name, text);
    case "csv":
      return parseCsv(text);
    case "json":
      return parseJson(text);
    default:
      return {
        articles: [],
        errors: [
          `Unsupported file type: .${ext}. Use .txt, .csv, .json, .md, .docx, or .doc`,
        ],
      };
  }
}

// ── DOCX / DOC ────────────────────────────────────────────

async function parseDocx(
  filename: string,
  buffer: ArrayBuffer
): Promise<ParseResult> {
  let html: string;
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    html = result.value;
    // Log any conversion warnings for debugging
    if (result.messages.length > 0) {
      console.warn(
        "mammoth warnings:",
        result.messages.map((m) => m.message)
      );
    }
  } catch (err) {
    const isDoc = filename.toLowerCase().endsWith(".doc");
    return {
      articles: [],
      errors: [
        isDoc
          ? `Could not parse "${filename}". The legacy .doc format has limited support — please save as .docx and try again.`
          : `Could not parse "${filename}": ${err instanceof Error ? err.message : "unknown error"}`,
      ],
    };
  }

  if (!html.trim()) {
    return { articles: [], errors: ["Document is empty"] };
  }

  // Parse HTML into individual articles using the best strategy
  const articles = splitDocxIntoArticles(html, filename);

  if (articles.length === 0) {
    return { articles: [], errors: ["No content found in document"] };
  }

  return { articles, errors: [] };
}

/**
 * Intelligently split a docx HTML output into knowledge base articles.
 *
 * Strategy priority:
 * 1. Bold-paragraph FAQ pattern — <p><strong>Q?</strong></p> followed by
 *    answer paragraphs. Common in FAQ docs. Headings become categories.
 * 2. Heading-based split — each h1/h2/h3 becomes a separate article.
 * 3. Whole document — fallback if no structure is detected.
 */
function splitDocxIntoArticles(
  html: string,
  filename: string
): ParsedArticle[] {
  // Detect bold-paragraph Q&A pattern:
  // <p><strong>Question text?</strong></p> followed by <p>Answer</p>
  const boldQRegex = /<p><strong>(.*?)<\/strong><\/p>/gi;
  const boldQuestions: { index: number; title: string }[] = [];
  let bMatch: RegExpExecArray | null;
  while ((bMatch = boldQRegex.exec(html)) !== null) {
    const title = decodeEntities(stripHtml(bMatch[1])).trim();
    if (title.length > 5) {
      boldQuestions.push({ index: bMatch.index, title });
    }
  }

  // Count headings
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings: { index: number; title: string; level: number }[] = [];
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRegex.exec(html)) !== null) {
    headings.push({
      index: hMatch.index,
      title: decodeEntities(stripHtml(hMatch[2])).trim(),
      level: parseInt(hMatch[1]),
    });
  }

  // If bold Q&A items outnumber headings, use FAQ-style parsing
  if (boldQuestions.length > headings.length && boldQuestions.length >= 3) {
    return splitByBoldQuestions(html, boldQuestions, headings);
  }

  // Otherwise fall back to heading-based splitting
  if (headings.length > 0) {
    return splitByHeadings(html, headings, filename);
  }

  // No structure — whole document as one article
  const plainText = htmlToPlainText(html).trim();
  if (!plainText) return [];
  const title = filename
    .replace(/\.(docx?|doc)$/i, "")
    .replace(/[-_]/g, " ");
  return [{ title, content: plainText }];
}

/**
 * FAQ-style split: each bold paragraph is a question/title,
 * everything until the next bold paragraph or heading is the answer.
 * Headings are used as category labels.
 */
function splitByBoldQuestions(
  html: string,
  questions: { index: number; title: string }[],
  headings: { index: number; title: string; level: number }[]
): ParsedArticle[] {
  const articles: ParsedArticle[] = [];

  // Build a map of heading positions → category names
  // (skip h1 which is usually the doc title)
  const categoryHeadings = headings.filter((h) => h.level >= 2);

  function getCategoryForIndex(idx: number): string | undefined {
    // Find the last category heading that appears before this index
    let cat: string | undefined;
    for (const h of categoryHeadings) {
      if (h.index < idx) cat = h.title;
      else break;
    }
    return cat;
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const nextBoundary =
      i + 1 < questions.length ? questions[i + 1].index : html.length;

    // Extract HTML between this bold Q and the next
    // Skip past the bold paragraph itself
    const boldEndRegex = /<\/strong><\/p>/gi;
    boldEndRegex.lastIndex = q.index;
    const endMatch = boldEndRegex.exec(html);
    const contentStart = endMatch
      ? endMatch.index + endMatch[0].length
      : q.index;

    const sectionHtml = html.slice(contentStart, nextBoundary).trim();

    // Skip any heading tags that fall within this section
    // (they're category dividers, not content)
    const cleanedHtml = sectionHtml.replace(
      /<h[1-6][^>]*>.*?<\/h[1-6]>/gi,
      ""
    );

    const content = htmlToPlainText(cleanedHtml).trim();
    if (!content) continue;

    const category = getCategoryForIndex(q.index);
    articles.push({
      title: q.title,
      content,
      ...(category ? { category } : {}),
    });
  }

  return articles;
}

/**
 * Heading-based split: each h1/h2/h3 becomes a separate article.
 */
function splitByHeadings(
  html: string,
  headings: { index: number; title: string; level: number }[],
  filename: string
): ParsedArticle[] {
  const articles: ParsedArticle[] = [];

  // Content before the first heading
  const preHeadingHtml = html.slice(0, headings[0].index).trim();
  if (preHeadingHtml) {
    const preContent = htmlToPlainText(preHeadingHtml).trim();
    if (preContent) {
      const docTitle = filename
        .replace(/\.(docx?|doc)$/i, "")
        .replace(/[-_]/g, " ");
      articles.push({ title: docTitle, content: preContent });
    }
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextIndex =
      i + 1 < headings.length ? headings[i + 1].index : html.length;

    // Get content between this heading and the next
    const sectionHtml = html.slice(
      heading.index + html.slice(heading.index).indexOf(">") + 1,
      nextIndex
    );

    // Remove the closing heading tag from the start
    const afterHeadingClose = sectionHtml.replace(
      /^[^<]*<\/h[1-6]>/i,
      ""
    );
    const sectionText = htmlToPlainText(afterHeadingClose).trim();

    if (heading.title && sectionText) {
      articles.push({
        title: heading.title,
        content: sectionText,
      });
    }
  }

  return articles;
}

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/** Decode common HTML entities */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** Convert HTML to readable plain text, preserving structure */
function htmlToPlainText(html: string): string {
  return decodeEntities(
    html
      // Block elements → newlines
      .replace(/<\/?(p|div|br|h[1-6]|li|tr)[^>]*>/gi, "\n")
      // List items get a bullet
      .replace(/<li[^>]*>/gi, "\n• ")
      // Strip remaining tags
      .replace(/<[^>]*>/g, "")
  )
    // Collapse multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Markdown ──────────────────────────────────────────────

function parseMd(filename: string, text: string): ParseResult {
  if (!text.trim()) {
    return { articles: [], errors: ["File is empty"] };
  }

  // Split on markdown headings (# through ###)
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: { index: number; title: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(text)) !== null) {
    const title = match[2].trim();
    if (title) {
      headings.push({ index: match.index, title });
    }
  }

  // No headings — treat the whole file as one article
  if (headings.length === 0) {
    const title = filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");
    return { articles: [{ title, content: text.trim() }], errors: [] };
  }

  const articles: ParsedArticle[] = [];

  // Content before the first heading
  const preContent = text.slice(0, headings[0].index).trim();
  if (preContent) {
    const title = filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");
    articles.push({ title, content: preContent });
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextIndex = i + 1 < headings.length ? headings[i + 1].index : text.length;

    // Content after the heading line
    const lineEnd = text.indexOf("\n", heading.index);
    const contentStart = lineEnd === -1 ? text.length : lineEnd + 1;
    const content = text.slice(contentStart, nextIndex).trim();

    if (content) {
      articles.push({ title: heading.title, content });
    }
  }

  if (articles.length === 0) {
    return { articles: [], errors: ["No content found in markdown file"] };
  }

  return { articles, errors: [] };
}

// ── TXT ────────────────────────────────────────────────────

function parseTxt(filename: string, text: string): ParseResult {
  const title = filename.replace(/\.txt$/i, "").replace(/[-_]/g, " ");
  if (!text.trim()) {
    return { articles: [], errors: ["File is empty"] };
  }
  return { articles: [{ title, content: text.trim() }], errors: [] };
}

// ── CSV ────────────────────────────────────────────────────

function parseCsv(text: string): ParseResult {
  const lines = text.trim().split("\n");
  if (lines.length < 2) {
    return {
      articles: [],
      errors: ["CSV must have a header row and at least one data row"],
    };
  }

  const headers = parseCSVRow(lines[0]).map((h) => h.trim().toLowerCase());
  const titleIdx = headers.indexOf("title");
  const contentIdx = headers.indexOf("content");
  const categoryIdx = headers.indexOf("category");

  if (titleIdx === -1 || contentIdx === -1) {
    return {
      articles: [],
      errors: ['CSV must have "title" and "content" columns in the header row'],
    };
  }

  const articles: ParsedArticle[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // skip empty lines

    const row = parseCSVRow(lines[i]);
    const title = row[titleIdx]?.trim();
    const content = row[contentIdx]?.trim();
    const category =
      categoryIdx >= 0 ? row[categoryIdx]?.trim() : undefined;

    if (!title || !content) {
      errors.push(`Row ${i + 1}: missing title or content, skipped`);
      continue;
    }
    articles.push({ title, content, category: category || undefined });
  }

  if (articles.length === 0 && errors.length === 0) {
    errors.push("No valid rows found in CSV");
  }

  return { articles, errors };
}

/** Simple RFC 4180 CSV row parser — handles quoted fields with commas */
function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

// ── JSON ───────────────────────────────────────────────────

function parseJson(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { articles: [], errors: ["Invalid JSON — could not parse file"] };
  }

  if (!Array.isArray(data)) {
    return {
      articles: [],
      errors: [
        'JSON must be an array of objects, e.g. [{ "title": "...", "content": "..." }]',
      ],
    };
  }

  const articles: ParsedArticle[] = [];
  const errors: string[] = [];

  data.forEach((item, i) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).title !== "string" ||
      typeof (item as Record<string, unknown>).content !== "string"
    ) {
      errors.push(`Item ${i + 1}: missing "title" or "content" string, skipped`);
      return;
    }
    const obj = item as Record<string, string>;
    articles.push({
      title: obj.title.trim(),
      content: obj.content.trim(),
      category:
        typeof obj.category === "string" ? obj.category.trim() : undefined,
    });
  });

  if (articles.length === 0 && errors.length === 0) {
    errors.push("No valid items found in JSON array");
  }

  return { articles, errors };
}
