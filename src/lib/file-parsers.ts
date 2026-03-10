/**
 * Client-side file parsing for knowledge base uploads.
 * Supports .txt, .csv, and .json — no external dependencies.
 */

export type ParsedArticle = {
  title: string;
  content: string;
  category?: string;
};

export type ParseResult = {
  articles: ParsedArticle[];
  errors: string[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function parseFileToArticles(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      articles: [],
      errors: [`File "${file.name}" exceeds 5MB limit`],
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  // Normalize BOM and line endings
  const raw = await file.text();
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  switch (ext) {
    case "txt":
      return parseTxt(file.name, text);
    case "csv":
      return parseCsv(text);
    case "json":
      return parseJson(text);
    default:
      return {
        articles: [],
        errors: [`Unsupported file type: .${ext}. Use .txt, .csv, or .json`],
      };
  }
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
