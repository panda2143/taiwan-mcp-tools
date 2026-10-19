// 從 penguindriver.com 各網站的公開 API 抓資料，存成 datasets/ 底下的 JSON 與 CSV。
// 由 GitHub Actions 每週一自動執行（.github/workflows/datasets.yml），也可手動：node tools/fetch-datasets.mjs
import fs from "node:fs";

const UA = { "User-Agent": "taiwan-open-data-sync/1.0 (+https://github.com/panda2143/taiwan-mcp-tools)", Accept: "application/json" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
      if (r.ok) return await r.json();
      console.log(`  ${url} → HTTP ${r.status}`);
    } catch (e) { console.log(`  ${url} → ${e.message}`); }
    await sleep(3000 * i);
  }
  return null;
}

// 把物件陣列轉成 CSV（巢狀欄位轉成 JSON 字串）
function toCSV(rows) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const cols = [...new Set(rows.flatMap(r => Object.keys(r || {})))];
  const cell = v => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [cols.join(","), ...rows.map(r => cols.map(c => cell(r?.[c])).join(","))].join("\n") + "\n";
}

const DATASETS = [
  {
    id: "twostroke-motorcycles",
    title: "經典二行程機車規格",
    site: "https://twostroke.penguindriver.com",
    async load() {
      const list = await get(this.site + "/api/models");
      if (!list?.models?.length) return null;
      const out = [];
      for (const m of list.models) {
        const d = await get(`${this.site}/api/model/${encodeURIComponent(m.slug)}`);
        out.push({ ...m, ...(d || {}), page: this.site + (m.page || `/m/${m.slug}`) });
        await sleep(1100); // 免費 API 每分鐘 60 次以內
      }
      return { rows: out, json: { count: out.length, models: out } };
    }
  },
  {
    id: "ai-model-deprecations",
    title: "AI 模型下架與替代日程",
    site: "https://models.penguindriver.com",
    async load() {
      const all = await get(this.site + "/api/models");
      const upcoming = await get(this.site + "/api/upcoming");
      if (!all) return null;
      const rows = Array.isArray(all) ? all : all.models || all.items || all.results || [];
      return { rows, json: { models: all, upcoming } };
    }
  },
  {
    id: "taiwan-holidays-2027",
    title: "2027 台灣國定假日與連假",
    site: "https://travel.penguindriver.com",
    async load() {
      const h = await get(this.site + "/api/holidays-2027");
      const lw = await get(this.site + "/api/long-weekends-2027");
      if (!h) return null;
      return { rows: h.holidays || [], json: { holidays: h, long_weekends: lw } };
    }
  },
  {
    id: "ai-glossary-zh-tw",
    title: "AI 與科技名詞白話解釋（繁體中文）",
    site: "https://glossary.penguindriver.com",
    async load() {
      const t = await get(this.site + "/api/terms");
      if (!t) return null;
      const rows = Array.isArray(t) ? t : t.terms || t.items || t.results || [];
      return { rows, json: t };
    }
  }
];

const index = [];
fs.mkdirSync("datasets", { recursive: true });
for (const ds of DATASETS) {
  console.log(`抓取 ${ds.title}`);
  const res = await ds.load();
  if (!res) { console.log("  失敗，保留上一版"); continue; }
  const meta = { source: ds.site, license: "CC BY 4.0", attribution: `資料來源：${ds.title}（${ds.site}）`, updated: new Date().toISOString() };
  fs.writeFileSync(`datasets/${ds.id}.json`, JSON.stringify({ _meta: meta, ...(Array.isArray(res.json) ? { data: res.json } : res.json) }, null, 1) + "\n");
  const csv = toCSV(res.rows);
  if (csv) fs.writeFileSync(`datasets/${ds.id}.csv`, csv);
  index.push({ id: ds.id, title: ds.title, source: ds.site, rows: res.rows.length, json: `datasets/${ds.id}.json`, csv: csv ? `datasets/${ds.id}.csv` : null, updated: meta.updated });
  console.log(`  完成：${res.rows.length} 筆`);
}
if (index.length) fs.writeFileSync("datasets/index.json", JSON.stringify({ license: "CC BY 4.0", datasets: index }, null, 1) + "\n");
