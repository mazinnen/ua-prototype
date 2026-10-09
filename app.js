const STORAGE_KEY = "union-deck-lab-decks-v1";
const COLORS = {
  red: { label: "赤", hex: "#e9775f" },
  blue: { label: "青", hex: "#5d8cdb" },
  yellow: { label: "黄", hex: "#d7a548" },
  purple: { label: "紫", hex: "#9772c8" },
  green: { label: "緑", hex: "#4ba47d" },
};

const CATALOG = [
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
];

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
    if (Array.isArray(stored)) return stored.filter((deck) => deck && typeof deck.id === "string" && deck.cards);
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
let game = null;
let toastTimer;

function saveDecks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    const indicator = document.querySelector(".save-indicator");
    if (indicator) indicator.textContent = "✓ 保存しました";
    renderSidebarDecks();
  } catch (error) {
    console.error("デッキを保存できませんでした。", error);
    showToast("保存に失敗しました。ブラウザーの保存領域を確認してください。");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function getCard(id) { return CATALOG.find((card) => card.id === id); }
function deckSize(deck) { return Object.values(deck.cards).reduce((sum, count) => sum + count, 0); }
function deckColors(deck) {
  const colors = [...new Set(Object.entries(deck.cards).filter(([, count]) => count > 0).map(([id]) => getCard(id)?.color).filter(Boolean))];
  return colors;
}
function formatDate(timestamp) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date(timestamp));
}
function findDeck(id) { return decks.find((deck) => deck.id === id); }

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
    return `<article class="deck-card" style="--tint:${first.hex}22">
      <div class="deck-card-top"><div class="deck-color">${dots.map((color) => `<i class="color-dot" style="--dot:${COLORS[color]?.hex || COLORS.red.hex}" title="${COLORS[color]?.label || ""}"></i>`).join("")}</div>
        <div class="deck-actions"><button class="icon-btn" title="編集" aria-label="編集" data-edit-deck="${escapeHtml(deck.id)}">✎</button><button class="icon-btn" title="複製" aria-label="複製" data-duplicate-deck="${escapeHtml(deck.id)}">⧉</button><button class="icon-btn" title="削除" aria-label="削除" data-delete-deck="${escapeHtml(deck.id)}">×</button></div></div>
      <h3>${escapeHtml(deck.name || "無題のデッキ")}</h3><p class="deck-note">${colors.map((color) => COLORS[color]?.label).filter(Boolean).join(" / ") || "カラー未設定"}　 ·　更新 ${formatDate(deck.updatedAt || Date.now())}</p>
      <div class="deck-card-bottom"><span class="deck-count"><strong>${size}</strong> / 50 枚</span><button data-start-deck="${escapeHtml(deck.id)}" ${size ? "" : "disabled"}>一人回しを始める　→</button></div>
    </article>`;
  }).join("");

  document.querySelector("#view-decks").innerHTML = `<div class="page-heading"><div><div class="eyebrow">YOUR WORKSPACE</div><h1>デッキ一覧</h1><p>アイデアを形にして、納得いくまで一人回し。</p></div><button class="btn btn-primary" data-action="new-deck"><span>＋</span> 新しいデッキ</button></div>
    <div class="deck-summary">
      <div class="summary-card"><div><div class="summary-label">保存したデッキ</div><div class="summary-value">${decks.length}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> decks</small></div></div><div class="summary-icon">▤</div></div>
      <div class="summary-card"><div><div class="summary-label">構築済みカード</div><div class="summary-value">${totalCards}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> cards</small></div></div><div class="summary-icon">▧</div></div>
      <div class="summary-card"><div><div class="summary-label">50枚完成デッキ</div><div class="summary-value">${savedValid}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> decks</small></div></div><div class="summary-icon">✓</div></div>
    </div>
    <div class="section-heading"><h2>マイデッキ</h2><span>${decks.length} decks　·　最終更新 ${decks.length ? formatDate(recentDeck) : "—"}</span></div>
    ${decks.length ? `<div class="deck-grid">${deckCards}<button class="deck-card add-deck-card" data-action="new-deck" style="display:grid;place-content:center;justify-items:center;min-height:198px;border-style:dashed;background:transparent;color:#8d97a5"><span style="display:grid;place-items:center;width:37px;height:37px;border:1px solid #e3e6eb;border-radius:50%;font-size:20px">＋</span><span style="margin-top:9px;font-size:10px">デッキを追加</span></button></div>` : `<div class="empty-state"><div class="empty-icon">＋</div><h2>最初のデッキを作ろう</h2><p>カードを選んで、あなたのデッキを組み立てましょう。</p><button class="btn btn-primary" data-action="new-deck">デッキを作る</button></div>`}
    <p class="rules-note" style="margin-top:19px">このアプリは非公式のデッキ構築・プレイテスト用ツールです。カード名とデータは操作確認用のサンプルです。</p>`;
}

function openBuilder(deckId = null) {
  editingDeckId = deckId;
  catalogFilter = "all";
  catalogQuery = "";
  setView("builder");
}

function createDeck() {
  const deck = { id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "新しいデッキ", cards: {}, createdAt: Date.now(), updatedAt: Date.now() };
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
  const filtered = CATALOG.filter((card) => (catalogFilter === "all" || card.color === catalogFilter) && `${card.name} ${card.type} ${COLORS[card.color].label}`.toLowerCase().includes(catalogQuery.toLowerCase()));
  const cardRows = filtered.map((card) => `<div class="catalog-row">
    <div class="mini-card" style="--card-color:${COLORS[card.color].hex}">${card.symbol}</div>
    <div><p class="card-title">${escapeHtml(card.name)}</p><div class="card-meta"><span>${COLORS[card.color].label}</span><span>${card.type}</span><span>BP ${card.bp || "—"}</span></div></div>
    <span class="card-cost">${card.cost}</span><button class="add-card-btn" data-add-card="${card.id}" aria-label="${escapeHtml(card.name)}を追加">＋</button>
  </div>`).join("");
  const owned = Object.entries(deck.cards).filter(([, count]) => count > 0).sort((a, b) => (getCard(a[0])?.cost || 0) - (getCard(b[0])?.cost || 0));
  const ownedRows = owned.map(([id, count]) => {
    const card = getCard(id);
    if (!card) return "";
    return `<div class="deck-list-row"><div><div class="owned-card-title">${escapeHtml(card.name)}</div><div class="owned-card-meta">${COLORS[card.color].label}　·　${card.cost}コスト　·　BP ${card.bp || "—"}</div></div><div class="quantity-control"><button data-remove-card="${card.id}" aria-label="${escapeHtml(card.name)}を1枚減らす">−</button><strong>${count}</strong><button data-add-card="${card.id}" aria-label="${escapeHtml(card.name)}を1枚増やす" ${count >= 4 || size >= 50 ? "disabled" : ""}>＋</button></div></div>`;
  }).join("");
  const colorCount = colors.length;
  const valid = size === 50 && owned.every(([, count]) => count <= 4);
  const colorParts = Object.entries(deck.cards).reduce((counts, [id, count]) => {
    const color = getCard(id)?.color;
    if (color) counts[color] = (counts[color] || 0) + count;
    return counts;
  }, {});
  const distribution = Object.entries(colorParts).map(([color, count]) => `<span style="width:${size ? count / size * 100 : 0}%;background:${COLORS[color].hex}" title="${COLORS[color].label}: ${count}枚"></span>`).join("");

  document.querySelector("#view-builder").innerHTML = `<div class="builder-top"><button class="back-btn" data-view="decks">← デッキ一覧</button><div class="save-indicator">✓ 保存しました</div><div class="builder-title"><input id="deck-name" maxlength="40" value="${escapeHtml(deck.name)}" aria-label="デッキ名" /><span class="deck-color">${colors.map((color) => `<i class="color-dot" style="--dot:${COLORS[color].hex}"></i>`).join("")}</span></div></div>
    <div class="builder-layout">
      <section class="panel catalog-panel"><div class="panel-head"><h2>カード一覧</h2><span>${filtered.length} cards</span></div>
        <div class="catalog-tools"><div class="search-wrap"><input class="search-input" id="catalog-search" placeholder="カード名で検索..." value="${escapeHtml(catalogQuery)}" /></div>
          <select class="select-input" id="color-filter" aria-label="カラーで絞り込み"><option value="all" ${catalogFilter === "all" ? "selected" : ""}>全カラー</option>${Object.entries(COLORS).map(([id, color]) => `<option value="${id}" ${catalogFilter === id ? "selected" : ""}>${color.label}</option>`).join("")}</select>
        </div><div class="catalog-list">${cardRows || `<div class="no-results">該当するカードがありません</div>`}</div>
      </section>
      <div class="deck-side"><section class="panel"><div class="panel-head"><h2>デッキリスト</h2><span>${owned.length} 種類</span></div>
        <div class="deck-list">${ownedRows || `<div class="no-results">カード一覧からカードを追加してください</div>`}</div>
        <div class="deck-stats"><div class="stat-line"><span>デッキ枚数</span><strong>${size} <span style="color:#a0a7b1;font-size:9px;font-weight:400">/ 50</span></strong></div><div class="deck-progress ${valid ? "complete" : ""}"><span style="width:${Math.min(size / 50 * 100, 100)}%"></span></div>
          <div class="stat-line"><span>カラー</span><strong>${colors.map((color) => COLORS[color].label).join(" / ") || "—"}</strong></div>
          <div class="stat-line"><span>使用カード</span><strong>${owned.length} 種</strong></div>
          <div class="deck-warning ${valid ? "valid" : ""}">${valid ? "✓ 50枚のデッキが完成しました。一人回しを始められます。" : size < 50 ? `あと ${50 - size} 枚でデッキが完成します。` : "デッキが50枚を超えています。カードを減らしてください。"}</div>
        </div><div class="distribution"><div class="distribution-head"><span>カラー配分</span><span>${colorCount} colors</span></div><div class="distribution-bar">${distribution}</div></div>
      </section><div class="builder-actions"><button class="btn btn-light" data-view="decks">一覧へ戻る</button><button class="btn btn-coral" data-play-editing="${escapeHtml(deck.id)}" ${valid ? "" : "disabled"}>▷ 一人回し</button></div></div>
    </div>`;
}

function changeCard(deckId, cardId, delta) {
  const deck = findDeck(deckId);
  const card = getCard(cardId);
  if (!deck || !card) return;
  const count = deck.cards[cardId] || 0;
  if (delta > 0 && (count >= 4 || deckSize(deck) >= 50)) {
    showToast(count >= 4 ? "同じカードは4枚までです。" : "デッキは50枚までです。");
    return;
  }
  const next = count + delta;
  if (next <= 0) delete deck.cards[cardId];
  else deck.cards[cardId] = next;
  deck.updatedAt = Date.now();
  saveDecks();
  renderBuilder();
}

function startGame(deckId) {
  const deck = findDeck(deckId);
  if (!deck || deckSize(deck) === 0) {
    showToast("カードが入ったデッキを選んでください。");
    return;
  }
  const cards = Object.entries(deck.cards).flatMap(([id, count]) => Array(count).fill(id));
  shuffle(cards);
  game = { deckId, pile: cards, hand: [], field: Array(5).fill(null), trash: [], turn: 1, life: 7, log: [] };
  for (let i = 0; i < 7; i++) drawCard(false);
  addLog("ゲーム開始。初期手札を7枚引きました。");
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

function cardMarkup(id, index, inField = false) {
  const card = getCard(id);
  if (!card) return "";
  return `<button class="play-card" style="--card-color:${COLORS[card.color].hex}" ${inField ? `data-return-card="${index}" title="クリックして手札に戻す"` : `data-play-card="${index}" title="クリックして場に出す"`}>
    <span class="play-card-cost">${card.cost}</span><span class="play-card-art">${card.symbol}</span><span class="play-card-name">${escapeHtml(card.name)}</span><span class="play-card-type">${COLORS[card.color].label} · BP ${card.bp || "—"}</span>
  </button>`;
}

function renderPlay() {
  const el = document.querySelector("#view-play");
  if (!game) {
    const available = decks.filter((deck) => deckSize(deck) > 0);
    el.innerHTML = `<div class="page-heading play-heading"><div><div class="eyebrow">SOLO PLAYTEST</div><h1>一人回し</h1><p>手札の感触を確かめて、次の一手を見つけよう。</p></div></div>
      ${available.length ? `<div class="setup-state"><div class="setup-icon">▷</div><h2>デッキを選んでスタート</h2><p>山札をシャッフルして初期手札を引きます。カードを場に出したり、ターンを進めたりして動きを試せます。</p><select id="play-deck-select" class="select-input setup-select">${available.map((deck) => `<option value="${escapeHtml(deck.id)}">${escapeHtml(deck.name)}　(${deckSize(deck)}枚)</option>`).join("")}</select><button class="btn btn-coral" data-start-selected>▷　ゲームを始める</button></div>` : `<div class="setup-state"><div class="setup-icon">▤</div><h2>デッキがありません</h2><p>まずはデッキを作ってカードを入れましょう。</p><button class="btn btn-coral" data-action="new-deck">デッキを作る</button></div>`}
      <p class="rules-note" style="margin-top:15px">一人回し用の簡易プレイエリアです。ターン進行やエナジー等のルール処理は自動化していません。</p>`;
    return;
  }
  const deck = findDeck(game.deckId);
  const hand = game.hand.map((id, index) => cardMarkup(id, index)).join("");
  const field = game.field.map((id, index) => id ? `<div class="field-slot filled">${cardMarkup(id, index, true)}</div>` : `<div class="field-slot">空きスペース</div>`).join("");
  const log = game.log.length ? game.log.map((item) => `<div class="log-item"><span class="log-time">${item.time}</span><span>${escapeHtml(item.message)}</span></div>`).join("") : `<div class="no-results">まだ操作はありません</div>`;
  el.innerHTML = `<div class="page-heading play-heading"><div><div class="eyebrow">SOLO PLAYTEST</div><h1>一人回し</h1><p>カードをクリックして場に出す・手札に戻すことができます。</p></div><button class="btn btn-light" data-end-game>← 終了する</button></div>
    <div class="play-layout"><section class="play-table">
      <div class="play-table-top"><div><h2>${escapeHtml(deck?.name || "プレイ中のデッキ")}</h2><p>山札 ${game.pile.length} 枚　·　トラッシュ ${game.trash.length} 枚</p></div><span class="round-badge">TURN ${game.turn}</span></div>
      <div class="zone-label">HAND <span>${game.hand.length} 枚　·　カードをクリックして場へ</span></div>
      <div class="hand-zone">${hand || `<span class="empty-zone">手札がありません。ドローしてみましょう。</span>`}</div>
      <div class="zone-label">FIELD <span>カードをクリックして手札に戻す</span></div><div class="field-zone">${field}</div>
      <div class="play-controls"><div class="control-group"><button class="btn btn-light" data-draw>＋ 1枚ドロー</button><button class="btn btn-light" data-draw-multiple>＋＋ 2枚ドロー</button><button class="btn btn-light" data-mulligan>↻ マリガン</button></div><div class="control-group"><button class="btn btn-coral" data-next-turn>次のターン →</button></div></div>
    </section>
    <aside class="game-sidebar"><section class="game-panel"><h3>ゲーム情報</h3><div class="game-stat"><span>ターン</span><strong>${game.turn}</strong></div><div class="game-stat"><span>山札</span><strong>${game.pile.length} 枚</strong></div><div class="game-stat"><span>手札</span><strong>${game.hand.length} 枚</strong></div><div class="game-stat"><span>ライフ（メモ）</span><div class="life-controls"><button data-life="-1" aria-label="ライフを減らす">−</button><strong>${game.life}</strong><button data-life="1" aria-label="ライフを増やす">＋</button></div></div></section>
      <section class="game-panel"><h3>プレイログ</h3><div class="game-log">${log}</div></section>
      <div class="rules-note">カードを場に出すには、手札のカードをクリック。場のカードをクリックすると手札に戻ります。マリガンは手札を山札に戻してシャッフルします。</div>
    </aside></div>`;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target || target.disabled) return;
  if (target.dataset.view) { setView(target.dataset.view); return; }
  if (target.dataset.action === "new-deck") { createDeck(); return; }
  if (target.dataset.openDeck) { openBuilder(target.dataset.openDeck); return; }
  if (target.dataset.editDeck) { openBuilder(target.dataset.editDeck); return; }
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
  if (target.dataset.playCard !== undefined) {
    const handIndex = Number(target.dataset.playCard);
    const emptyIndex = game.field.findIndex((card) => card === null);
    if (emptyIndex < 0) { showToast("場に空きスペースがありません。"); return; }
    const [id] = game.hand.splice(handIndex, 1);
    if (!id) return;
    game.field[emptyIndex] = id;
    addLog(`${getCard(id).name}を場に出しました。`);
    renderPlay(); return;
  }
  if (target.dataset.returnCard !== undefined) {
    const fieldIndex = Number(target.dataset.returnCard);
    const [id] = game.field.splice(fieldIndex, 1);
    game.field.splice(fieldIndex, 0, null);
    if (!id) return;
    game.hand.push(id);
    addLog(`${getCard(id).name}を手札に戻しました。`);
    renderPlay(); return;
  }
  if (target.dataset.life) {
    game.life = Math.max(0, game.life + Number(target.dataset.life));
    renderPlay();
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
    catalogQuery = event.target.value;
    const cursor = event.target.selectionStart;
    renderBuilder();
    const input = document.querySelector("#catalog-search");
    input.focus();
    input.setSelectionRange(cursor, cursor);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "color-filter") {
    catalogFilter = event.target.value;
    renderBuilder();
  }
});

document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
renderSidebarDecks();
renderDecks();
renderPlay();
