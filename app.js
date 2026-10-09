const STORAGE_KEY = "union-deck-lab-decks-v1";
const CATALOG_URL_KEY = "union-deck-lab-catalog-url-v1";
const COLORS = {
  red: { label: "赤", hex: "#e9775f" },
  blue: { label: "青", hex: "#5d8cdb" },
  yellow: { label: "黄", hex: "#d7a548" },
  purple: { label: "紫", hex: "#9772c8" },
  green: { label: "緑", hex: "#4ba47d" },
  none: { label: "無色", hex: "#9299a4" },
};

const SAMPLE_TITLE_ID = "sample-title";
const BUILTIN_TITLES = [{ id: SAMPLE_TITLE_ID, name: "サンプルタイトル" }];
let titles = [...BUILTIN_TITLES];
const BUILTIN_CARDS = [
  { id: "c01", name: "前線のエース", color: "red", cost: 1, bp: 2000, type: "キャラクター", symbol: "前" },
  { id: "c02", name: "熱血の新人", color: "red", cost: 2, bp: 3000, type: "キャラクター", symbol: "熱" },
  { id: "c03", name: "赤き守護者", color: "red", cost: 3, bp: 4000, type: "キャラクター", symbol: "守" },
  { id: "c04", name: "一閃の剣士", color: "red", cost: 4, bp: 5000, type: "キャラクター", symbol: "閃" },
  { id: "c05", name: "勝利への号令", color: "red", cost: 2, bp: 0, type: "イベント", symbol: "号" },
  { id: "c06", name: "蒼海の案内人", color: "blue", cost: 1, bp: 2000, type: "キャラクター", symbol: "海" },
  { id: "c07", name: "静かな参謀", color: "blue", cost: 2, bp: 3000, type: "キャラクター", symbol: "策" },
  { id: "c08", name: "深淵の観測者", color: "blue", cost: 3, bp: 4000, type: "キャラクター", symbol: "観" },
  { id: "c09", name: "蒼天の指揮官", color: "blue", cost: 4, bp: 5000, type: "キャラクター", symbol: "蒼" },
  { id: "c10", name: "戦況分析", color: "blue", cost: 2, bp: 0, type: "イベント", symbol: "析" },
  { id: "c11", name: "暁の旅人", color: "yellow", cost: 1, bp: 2000, type: "キャラクター", symbol: "暁" },
  { id: "c12", name: "光輪の騎士", color: "yellow", cost: 2, bp: 3000, type: "キャラクター", symbol: "光" },
  { id: "c13", name: "白翼の守り手", color: "yellow", cost: 3, bp: 4000, type: "キャラクター", symbol: "翼" },
  { id: "c14", name: "黄金の覇者", color: "yellow", cost: 4, bp: 5000, type: "キャラクター", symbol: "覇" },
  { id: "c15", name: "希望の兆し", color: "yellow", cost: 2, bp: 0, type: "イベント", symbol: "希" },
  { id: "c16", name: "夜影の斥候", color: "purple", cost: 1, bp: 2000, type: "キャラクター", symbol: "影" },
  { id: "c17", name: "冥府の使者", color: "purple", cost: 2, bp: 3000, type: "キャラクター", symbol: "冥" },
  { id: "c18", name: "紫電の魔導師", color: "purple", cost: 3, bp: 4000, type: "キャラクター", symbol: "電" },
  { id: "c19", name: "深夜の支配者", color: "purple", cost: 4, bp: 5000, type: "キャラクター", symbol: "夜" },
  { id: "c20", name: "影の取引", color: "purple", cost: 2, bp: 0, type: "イベント", symbol: "取" },
  { id: "c21", name: "新緑の守り手", color: "green", cost: 1, bp: 2000, type: "キャラクター", symbol: "緑" },
  { id: "c22", name: "森の開拓者", color: "green", cost: 2, bp: 3000, type: "キャラクター", symbol: "森" },
  { id: "c23", name: "大樹の番人", color: "green", cost: 3, bp: 4000, type: "キャラクター", symbol: "樹" },
  { id: "c24", name: "翠嵐の王", color: "green", cost: 4, bp: 5000, type: "キャラクター", symbol: "嵐" },
  { id: "c25", name: "自然の導き", color: "green", cost: 2, bp: 0, type: "イベント", symbol: "導" },
].map((card) => ({ ...card, titleId: SAMPLE_TITLE_ID }));
let catalog = [...BUILTIN_CARDS];

const STARTER_CARDS = [
  ["c01", 4], ["c02", 4], ["c03", 4], ["c04", 4], ["c05", 4],
  ["c06", 4], ["c07", 4], ["c08", 4], ["c09", 4], ["c10", 4],
  ["c11", 4], ["c12", 2], ["c13", 4],
];

const starterDeck = () => ({
  id: "starter-red-blue-yellow",
  name: "トライカラー・プロトタイプ",
  cards: Object.fromEntries(STARTER_CARDS),
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  updatedAt: Date.now() - 1000 * 60 * 18,
});

function loadDecks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(stored)) {
      return stored
        .filter((deck) => deck && typeof deck.id === "string" && deck.cards)
        .map((deck) => ({ ...deck, titleId: deck.titleId || SAMPLE_TITLE_ID }));
    }
  } catch (error) {
    console.error("デッキデータを読み込めませんでした。", error);
  }
  return [starterDeck()];
}

let decks = loadDecks();
let activeView = "decks";
let editingDeckId = null;
let catalogFilter = "all";
let catalogQuery = "";
let catalogSearchComposing = false;
let previewCardId = null;
let game = null;
let toastTimer;

function saveDecks(nextDecks = decks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDecks));
    decks = nextDecks;
    const indicator = document.querySelector(".save-indicator");
    if (indicator) indicator.textContent = "✓ 保存しました";
    renderSidebarDecks();
    return true;
  } catch (error) {
    console.error("デッキを保存できませんでした。", error);
    showToast("保存に失敗しました。ブラウザーの保存領域を確認してください。");
    return false;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function getCard(id) { return catalog.find((card) => card.id === id); }
function getTitle(id) { return titles.find((title) => title.id === id); }
function deckSize(deck) { return Object.values(deck.cards).reduce((sum, count) => sum + count, 0); }
function deckColors(deck) {
  const colors = [...new Set(Object.entries(deck.cards).filter(([, count]) => count > 0).map(([id]) => getCard(id)?.color).filter((color) => color && color !== "none"))];
  return colors;
}
function formatDate(timestamp) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date(timestamp));
}
function findDeck(id) { return decks.find((deck) => deck.id === id); }
function cardLimitId(card) { return card.cardNumber ? card.cardNumber.replace(/_p\d+$/i, "") : card.id; }
function deckCopiesOfCard(deck, card) {
  if (!card) return 0;
  const limitId = cardLimitId(card);
  return Object.entries(deck.cards).reduce((total, [id, count]) => {
    const deckCard = getCard(id);
    return total + (deckCard && cardLimitId(deckCard) === limitId ? count : 0);
  }, 0);
}

function renderCatalogRows(deck) {
  const size = deckSize(deck);
  const filtered = catalog.filter((card) => card.titleId === deck.titleId
    && (catalogFilter === "all" || card.color === catalogFilter)
    && `${card.name} ${card.type} ${COLORS[card.color].label}`.toLowerCase().includes(catalogQuery.toLowerCase()));
  return filtered.map((card) => `<div class="catalog-row">
    <button class="mini-card card-preview-trigger" data-preview-card="${escapeHtml(card.id)}" style="--card-color:${COLORS[card.color].hex}" aria-label="${escapeHtml(card.name)}のカード画像と詳細を表示">${card.image ? `<img class="catalog-card-image" src="${escapeHtml(card.image)}" alt="" loading="lazy" />` : escapeHtml(card.symbol)}</button>
    <div><button class="card-title card-title-preview" data-preview-card="${escapeHtml(card.id)}">${escapeHtml(card.name)}</button><div class="card-meta"><span>${COLORS[card.color].label}</span><span>${card.type}</span><span>BP ${card.bp || "—"}</span>${card.cardNumber ? `<span>${escapeHtml(card.cardNumber)}</span>` : ""}</div></div>
    <span class="card-cost">${card.cost}</span><button class="add-card-btn" data-add-card="${escapeHtml(card.id)}" aria-label="${escapeHtml(card.name)}を追加" ${deckCopiesOfCard(deck, card) >= 4 || size >= 50 ? "disabled" : ""}>＋</button>
  </div>`).join("") || `<div class="no-results">該当するカードがありません</div>`;
}

function updateCatalogResults() {
  const deck = findDeck(editingDeckId);
  const list = document.querySelector("#view-builder .catalog-list");
  if (!deck || !list) return;
  catalogQuery = document.querySelector("#catalog-search").value;
  list.innerHTML = renderCatalogRows(deck);
}

function renderBuilderPreservingScroll() {
  const catalogScrollTop = document.querySelector("#view-builder .catalog-list")?.scrollTop || 0;
  const deckScrollTop = document.querySelector("#view-builder .deck-list")?.scrollTop || 0;
  const pageScrollTop = window.scrollY;
  renderBuilder();
  const catalogList = document.querySelector("#view-builder .catalog-list");
  const deckList = document.querySelector("#view-builder .deck-list");
  if (catalogList) catalogList.scrollTop = catalogScrollTop;
  if (deckList) deckList.scrollTop = deckScrollTop;
  window.scrollTo(window.scrollX, pageScrollTop);
}

function showCardPreview(cardId) {
  const card = getCard(cardId);
  const dialog = document.querySelector("#card-preview-dialog");
  const content = document.querySelector("#card-preview-content");
  if (!card || !dialog || !content) return;
  const deck = findDeck(editingDeckId);
  const cardCount = deck?.cards[card.id] || 0;
  const copies = deck ? deckCopiesOfCard(deck, card) : 0;
  const size = deck ? deckSize(deck) : 0;
  previewCardId = card.id;
  content.innerHTML = `<div class="card-preview-layout">
    <div class="card-preview-art" style="--card-color:${COLORS[card.color].hex}">${card.image ? `<img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}のカード画像" />` : `<span>${escapeHtml(card.symbol)}</span>`}</div>
    <div class="card-preview-details">
      <p class="card-preview-eyebrow">${escapeHtml(card.cardNumber || card.id)}${card.rarity ? ` · ${escapeHtml(card.rarity)}` : ""}</p>
      <h2 id="card-preview-title">${escapeHtml(card.name)}</h2>
      <div class="card-preview-stats">
        <span>色<strong>${COLORS[card.color].label}</strong></span><span>種類<strong>${escapeHtml(card.type)}</strong></span>
        <span>コスト<strong>${card.cost}</strong></span><span>BP<strong>${card.bp || "—"}</strong></span>
        ${card.apCost !== undefined ? `<span>AP<strong>${card.apCost}</strong></span>` : ""}
        ${card.requiredEnergy !== undefined ? `<span>必要エナジー<strong>${card.requiredEnergy}</strong></span>` : ""}
        ${card.generatedEnergy !== undefined ? `<span>発生エナジー<strong>${card.generatedEnergy}</strong></span>` : ""}
      </div>
      ${card.effect ? `<p class="card-preview-effect">${escapeHtml(card.effect)}</p>` : ""}
      ${deck ? `<div class="card-preview-quantity"><span>このカード <strong>${cardCount}</strong> 枚</span><span>同一カード番号 <strong>${copies}</strong> / 4 枚</span></div>
        <div class="card-preview-actions"><button class="btn btn-light" data-preview-remove="${escapeHtml(card.id)}" ${cardCount < 1 ? "disabled" : ""}>− 1枚減らす</button><button class="btn btn-coral" data-preview-add="${escapeHtml(card.id)}" ${copies >= 4 || size >= 50 ? "disabled" : ""}>＋ 1枚追加</button></div>` : ""}
    </div>
  </div>`;
  dialog.showModal();
}

function validateCatalogPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)
    || payload.format !== "union-deck-lab-catalog" || payload.version !== 1
    || !Array.isArray(payload.titles) || !Array.isArray(payload.cards)) {
    throw new Error("カードカタログの形式が正しくありません。READMEのJSON形式をご確認ください。");
  }

  const nextTitles = payload.titles.map((title) => {
    if (!title || typeof title.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/i.test(title.id)
      || typeof title.name !== "string" || !title.name.trim()) {
      throw new Error("タイトル情報には英数字のidとnameが必要です。");
    }
    return { id: title.id, name: title.name.trim() };
  });
  if (new Set(nextTitles.map((title) => title.id)).size !== nextTitles.length) {
    throw new Error("タイトルIDが重複しています。");
  }

  const knownTitleIds = new Set([...BUILTIN_TITLES, ...nextTitles].map((title) => title.id));
  const baseUrl = payload.__sourceUrl;
  const nextCards = payload.cards.map((card) => {
    if (!card || typeof card.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/i.test(card.id)
      || typeof card.titleId !== "string" || !knownTitleIds.has(card.titleId)
      || typeof card.name !== "string" || !card.name.trim()
      || !Object.hasOwn(COLORS, card.color)
      || !Number.isInteger(card.cost) || card.cost < 0
      || !Number.isInteger(card.bp) || card.bp < 0
      || typeof card.type !== "string" || typeof card.symbol !== "string") {
      throw new Error(`カード「${card?.id || "不明"}」の情報が不足しているか正しくありません。`);
    }
    let image;
    if (card.image !== undefined && card.image !== "") {
      if (typeof card.image !== "string") throw new Error(`カード「${card.id}」の画像パスが正しくありません。`);
      image = baseUrl ? new URL(card.image, baseUrl).href : card.image;
      if (!/\.png(?:[?#].*)?$/i.test(image)) {
        throw new Error(`カード「${card.id}」の画像はPNGを指定してください。`);
      }
    }
    return { ...card, name: card.name.trim(), image };
  });
  if (new Set(nextCards.map((card) => card.id)).size !== nextCards.length) {
    throw new Error("カードIDが重複しています。");
  }
  return { titles: nextTitles, cards: nextCards };
}

async function refreshCatalog(sourceUrl, persistUrl = false) {
  let url;
  try {
    url = new URL(sourceUrl);
  } catch {
    showToast("カードカタログのURLを確認してください。");
    return;
  }
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !localHttp) {
    showToast("カードカタログにはHTTPSのURLを指定してください。");
    return;
  }

  try {
    const response = await fetch(url.href, { cache: "no-cache" });
    if (!response.ok) throw new Error(`カードカタログの取得に失敗しました（HTTP ${response.status}）。`);
    const payload = await response.json();
    const validated = validateCatalogPayload({ ...payload, __sourceUrl: url.href });
    const titleMap = new Map(BUILTIN_TITLES.map((title) => [title.id, title]));
    validated.titles.forEach((title) => titleMap.set(title.id, title));
    const cardMap = new Map(BUILTIN_CARDS.map((card) => [card.id, card]));
    validated.cards.forEach((card) => cardMap.set(card.id, card));

    if (persistUrl) {
      try {
        localStorage.setItem(CATALOG_URL_KEY, url.href);
      } catch (error) {
        console.error("カタログURLを保存できませんでした。", error);
        showToast("URLを保存できませんでした。ブラウザーの保存領域を確認してください。");
        return;
      }
    }
    titles = [...titleMap.values()];
    catalog = [...cardMap.values()];
    renderSidebarDecks();
    if (activeView === "builder") renderBuilder();
    if (activeView === "decks") renderDecks();
    showToast(`${validated.titles.length}タイトル・${validated.cards.length}枚のカードを読み込みました。`);
  } catch (error) {
    console.error("外部カードカタログを読み込めませんでした。", error);
    const message = error instanceof TypeError
      ? "カードカタログを取得できません。URLと公開設定、CORS設定を確認してください。"
      : error.message;
    showToast(message);
  }
}

function createExportPayload(exportedDecks) {
  return {
    format: "union-deck-lab",
    version: 1,
    exportedAt: new Date().toISOString(),
    decks: exportedDecks.map(({ id, name, cards, createdAt, updatedAt }) => ({
      id, name, cards, createdAt, updatedAt,
    })),
  };
}

function downloadDecks(exportedDecks, filenameBase) {
  if (!exportedDecks.length) {
    showToast("書き出すデッキがありません。");
    return;
  }
  const blob = new Blob([JSON.stringify(createExportPayload(exportedDecks), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameBase}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`${exportedDecks.length}個のデッキを書き出しました。`);
}

function validateImportedDecks(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)
    || payload.format !== "union-deck-lab" || payload.version !== 1
    || !Array.isArray(payload.decks) || payload.decks.length === 0) {
    throw new Error("対応していないJSON形式です。アプリから書き出したJSONを選んでください。");
  }

  return payload.decks.map((deck, index) => {
    if (!deck || typeof deck !== "object" || Array.isArray(deck)
      || typeof deck.name !== "string" || !deck.name.trim()
      || !deck.cards || typeof deck.cards !== "object" || Array.isArray(deck.cards)) {
      throw new Error(`${index + 1}個目のデッキ情報が正しくありません。`);
    }

    const cards = {};
    const copyCounts = new Map();
    let size = 0;
    const titleId = typeof deck.titleId === "string" ? deck.titleId : SAMPLE_TITLE_ID;
    if (!getTitle(titleId)) {
      throw new Error(`「${deck.name}」のタイトルがこのカタログにありません。先に該当タイトルのカードカタログを読み込んでください。`);
    }
    for (const [cardId, count] of Object.entries(deck.cards)) {
      if (!getCard(cardId)) {
        throw new Error(`「${deck.name}」に現在のカード一覧にないカードID（${cardId}）が含まれています。`);
      }
      if (getCard(cardId).titleId !== titleId) {
        throw new Error(`「${deck.name}」に選択中のタイトル以外のカードが含まれています。`);
      }
      if (!Number.isInteger(count) || count < 1 || count > 4) {
        throw new Error(`「${deck.name}」のカード枚数は1種類につき1〜4枚で指定してください。`);
      }
      const limitId = cardLimitId(getCard(cardId));
      copyCounts.set(limitId, (copyCounts.get(limitId) || 0) + count);
      if (copyCounts.get(limitId) > 4) {
        throw new Error(`「${deck.name}」に同じカード番号のカードが5枚以上含まれています。`);
      }
      cards[cardId] = count;
      size += count;
    }
    if (size > 50) {
      throw new Error(`「${deck.name}」が50枚を超えています。`);
    }

    const now = Date.now();
    return {
      id: `deck-${now}-${Math.random().toString(36).slice(2, 9)}-${index}`,
      name: deck.name.trim().slice(0, 40),
      titleId,
      cards,
      createdAt: Number.isFinite(deck.createdAt) ? deck.createdAt : now,
      updatedAt: Number.isFinite(deck.updatedAt) ? deck.updatedAt : now,
    };
  });
}

async function importDeckFile(file) {
  try {
    const payload = JSON.parse(await file.text());
    const importedDecks = validateImportedDecks(payload);
    if (!saveDecks([...importedDecks, ...decks])) return;
    renderDecks();
    showToast(`${importedDecks.length}個のデッキを読み込みました。`);
  } catch (error) {
    console.error("デッキJSONを読み込めませんでした。", error);
    showToast(error instanceof SyntaxError ? "JSONを解析できません。ファイルの内容を確認してください。" : error.message);
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function setView(view) {
  activeView = view;
  document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.id === `view-${view}`));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  const labels = { decks: "デッキ一覧", builder: "デッキ編集", play: "一人回し" };
  document.querySelector("#breadcrumb-current").textContent = labels[view];
  if (view === "decks") renderDecks();
  if (view === "builder") renderBuilder();
  if (view === "play") renderPlay();
}

function renderSidebarDecks() {
  document.querySelector("#sidebar-deck-count").textContent = decks.length;
  document.querySelector("#sidebar-decks").innerHTML = decks.slice(0, 8).map((deck) => {
    const firstColor = COLORS[deckColors(deck)[0]]?.hex || COLORS.red.hex;
    return `<button class="sidebar-deck" data-open-deck="${escapeHtml(deck.id)}"><span class="deck-dot" style="--dot:${firstColor}"></span><span>${escapeHtml(deck.name || "無題のデッキ")}</span></button>`;
  }).join("");
}

function renderDecks() {
  const totalCards = decks.reduce((sum, deck) => sum + deckSize(deck), 0);
  const savedValid = decks.filter((deck) => deckSize(deck) === 50).length;
  const recentDeck = decks.reduce((latest, deck) => Math.max(latest, deck.updatedAt || 0), 0);
  const deckCards = decks.map((deck) => {
    const colors = deckColors(deck);
    const first = COLORS[colors[0]] || COLORS.red;
    const dots = colors.length ? colors : ["red"];
    const size = deckSize(deck);
    const titleName = getTitle(deck.titleId)?.name || "タイトル未設定";
    return `<article class="deck-card" style="--tint:${first.hex}22">
      <div class="deck-card-top"><div class="deck-color">${dots.map((color) => `<i class="color-dot" style="--dot:${COLORS[color]?.hex || COLORS.red.hex}" title="${COLORS[color]?.label || ""}"></i>`).join("")}</div>
        <div class="deck-actions"><button class="icon-btn" title="JSONを書き出す" aria-label="JSONを書き出す" data-export-deck="${escapeHtml(deck.id)}">⇩</button><button class="icon-btn" title="編集" aria-label="編集" data-edit-deck="${escapeHtml(deck.id)}">✎</button><button class="icon-btn" title="複製" aria-label="複製" data-duplicate-deck="${escapeHtml(deck.id)}">⧉</button><button class="icon-btn" title="削除" aria-label="削除" data-delete-deck="${escapeHtml(deck.id)}">×</button></div></div>
      <h3>${escapeHtml(deck.name || "無題のデッキ")}</h3><p class="deck-note"><strong>${escapeHtml(titleName)}</strong>　·　${colors.map((color) => COLORS[color]?.label).filter(Boolean).join(" / ") || "カラー未設定"}　 ·　更新 ${formatDate(deck.updatedAt || Date.now())}</p>
      <div class="deck-card-bottom"><span class="deck-count"><strong>${size}</strong> / 50 枚</span><button data-start-deck="${escapeHtml(deck.id)}" ${size ? "" : "disabled"}>一人回しを始める　→</button></div>
    </article>`;
  }).join("");

  const catalogUrl = localStorage.getItem(CATALOG_URL_KEY) || "";
  document.querySelector("#view-decks").innerHTML = `<div class="page-heading"><div><div class="eyebrow">YOUR WORKSPACE</div><h1>デッキ一覧</h1><p>アイデアを形にして、納得いくまで一人回し。</p></div><div class="deck-toolbar"><button class="btn btn-light" data-export-all>↓ JSON書き出し</button><button class="btn btn-light" data-import-json>↑ JSON読み込み</button><button class="btn btn-primary" data-action="new-deck"><span>＋</span> 新しいデッキ</button><input id="deck-json-file" type="file" accept=".json,application/json" hidden /></div></div>
    <details class="catalog-source"><summary>外部カードカタログ　·　${titles.length}タイトル / ${catalog.length}枚</summary><form id="catalog-source-form" class="catalog-source-form"><input id="catalog-source-url" type="url" placeholder="https://example.com/union-arena/catalog.json" value="${escapeHtml(catalogUrl)}" aria-label="カードカタログJSONのURL" required /><button class="btn btn-light" type="submit">カタログを更新</button></form><p>公開JSONのURLを指定すると、タイトルとカード一覧を追加できます。HTTPS配信とCORS許可が必要です。画像はPNGのURLを指定してください。</p></details>
    <div class="deck-summary">
      <div class="summary-card"><div><div class="summary-label">保存したデッキ</div><div class="summary-value">${decks.length}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> decks</small></div></div><div class="summary-icon">▤</div></div>
      <div class="summary-card"><div><div class="summary-label">構築済みカード</div><div class="summary-value">${totalCards}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> cards</small></div></div><div class="summary-icon">▧</div></div>
      <div class="summary-card"><div><div class="summary-label">50枚完成デッキ</div><div class="summary-value">${savedValid}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> decks</small></div></div><div class="summary-icon">✓</div></div>
    </div>
    <div class="section-heading"><h2>マイデッキ</h2><span>${decks.length} decks　·　最終更新 ${decks.length ? formatDate(recentDeck) : "—"}</span></div>
    ${decks.length ? `<div class="deck-grid">${deckCards}<button class="deck-card add-deck-card" data-action="new-deck" style="display:grid;place-content:center;justify-items:center;min-height:198px;border-style:dashed;background:transparent;color:#8d97a5"><span style="display:grid;place-items:center;width:37px;height:37px;border:1px solid #e3e6eb;border-radius:50%;font-size:20px">＋</span><span style="margin-top:9px;font-size:10px">デッキを追加</span></button></div>` : `<div class="empty-state"><div class="empty-icon">＋</div><h2>最初のデッキを作ろう</h2><p>カードを選んで、あなたのデッキを組み立てましょう。</p><button class="btn btn-primary" data-action="new-deck">デッキを作る</button></div>`}
    <p class="rules-note" style="margin-top:19px">デッキはこのブラウザーに自動保存されます。バックアップや別の端末への移行にはJSON書き出し・読み込みをご利用ください。カード名とデータは操作確認用のサンプルです。</p>`;
}

function openBuilder(deckId = null) {
  editingDeckId = deckId;
  catalogFilter = "all";
  catalogQuery = "";
  setView("builder");
}

function createDeck() {
  const deck = { id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "新しいデッキ", titleId: titles[0]?.id || SAMPLE_TITLE_ID, cards: {}, createdAt: Date.now(), updatedAt: Date.now() };
  decks.unshift(deck);
  editingDeckId = deck.id;
  saveDecks();
  setView("builder");
}

function renderBuilder() {
  let deck = findDeck(editingDeckId);
  if (!deck) {
    if (!decks.length) { document.querySelector("#view-builder").innerHTML = `<div class="empty-state"><div class="empty-icon">▤</div><h2>編集するデッキがありません</h2><button class="btn btn-primary" data-action="new-deck">デッキを作る</button></div>`; return; }
    deck = decks[0];
    editingDeckId = deck.id;
  }
  const size = deckSize(deck);
  const colors = deckColors(deck);
  const title = getTitle(deck.titleId);
  const titleCards = catalog.filter((card) => card.titleId === deck.titleId);
  const owned = Object.entries(deck.cards).filter(([, count]) => count > 0).sort((a, b) => (getCard(a[0])?.cost || 0) - (getCard(b[0])?.cost || 0));
  const ownedRows = owned.map(([id, count]) => {
    const card = getCard(id);
    if (!card) return "";
    const copies = deckCopiesOfCard(deck, card);
    return `<div class="deck-list-row"><div><button class="owned-card-title card-title-preview" data-preview-card="${escapeHtml(card.id)}">${escapeHtml(card.name)}</button><div class="owned-card-meta">${COLORS[card.color].label}　·　${card.cost}コスト　·　BP ${card.bp || "—"}${card.cardNumber ? `　·　${escapeHtml(card.cardNumber)}` : ""}</div></div><div class="quantity-control"><button data-remove-card="${escapeHtml(card.id)}" aria-label="${escapeHtml(card.name)}を1枚減らす">−</button><strong>${count}</strong><button data-add-card="${escapeHtml(card.id)}" aria-label="${escapeHtml(card.name)}を1枚増やす" ${copies >= 4 || size >= 50 ? "disabled" : ""}>＋</button></div></div>`;
  }).join("");
  const colorCount = colors.length;
  const valid = size === 50 && owned.every(([id]) => deckCopiesOfCard(deck, getCard(id)) <= 4);
  const colorParts = Object.entries(deck.cards).reduce((counts, [id, count]) => {
    const color = getCard(id)?.color;
    if (color && color !== "none") counts[color] = (counts[color] || 0) + count;
    return counts;
  }, {});
  const distribution = Object.entries(colorParts).map(([color, count]) => `<span style="width:${size ? count / size * 100 : 0}%;background:${COLORS[color].hex}" title="${COLORS[color].label}: ${count}枚"></span>`).join("");

  document.querySelector("#view-builder").innerHTML = `<div class="builder-top"><button class="back-btn" data-view="decks">← デッキ一覧</button><div class="save-indicator">✓ 保存しました</div><div class="builder-title"><input id="deck-name" maxlength="40" value="${escapeHtml(deck.name)}" aria-label="デッキ名" /><span class="deck-color">${colors.map((color) => `<i class="color-dot" style="--dot:${COLORS[color].hex}"></i>`).join("")}</span></div>
    <label class="title-selector-label" for="deck-title">TITLE</label><select id="deck-title" class="select-input title-selector" aria-label="デッキのタイトル">${titles.map((item) => `<option value="${escapeHtml(item.id)}" ${deck.titleId === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></div>
    <div class="builder-layout">
      <section class="panel catalog-panel"><div class="panel-head"><h2>登録カード　·　${escapeHtml(title?.name || "タイトル未登録")}</h2><span>${titleCards.length} cards</span></div>
        <div class="catalog-tools"><div class="search-wrap"><input class="search-input" id="catalog-search" placeholder="カード名で検索..." value="${escapeHtml(catalogQuery)}" /></div>
          <select class="select-input" id="color-filter" aria-label="カラーで絞り込み"><option value="all" ${catalogFilter === "all" ? "selected" : ""}>全カラー</option>${Object.entries(COLORS).map(([id, color]) => `<option value="${id}" ${catalogFilter === id ? "selected" : ""}>${color.label}</option>`).join("")}</select>
        </div><div class="catalog-list">${renderCatalogRows(deck)}</div>
      </section>
      <div class="deck-side"><section class="panel"><div class="panel-head"><h2>デッキリスト</h2><span>${owned.length} 種類</span></div>
        <div class="deck-list">${ownedRows || `<div class="no-results">カード一覧からカードを追加してください</div>`}</div>
        <div class="deck-stats"><div class="stat-line"><span>デッキ枚数</span><strong>${size} <span style="color:#a0a7b1;font-size:9px;font-weight:400">/ 50</span></strong></div><div class="deck-progress ${valid ? "complete" : ""}"><span style="width:${Math.min(size / 50 * 100, 100)}%"></span></div>
          <div class="stat-line"><span>カラー</span><strong>${colors.map((color) => COLORS[color].label).join(" / ") || "—"}</strong></div>
          <div class="stat-line"><span>使用カード</span><strong>${owned.length} 種</strong></div>
          <div class="deck-warning ${valid ? "valid" : ""}">${valid ? "✓ 50枚のデッキが完成しました。一人回しを始められます。" : size < 50 ? `あと ${50 - size} 枚でデッキが完成します。` : "デッキが50枚を超えています。カードを減らしてください。"}</div>
        </div><div class="distribution"><div class="distribution-head"><span>カラー配分</span><span>${colorCount} colors</span></div><div class="distribution-bar">${distribution}</div></div>
      </section><div class="builder-actions"><button class="btn btn-light" data-view="decks">一覧へ戻る</button><button class="btn btn-coral" data-play-editing="${escapeHtml(deck.id)}" ${valid ? "" : "disabled"}>▷ 一人回し</button></div></div>
    </div>
    <dialog id="card-preview-dialog" class="card-preview-dialog" aria-labelledby="card-preview-title">
      <button class="card-preview-close" data-close-card-preview aria-label="閉じる">×</button>
      <div id="card-preview-content"></div>
    </dialog>`;
}

function changeCard(deckId, cardId, delta) {
  const deck = findDeck(deckId);
  const card = getCard(cardId);
  if (!deck || !card) return;
  const count = deck.cards[cardId] || 0;
  const copies = deckCopiesOfCard(deck, card);
  if (delta > 0 && (copies >= 4 || deckSize(deck) >= 50)) {
    showToast(copies >= 4 ? "同じカードは4枚までです。" : "デッキは50枚までです。");
    return;
  }
  const next = count + delta;
  if (next <= 0) delete deck.cards[cardId];
  else deck.cards[cardId] = next;
  deck.updatedAt = Date.now();
  saveDecks();
  const reopenPreview = document.querySelector("#card-preview-dialog")?.open ? previewCardId : null;
  renderBuilderPreservingScroll();
  if (reopenPreview) showCardPreview(reopenPreview);
}

function startGame(deckId) {
  const deck = findDeck(deckId);
  if (!deck || deckSize(deck) === 0) {
    showToast("カードが入ったデッキを選んでください。");
    return;
  }
  const cards = Object.entries(deck.cards).flatMap(([id, count]) => Array(count).fill(id));
  shuffle(cards);
  game = {
    deckId,
    pile: cards.slice(14),
    lifeCards: cards.slice(0, 7),
    hand: cards.slice(7, 14),
    energyLine: Array(3).fill(null),
    frontLine: Array(3).fill(null),
    trash: [],
    removed: [],
    selectedHandIndex: null,
    turn: 1,
    log: [],
  };
  addLog("ゲーム開始。ライフ7枚と初期手札7枚をセットしました。");
  setView("play");
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function addLog(message) {
  if (!game) return;
  game.log.unshift({ time: new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(new Date()), message });
  game.log = game.log.slice(0, 20);
}

function drawCard(log = true) {
  if (!game || game.pile.length === 0) {
    if (game) showToast("山札にカードがありません。");
    return false;
  }
  game.hand.push(game.pile.pop());
  if (log) addLog("カードを1枚ドローしました。");
  return true;
}

function cardMarkup(id, index, zone = "hand") {
  const card = getCard(id);
  if (!card) return "";
  const image = card.image
    ? `<img class="play-card-image" src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}" loading="lazy" />`
    : `<span class="play-card-art">${escapeHtml(card.symbol)}</span>`;
  const selected = zone === "hand" && game.selectedHandIndex === index;
  const action = zone === "hand"
    ? `data-select-card="${index}" aria-pressed="${selected}"`
    : `data-return-card="${zone}:${index}" title="クリックして手札に戻す"`;
  return `<button class="play-card ${selected ? "selected" : ""}" style="--card-color:${COLORS[card.color].hex}" ${action}>
    <span class="play-card-cost">${card.cost}</span>${image}<span class="play-card-name">${escapeHtml(card.name)}</span><span class="play-card-type">${COLORS[card.color].label} · BP ${card.bp || "—"}</span>
  </button>`;
}

function renderPlay() {
  const el = document.querySelector("#view-play");
  if (!game) {
    const available = decks.filter((deck) => deckSize(deck) > 0);
    el.innerHTML = `<div class="page-heading play-heading"><div><div class="eyebrow">SOLO PLAYTEST</div><h1>一人回し</h1><p>手札の感触を確かめて、次の一手を見つけよう。</p></div></div>
      ${available.length ? `<div class="setup-state"><div class="setup-icon">▷</div><h2>デッキを選んでスタート</h2><p>シャッフル後、ライフ7枚と初期手札7枚をセットします。エナジーラインやフロントラインへの移動も試せます。</p><select id="play-deck-select" class="select-input setup-select">${available.map((deck) => `<option value="${escapeHtml(deck.id)}">${escapeHtml(deck.name)}　(${deckSize(deck)}枚)</option>`).join("")}</select><button class="btn btn-coral" data-start-selected>▷　ゲームを始める</button></div>` : `<div class="setup-state"><div class="setup-icon">▤</div><h2>デッキがありません</h2><p>まずはデッキを作ってカードを入れましょう。</p><button class="btn btn-coral" data-action="new-deck">デッキを作る</button></div>`}
      <p class="rules-note" style="margin-top:15px">公式の主要エリア配置を参考にした一人回し用盤面です。AP・エナジーの支払い、効果、バトル等のルール処理は行わないため、実際の対戦では公式ルールをご確認ください。</p>`;
    return;
  }
  const deck = findDeck(game.deckId);
  const hand = game.hand.map((id, index) => cardMarkup(id, index)).join("");
  const renderSlots = (zone) => game[zone].map((id, index) => id
    ? `<div class="field-slot filled">${cardMarkup(id, index, zone)}</div>`
    : `<div class="field-slot">空きスペース</div>`).join("");
  const lifeStack = game.lifeCards.length
    ? `<button class="zone-stack life-stack" data-life-damage aria-label="ライフから1枚を手札に加える"><span class="stack-card"></span><span class="stack-count">${game.lifeCards.length}</span><small>ダメージ</small></button>`
    : `<div class="zone-stack empty-stack"><span class="stack-count">0</span><small>ライフなし</small></div>`;
  const selectedCard = game.selectedHandIndex === null ? null : getCard(game.hand[game.selectedHandIndex]);
  const selected = game.selectedHandIndex !== null && game.hand[game.selectedHandIndex] !== undefined;
  const log = game.log.length ? game.log.map((item) => `<div class="log-item"><span class="log-time">${item.time}</span><span>${escapeHtml(item.message)}</span></div>`).join("") : `<div class="no-results">まだ操作はありません</div>`;
  const image = selectedCard?.image
    ? `<img class="play-card-image" src="${escapeHtml(selectedCard.image)}" alt="${escapeHtml(selectedCard.name)}" loading="lazy" />`
    : "";
  el.innerHTML = `<div class="page-heading play-heading"><div><div class="eyebrow">SOLO PLAYTEST</div><h1>一人回し</h1><p>手札のカードを選び、移動先のエリアに配置できます。</p></div><button class="btn btn-light" data-end-game>← 終了する</button></div>
    <div class="play-layout"><section class="play-table">
      <div class="play-table-top"><div><h2>${escapeHtml(deck?.name || "プレイ中のデッキ")}</h2><p>山札 ${game.pile.length} 枚　·　トラッシュ ${game.trash.length} 枚</p></div><span class="round-badge">TURN ${game.turn}</span></div>
      <div class="utility-zones">
        <button class="zone-stack deck-stack" data-draw aria-label="山札から1枚ドロー"><span class="stack-card"></span><span class="stack-count">${game.pile.length}</span><small>山札 · ドロー</small></button>
        <div class="utility-zone life-zone"><span class="utility-title">LIFE <small>ライフエリア</small></span>${lifeStack}</div>
        <div class="utility-zone ap-zone"><span class="utility-title">AP <small>APエリア</small></span><div class="ap-cards">${[1, 2, 3].map((item) => `<span class="ap-card" aria-label="APカード ${item}">${item}</span>`).join("")}</div></div>
        <div class="utility-zone small-pile"><span class="utility-title">TRASH <small>トラッシュ</small></span><strong>${game.trash.length}</strong><small>枚</small></div>
        <div class="utility-zone small-pile"><span class="utility-title">REMOVED <small>退場エリア</small></span><strong>${game.removed.length}</strong><small>枚</small></div>
      </div>
      <div class="zone-label">ENERGY LINE <span>${game.energyLine.filter(Boolean).length} / 3　·　エナジーエリア</span></div>
      <div class="field-zone energy-zone">${renderSlots("energyLine")}</div>
      <div class="zone-label">FRONT LINE <span>${game.frontLine.filter(Boolean).length} / 3　·　フロントライン</span></div>
      <div class="field-zone front-zone">${renderSlots("frontLine")}</div>
      <div class="zone-label">HAND <span>${game.hand.length} 枚　·　カードを選択</span></div>
      <div class="hand-zone">${hand || `<span class="empty-zone">手札がありません。ドローしてみましょう。</span>`}</div>
      <div class="play-controls"><div class="control-group"><button class="btn btn-light" data-place-zone="energyLine" ${selected ? "" : "disabled"}>${selectedCard ? `↓ ${escapeHtml(selectedCard.name)}をエナジーへ` : "↓ エナジーラインへ"}</button><button class="btn btn-coral" data-place-zone="frontLine" ${selected ? "" : "disabled"}>${selectedCard ? `↑ ${escapeHtml(selectedCard.name)}をフロントへ` : "↑ フロントラインへ"}</button><button class="btn btn-light" data-discard-selected ${selected ? "" : "disabled"}>トラッシュへ</button></div><div class="control-group"><button class="btn btn-light" data-draw-multiple>＋＋ 2枚ドロー</button><button class="btn btn-light" data-mulligan>↻ マリガン</button><button class="btn btn-coral" data-next-turn>次のターン →</button></div></div>
    </section>
    <aside class="game-sidebar"><section class="game-panel"><h3>ゲーム情報</h3><div class="game-stat"><span>ターン</span><strong>${game.turn}</strong></div><div class="game-stat"><span>山札</span><strong>${game.pile.length} 枚</strong></div><div class="game-stat"><span>手札</span><strong>${game.hand.length} 枚</strong></div><div class="game-stat"><span>ライフ</span><strong>${game.lifeCards.length} / 7 枚</strong></div><div class="game-stat"><span>選択中</span><strong>${selectedCard ? escapeHtml(selectedCard.name) : "—"}</strong></div></section>
      <section class="game-panel"><h3>プレイログ</h3><div class="game-log">${log}</div></section>
      <div class="rules-note">手札のカードを選択してから移動先を選びます。場のカードをクリックすると手札に戻ります。山札からのドローとライフからのダメージ移動は各エリアをクリックします。エナジー・APの支払いは手動です。</div>
    </aside></div>`;
}

document.addEventListener("click", (event) => {
  const dialog = document.querySelector("#card-preview-dialog");
  if (dialog && event.target === dialog) { dialog.close(); return; }
  const target = event.target.closest("button");
  if (!target || target.disabled) return;
  if (target.dataset.previewCard) { showCardPreview(target.dataset.previewCard); return; }
  if (target.hasAttribute("data-close-card-preview")) { previewCardId = null; dialog?.close(); return; }
  if (target.dataset.previewAdd) { changeCard(editingDeckId, target.dataset.previewAdd, 1); return; }
  if (target.dataset.previewRemove) { changeCard(editingDeckId, target.dataset.previewRemove, -1); return; }
  if (target.dataset.view) { setView(target.dataset.view); return; }
  if (target.dataset.action === "new-deck") { createDeck(); return; }
  if (target.dataset.openDeck) { openBuilder(target.dataset.openDeck); return; }
  if (target.dataset.editDeck) { openBuilder(target.dataset.editDeck); return; }
  if (target.hasAttribute("data-export-all")) {
    const date = new Date().toISOString().slice(0, 10);
    downloadDecks(decks, `union-deck-lab-${date}`);
    return;
  }
  if (target.dataset.exportDeck) {
    const deck = findDeck(target.dataset.exportDeck);
    if (deck) downloadDecks([deck], (deck.name || "deck").replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim() || "deck");
    return;
  }
  if (target.hasAttribute("data-import-json")) {
    document.querySelector("#deck-json-file").click();
    return;
  }
  if (target.dataset.addCard) { changeCard(editingDeckId, target.dataset.addCard, 1); return; }
  if (target.dataset.removeCard) { changeCard(editingDeckId, target.dataset.removeCard, -1); return; }
  if (target.dataset.duplicateDeck) {
    const source = findDeck(target.dataset.duplicateDeck);
    if (!source) return;
    const copy = { ...source, id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: `${source.name} のコピー`, cards: { ...source.cards }, createdAt: Date.now(), updatedAt: Date.now() };
    decks.unshift(copy); saveDecks(); renderDecks(); showToast("デッキを複製しました。"); return;
  }
  if (target.dataset.deleteDeck) {
    const deck = findDeck(target.dataset.deleteDeck);
    if (!deck) return;
    if (!window.confirm(`「${deck.name}」を削除しますか？`)) return;
    decks = decks.filter((item) => item.id !== deck.id);
    if (editingDeckId === deck.id) editingDeckId = null;
    saveDecks(); renderDecks(); showToast("デッキを削除しました。"); return;
  }
  if (target.dataset.startDeck) { startGame(target.dataset.startDeck); return; }
  if (target.dataset.playEditing) { startGame(target.dataset.playEditing); return; }
  if (target.hasAttribute("data-start-selected")) {
    const select = document.querySelector("#play-deck-select");
    if (select) startGame(select.value);
    return;
  }
  if (target.hasAttribute("data-draw")) { drawCard(); renderPlay(); return; }
  if (target.hasAttribute("data-life-damage")) {
    const id = game.lifeCards.pop();
    if (!id) { showToast("ライフエリアにカードがありません。"); return; }
    game.hand.push(id);
    game.selectedHandIndex = game.hand.length - 1;
    addLog(`${getCard(id).name}をライフエリアから手札に加えました。`);
    renderPlay(); return;
  }
  if (target.hasAttribute("data-draw-multiple")) {
    let drawn = 0;
    for (let i = 0; i < 2 && drawCard(false); i++) drawn++;
    if (drawn) addLog(`${drawn}枚ドローしました。`);
    renderPlay(); return;
  }
  if (target.hasAttribute("data-mulligan")) {
    const count = game.hand.length;
    if (!count) { showToast("戻す手札がありません。"); return; }
    game.pile.push(...game.hand);
    game.hand = [];
    game.selectedHandIndex = null;
    shuffle(game.pile);
    let drawn = 0;
    for (let i = 0; i < count && drawCard(false); i++) drawn++;
    addLog(`手札を戻してシャッフルし、${drawn}枚引き直しました。`);
    renderPlay(); return;
  }
  if (target.hasAttribute("data-next-turn")) {
    game.turn++;
    drawCard(false);
    addLog(`ターン ${game.turn}。1枚ドローしました。`);
    renderPlay(); return;
  }
  if (target.hasAttribute("data-end-game")) { game = null; renderPlay(); return; }
  if (target.dataset.selectCard !== undefined) {
    const handIndex = Number(target.dataset.selectCard);
    game.selectedHandIndex = game.selectedHandIndex === handIndex ? null : handIndex;
    renderPlay(); return;
  }
  if (target.dataset.placeZone) {
    const zone = target.dataset.placeZone;
    if (!["energyLine", "frontLine"].includes(zone) || game.selectedHandIndex === null) return;
    const emptyIndex = game[zone].findIndex((card) => card === null);
    if (emptyIndex < 0) { showToast(`${zone === "energyLine" ? "エナジーライン" : "フロントライン"}に空きがありません。`); return; }
    const [id] = game.hand.splice(game.selectedHandIndex, 1);
    if (!id) return;
    game[zone][emptyIndex] = id;
    game.selectedHandIndex = null;
    addLog(`${getCard(id).name}を${zone === "energyLine" ? "エナジーライン" : "フロントライン"}に置きました。`);
    renderPlay(); return;
  }
  if (target.hasAttribute("data-discard-selected")) {
    if (game.selectedHandIndex === null) return;
    const [id] = game.hand.splice(game.selectedHandIndex, 1);
    if (!id) return;
    game.trash.push(id);
    game.selectedHandIndex = null;
    addLog(`${getCard(id).name}をトラッシュに置きました。`);
    renderPlay(); return;
  }
  if (target.dataset.returnCard !== undefined) {
    const [zone, indexText] = target.dataset.returnCard.split(":");
    if (!["energyLine", "frontLine"].includes(zone)) return;
    const fieldIndex = Number(indexText);
    const id = game[zone][fieldIndex];
    if (!id) return;
    game[zone][fieldIndex] = null;
    game.hand.push(id);
    game.selectedHandIndex = game.hand.length - 1;
    addLog(`${getCard(id).name}を場から手札に戻しました。`);
    renderPlay(); return;
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "deck-name") {
    const deck = findDeck(editingDeckId);
    if (!deck) return;
    deck.name = event.target.value;
    deck.updatedAt = Date.now();
    saveDecks();
    const cursor = event.target.selectionStart;
    renderSidebarDecks();
    event.target.focus();
    event.target.setSelectionRange(cursor, cursor);
  }
  if (event.target.id === "catalog-search") {
    if (!catalogSearchComposing && !event.isComposing) updateCatalogResults();
  }
});

document.addEventListener("compositionstart", (event) => {
  if (event.target.id === "catalog-search") catalogSearchComposing = true;
});

document.addEventListener("compositionend", (event) => {
  if (event.target.id !== "catalog-search") return;
  catalogSearchComposing = false;
  updateCatalogResults();
});

document.addEventListener("change", (event) => {
  if (event.target.id === "color-filter") {
    catalogFilter = event.target.value;
    renderBuilder();
  }
  if (event.target.id === "deck-title") {
    const deck = findDeck(editingDeckId);
    const nextTitle = getTitle(event.target.value);
    if (!deck || !nextTitle || nextTitle.id === deck.titleId) return;
    const incompatible = Object.keys(deck.cards).filter((cardId) => getCard(cardId)?.titleId !== nextTitle.id);
    if (incompatible.length && !window.confirm(`タイトルを変更すると、現在のカード${incompatible.reduce((sum, id) => sum + deck.cards[id], 0)}枚をデッキから外します。続けますか？`)) {
      renderBuilder();
      return;
    }
    deck.cards = Object.fromEntries(Object.entries(deck.cards).filter(([cardId]) => getCard(cardId)?.titleId === nextTitle.id));
    deck.titleId = nextTitle.id;
    deck.updatedAt = Date.now();
    saveDecks();
    renderBuilder();
  }
  if (event.target.id === "deck-json-file") {
    const [file] = event.target.files;
    if (file) importDeckFile(file);
    event.target.value = "";
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "catalog-source-form") return;
  event.preventDefault();
  const sourceUrl = document.querySelector("#catalog-source-url").value.trim();
  if (sourceUrl) refreshCatalog(sourceUrl, true);
});

document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
renderSidebarDecks();
renderDecks();
renderPlay();
const savedCatalogUrl = localStorage.getItem(CATALOG_URL_KEY);
if (savedCatalogUrl) refreshCatalog(savedCatalogUrl);
