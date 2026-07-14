import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ColumnType = "number" | "date" | "boolean" | "string";
export interface ColumnMeta { name: string; type: ColumnType; nullCount: number; uniqueCount: number; }
export interface ParsedDataset { columns: ColumnMeta[]; rows: Record<string, unknown>[]; }

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T|\s|$)|^\d{1,2}\/\d{1,2}\/\d{2,4}$/;

function detectType(values: unknown[]): ColumnType {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (!nonNull.length) return "string";
  let n = 0, d = 0, b = 0;
  for (const v of nonNull.slice(0, 200)) {
    const s = String(v).trim();
    if (s === "true" || s === "false") { b++; continue; }
    if (!isNaN(Number(s)) && s !== "") { n++; continue; }
    if (DATE_RE.test(s) || !isNaN(Date.parse(s)) && s.length > 6) { d++; continue; }
  }
  const total = nonNull.length;
  if (n / total > 0.8) return "number";
  if (d / total > 0.7) return "date";
  if (b / total > 0.9) return "boolean";
  return "string";
}

export function profileData(rows: Record<string, unknown>[], headers: string[]): ColumnMeta[] {
  return headers.map((name) => {
    const values = rows.map((r) => r[name]);
    const nulls = values.filter((v) => v === null || v === undefined || v === "").length;
    const unique = new Set(values.map((v) => String(v))).size;
    return { name, type: detectType(values), nullCount: nulls, uniqueCount: unique };
  });
}

export function parseCsv(file: File): Promise<ParsedDataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields ?? [];
        const rows = res.data as Record<string, unknown>[];
        resolve({ columns: profileData(rows, headers), rows });
      },
      error: reject,
    });
  });
}

export async function parseXlsx(file: File): Promise<ParsedDataset> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return { columns: profileData(rows, headers), rows };
}

export async function parseFile(file: File): Promise<ParsedDataset> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "tsv") return parseCsv(file);
  if (ext === "xlsx" || ext === "xls") return parseXlsx(file);
  throw new Error("Unsupported file type. Please upload CSV or Excel.");
}

export function qualityScore(rows: Record<string, unknown>[], cols: ColumnMeta[]): number {
  if (!rows.length || !cols.length) return 0;
  const totalCells = rows.length * cols.length;
  const totalNulls = cols.reduce((s, c) => s + c.nullCount, 0);
  const completeness = 1 - totalNulls / totalCells;
  const seen = new Set<string>();
  let dupes = 0;
  for (const r of rows) {
    const key = JSON.stringify(r);
    if (seen.has(key)) dupes++;
    else seen.add(key);
  }
  const uniqueness = 1 - dupes / rows.length;
  return Math.round((completeness * 0.7 + uniqueness * 0.3) * 100);
}

export function duplicateCount(rows: Record<string, unknown>[]): number {
  const seen = new Set<string>();
  let d = 0;
  for (const r of rows) { const k = JSON.stringify(r); if (seen.has(k)) d++; else seen.add(k); }
  return d;
}
