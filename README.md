# 台灣資料 MCP 工具集（繁體中文）

一個遠端 MCP 端點，讓 ChatGPT、Claude、Cursor 等 AI 用戶端直接查台灣的即時資料。全部免費、不用金鑰。

**MCP 端點：** `https://penguindriver.com/mcp`（Streamable HTTP）

## 可以查什麼（135 個工具）

| 分類 | 例子 |
|---|---|
| 生活 | 中油本週油價、統一發票對獎、樂透對獎、國定假日與補班 |
| 購物 | 3C、美妝、家電與連鎖通路商品最低價、近 90 天價格、今日降價 |
| 旅遊 | 臺灣銀行牌告匯率、日韓越入境規定、2027 連假請假試算 |
| 影視運動 | 全台電影上映日、遊戲發售日、中職／MLB／NBA 賽程與台灣轉播 |
| 財經 | 台股 AI 題材股、高股息 ETF 配息、USDT 新台幣溢價、165 涉詐網址比對 |
| 健康 | 公費癌症篩檢資格、居家血壓判讀、通訊診察資格 |
| 開發者 | llms.txt 檢查與產生、robots.txt 測試、AI 爬蟲名單、AI 模型下架日 |
| 創作者 | 食品化粧品廣告違規詞檢查、團購利潤試算、業配扣繳試算 |

不確定用哪個工具時，先呼叫 `hub_find_tool_for_task`，用中文描述任務即可。

## 開放資料集（可下載，CC BY 4.0）

不想接 MCP、只想要整包資料？直接下載 `datasets/` 裡的 JSON 或 CSV（CSV 可直接用 Excel 開）。每週一自動更新。

| 資料集 | 內容 | 下載 |
|---|---|---|
| 經典二行程機車規格 | 車款、廠牌、規格與保養資料 | [JSON](datasets/twostroke-motorcycles.json)・[CSV](datasets/twostroke-motorcycles.csv) |
| AI 模型下架與替代日程 | 各家 AI 模型停用日期、建議替代模型 | [JSON](datasets/ai-model-deprecations.json)・[CSV](datasets/ai-model-deprecations.csv) |
| 2027 台灣國定假日與連假 | 放假日、星期、連假區間 | [JSON](datasets/taiwan-holidays-2027.json)・[CSV](datasets/taiwan-holidays-2027.csv) |
| AI 與科技名詞白話解釋 | 繁體中文 AI 名詞與白話說明 | [JSON](datasets/ai-glossary-zh-tw.json)・[CSV](datasets/ai-glossary-zh-tw.csv) |

清單與更新時間：[`datasets/index.json`](datasets/index.json)

**授權：** [CC BY 4.0](LICENSE-DATA.md)。可商用、可轉載，只要標示資料集名稱與來源網址（每個檔案的 `_meta.source`）。

**發現錯誤或想補資料？** 開一個 [Issue](../../issues) 告訴我們，或寄信到 hot198271@gmail.com。

覺得有用的話，按右上角 ⭐ 讓更多人找到。

## 怎麼接

**Claude（網頁版／桌面版）**：設定 → Connectors → Add custom connector → 貼上 `https://penguindriver.com/mcp`

**Cursor**（`~/.cursor/mcp.json`）：

```json
{
  "mcpServers": {
    "taiwan-data": { "url": "https://penguindriver.com/mcp" }
  }
}
```

**VS Code**（`.vscode/mcp.json`）：

```json
{
  "servers": {
    "taiwan-data": { "type": "http", "url": "https://penguindriver.com/mcp" }
  }
}
```

**測試一下**：

```bash
curl -s https://penguindriver.com/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 其他入口

- 給 AI 讀的網站說明：https://penguindriver.com/llms.txt
- 全部網站總覽：https://penguindriver.com/sites
- MCP 伺服器卡：https://penguindriver.com/.well-known/mcp/server-card.json
- 每個網站也有自己的 `/mcp`、`/openapi.json` 與 `/llms.txt`

## 資料來源

每筆回應附資料來源與更新日期（政府開放資料、官方公告、公開行情等）。資料僅供參考，不構成投資、醫療或法律建議。
