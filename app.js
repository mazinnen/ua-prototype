const STORAGE_KEY = "union-deck-lab-decks-v1";
const LOCAL_BACKUP_KEY = `${STORAGE_KEY}-before-cloud`;
const cloudConfig = window.UNION_DECK_SUPABASE || {};
const supabaseClient = cloudConfig.url && cloudConfig.anonKey && window.supabase?.createClient
  ? window.supabase.createClient(cloudConfig.url, cloudConfig.anonKey)
  : null;
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

function setCloudStatus(message, state = "local") {
      const status = document.querySelector(".local-status");
      if (!status) return;
      status.classList.toggle("cloud-error", state === "error");
      status.classList.toggle("cloud-active", state === "cloud");
      const label = status.querySelector("span");
      if (label) label.textContent = message;
    }

function renderAuthStatus() {
      const button = document.querySelector("[data-open-auth]");
      const form = document.querySelector("#auth-form");
      const signedInPanel = document.querySelector("#signed-in-panel");
      const emailLabel = document.querySelector("#signed-in-email");
      if (!button || !form || !signedInPanel) return;
      button.textContent = cloudUser ? "アカウント" : "ログイン";
      form.hidden = Boolean(cloudUser);
      signedInPanel.hidden = !cloudUser;
      if (emailLabel) emailLabel.textContent = cloudUser?.email || "";
    }

function queueChangedDecks(nextDecks) {
      const previous = new Map(lastSavedDeckSnapshot.map((deck) => [deck.id, JSON.stringify(deck)]));
      const next = new Map(nextDecks.map((deck) => [deck.id, deck]));
      for (const deck of nextDecks) {
        if (previous.get(deck.id) !== JSON.stringify(deck)) {
          pendingCloudUpserts.set(deck.id, deck);
          pendingCloudDeletes.delete(deck.id);
        }
      }
      for (const id of previous.keys()) {
        if (!next.has(id)) {
          pendingCloudUpserts.delete(id);
          pendingCloudDeletes.add(id);
        }
      }
      lastSavedDeckSnapshot = structuredClone(nextDecks);
      if (!cloudUser || !cloudDecksReady || !supabaseClient) return;
      setCloudStatus("クラウドへ同期中…", "cloud");
      clearTimeout(cloudSyncTimer);
      cloudSyncTimer = setTimeout(flushCloudDeckChanges, 450);
    }

async function flushCloudDeckChanges() {
      if (!cloudUser || !cloudDecksReady || !supabaseClient) return;
      const userId = cloudUser.id;
      const upserts = [...pendingCloudUpserts.values()].map((deck) => ({
        user_id: userId,
        deck_id: deck.id,
        deck_data: deck,
        updated_at: new Date().toISOString(),
      }));
      const deletes = [...pendingCloudDeletes];
      pendingCloudUpserts.clear();
      pendingCloudDeletes.clear();
      try {
        if (upserts.length) {
          const { error } = await supabaseClient.from("user_decks").upsert(upserts, { onConflict: "user_id,deck_id" });
          if (error) throw error;
        }
        if (deletes.length) {
          const { error } = await supabaseClient.from("user_decks").delete().eq("user_id", userId).in("deck_id", deletes);
          if (error) throw error;
        }
        setCloudStatus("クラウドに同期済み", "cloud");
      } catch (error) {
        console.error("デッキをクラウドに同期できませんでした。", error);
        upserts.forEach((row) => pendingCloudUpserts.set(row.deck_id, row.deck_data));
        deletes.forEach((id) => pendingCloudDeletes.add(id));
        setCloudStatus("クラウド同期エラー", "error");
        showToast("クラウドへの保存に失敗しました。接続とSupabaseの設定を確認してください。");
      }
    }

async function loadCloudCatalog() {
      if (!supabaseClient) return;
      try {
        const [{ data: cloudTitles, error: titlesError }, { data: cloudCards, error: cardsError }] = await Promise.all([
          supabaseClient.from("titles").select("id,name"),
          supabaseClient.from("cards").select("*"),
        ]);
        if (titlesError) throw titlesError;
        if (cardsError) throw cardsError;
        if (!cloudTitles.length && !cloudCards.length) return;
        const titleMap = new Map(titles.map((title) => [title.id, title]));
        cloudTitles.forEach((title) => titleMap.set(title.id, title));
        const cardMap = new Map(catalog.map((card) => [card.id, card]));
        cloudCards.forEach((row) => cardMap.set(row.id, {
          ...row,
          titleId: row.title_id,
          cardNumber: row.card_number,
          apCost: row.ap_cost,
          requiredEnergy: row.required_energy,
          generatedEnergy: row.generated_energy,
        }));
        titles = [...titleMap.values()];
        catalog = [...cardMap.values()];
        if (activeView === "builder") renderBuilder();
        if (activeView === "decks") renderDecks();
      } catch (error) {
        console.error("共有カードカタログを読み込めませんでした。", error);
        showToast("共有カードデータを取得できません。Supabaseの設定とRLSを確認してください。");
      }
    }

function preserveLocalDeckBackup() {
      try {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          localStorage.setItem(LOCAL_BACKUP_KEY, localData);
          return true;
        }
      } catch (error) {
        console.error("クラウド移行前のローカルデッキをバックアップできませんでした。", error);
        showToast("ローカルデッキのバックアップを作成できません。ブラウザーの保存領域を確認してください。");
      }
      return false;
    }

async function activateCloudUser(user) {
      if (!user || !supabaseClient || (cloudUser?.id === user.id && cloudDecksReady) || activatingCloudUserId === user.id) return;
      activatingCloudUserId = user.id;
      setCloudStatus("クラウドを読み込み中…");
      try {
        const { data, error } = await supabaseClient.from("user_decks")
          .select("deck_id,deck_data").eq("user_id", user.id);
        if (error) throw error;
        const remoteDecks = data.map((row) => row.deck_data);
        const localDecks = decks;
        pendingCloudUpserts.clear();
        pendingCloudDeletes.clear();
        clearTimeout(cloudSyncTimer);
        const hasLocalBackup = preserveLocalDeckBackup();
        cloudUser = user;
        renderAuthStatus();

        if (!remoteDecks.length && localDecks.length) {
          if (window.confirm(`このアカウントにはまだデッキがありません。現在のローカルデッキ ${localDecks.length} 件をクラウドへ保存しますか？\n\n「キャンセル」を選ぶとクラウドを空の状態で開きます。ローカルデータのバックアップはこのブラウザーに残ります。`)) {
            decks = localDecks;
          } else {
            decks = [];
          }
        } else {
          decks = remoteDecks;
          if (hasLocalBackup && remoteDecks.length) {
            showToast("クラウドのデッキを読み込みました。移行前のローカルデータはこの端末にバックアップしました。");
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
        lastSavedDeckSnapshot = structuredClone(decks);
        cloudDecksReady = true;
        renderSidebarDecks();
        renderDecks();
        renderPlay();
        setCloudStatus("クラウドに同期済み", "cloud");
        if (!remoteDecks.length && decks.length) {
          decks.forEach((deck) => pendingCloudUpserts.set(deck.id, deck));
          await flushCloudDeckChanges();
        }
        document.querySelector("#auth-dialog")?.close();
      } catch (error) {
        console.error("クラウドデッキを読み込めませんでした。", error);
        cloudDecksReady = false;
        setCloudStatus("クラウド接続エラー", "error");
        showToast("クラウドのデッキを読み込めません。Supabaseの設定とRLSを確認してください。");
      } finally {
        if (activatingCloudUserId === user.id) activatingCloudUserId = null;
      }
    }

function initializeSupabase() {
      if (!supabaseClient) {
        setCloudStatus("この端末に保存");
        renderAuthStatus();
        return;
      }
      loadCloudCatalog();
      const { data: listener } = supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          clearTimeout(cloudSyncTimer);
          cloudUser = null;
          cloudDecksReady = false;
          pendingCloudUpserts.clear();
          pendingCloudDeletes.clear();
          lastSavedDeckSnapshot = structuredClone(decks);
          renderAuthStatus();
          setCloudStatus("この端末に保存");
          return;
        }
        if (session?.user) setTimeout(() => activateCloudUser(session.user), 0);
      });
      void listener;
      supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (data.session?.user) return activateCloudUser(data.session.user);
        setCloudStatus("この端末に保存");
      }).catch((error) => {
        console.error("Supabaseのログイン状態を確認できませんでした。", error);
        setCloudStatus("クラウド接続エラー", "error");
        showToast("Supabaseに接続できません。設定とネットワークを確認してください。");
      });
}

let activeView = "decks";
let editingDeckId = null;
let catalogFilter = "all";
let catalogQuery = "";
let catalogSearchComposing = false;
let previewCardId = null;
let game = null;
let onlineRoom = null;
let applyingOnlineState = false;
let lastOnlineSnapshot = "";
let toastTimer;
let cloudUser = null;
let cloudDecksReady = false;
let activatingCloudUserId = null;
let cloudSyncTimer = null;
let pendingCloudUpserts = new Map();
let pendingCloudDeletes = new Set();
let lastSavedDeckSnapshot;
let decks = loadDecks();
lastSavedDeckSnapshot = structuredClone(decks);

function saveDecks(nextDecks = decks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDecks));
    decks = nextDecks;
    queueChangedDecks(nextDecks);
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
    <button class="mini-card card-preview-trigger catalog-card-art" data-preview-card="${escapeHtml(card.id)}" style="--card-color:${COLORS[card.color].hex}" aria-label="${escapeHtml(card.name)}のカード画像と詳細を表示">${card.image ? `<img class="catalog-card-image" src="${escapeHtml(card.image)}" alt="" loading="lazy" />` : escapeHtml(card.symbol)}</button>
    <div class="catalog-card-info"><div class="catalog-card-heading"><button class="card-title card-title-preview" data-preview-card="${escapeHtml(card.id)}">${escapeHtml(card.name)}</button><span class="card-cost">${card.cost}</span></div>
      <div class="card-meta"><span>${COLORS[card.color].label}</span><span>${card.type}</span><span>BP ${card.bp || "—"}</span>${card.cardNumber ? `<span>${escapeHtml(card.cardNumber)}</span>` : ""}</div>
      <button class="add-card-btn" data-add-card="${escapeHtml(card.id)}" aria-label="${escapeHtml(card.name)}を追加" ${deckCopiesOfCard(deck, card) >= 4 || size >= 50 ? "disabled" : ""}>＋</button></div>
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

  document.querySelector("#view-decks").innerHTML = `<div class="page-heading"><div><div class="eyebrow">YOUR WORKSPACE</div><h1>デッキ一覧</h1><p>アイデアを形にして、納得いくまで一人回し。</p></div><div class="deck-toolbar"><button class="btn btn-light" data-export-all>↓ JSON書き出し</button><button class="btn btn-light" data-import-json>↑ JSON読み込み</button><button class="btn btn-primary" data-action="new-deck"><span>＋</span> 新しいデッキ</button><input id="deck-json-file" type="file" accept=".json,application/json" hidden /></div></div>
    <div class="deck-summary">
      <div class="summary-card"><div><div class="summary-label">保存したデッキ</div><div class="summary-value">${decks.length}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> decks</small></div></div><div class="summary-icon">▤</div></div>
      <div class="summary-card"><div><div class="summary-label">構築済みカード</div><div class="summary-value">${totalCards}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> cards</small></div></div><div class="summary-icon">▧</div></div>
      <div class="summary-card"><div><div class="summary-label">50枚完成デッキ</div><div class="summary-value">${savedValid}<small style="font-size:10px;font-weight:500;color:#9aa2ad"> decks</small></div></div><div class="summary-icon">✓</div></div>
    </div>
    <div class="section-heading"><h2>マイデッキ</h2><span>${decks.length} decks　·　最終更新 ${decks.length ? formatDate(recentDeck) : "—"}</span></div>
    ${decks.length ? `<div class="deck-grid">${deckCards}<button class="deck-card add-deck-card" data-action="new-deck" style="display:grid;place-content:center;justify-items:center;min-height:198px;border-style:dashed;background:transparent;color:#8d97a5"><span style="display:grid;place-items:center;width:37px;height:37px;border:1px solid #e3e6eb;border-radius:50%;font-size:20px">＋</span><span style="margin-top:9px;font-size:10px">デッキを追加</span></button></div>` : `<div class="empty-state"><div class="empty-icon">＋</div><h2>最初のデッキを作ろう</h2><p>カードを選んで、あなたのデッキを組み立てましょう。</p><button class="btn btn-primary" data-action="new-deck">デッキを作る</button></div>`}
    <p class="rules-note" style="margin-top:19px">${cloudUser ? "デッキはこのアカウントに同期されます。移行やバックアップにはJSON書き出し・読み込みもご利用ください。" : "デッキはこのブラウザーに自動保存されます。別の端末への移行にはJSON書き出し・読み込みをご利用ください。"} カード名とデータは操作確認用のサンプルを含みます。</p>`;
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
    return `<div class="deck-list-row"><button class="mini-card card-preview-trigger owned-card-art" data-preview-card="${escapeHtml(card.id)}" style="--card-color:${COLORS[card.color].hex}" aria-label="${escapeHtml(card.name)}のカード画像と詳細を表示">${card.image ? `<img class="catalog-card-image" src="${escapeHtml(card.image)}" alt="" loading="lazy" />` : escapeHtml(card.symbol)}</button><div class="owned-card-content"><button class="owned-card-title card-title-preview" data-preview-card="${escapeHtml(card.id)}">${escapeHtml(card.name)}</button><div class="owned-card-meta">${COLORS[card.color].label}　·　${card.cost}コスト　·　BP ${card.bp || "—"}${card.cardNumber ? `　·　${escapeHtml(card.cardNumber)}` : ""}</div></div><div class="quantity-control"><button data-remove-card="${escapeHtml(card.id)}" aria-label="${escapeHtml(card.name)}を1枚減らす">−</button><strong>${count}</strong><button data-add-card="${escapeHtml(card.id)}" aria-label="${escapeHtml(card.name)}を1枚増やす" ${copies >= 4 || size >= 50 ? "disabled" : ""}>＋</button></div></div>`;
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
    energyLine: Array(4).fill(null),
    frontLine: Array(4).fill(null),
    trash: [],
    removed: [],
    rotated: {},
    raidStacks: {},
    selectedHandIndex: null,
    peeked: null,
    peekOriginal: null,
    dialogMode: null,
    turn: 1,
    log: [],
  };
  addLog("ゲーム開始。ライフ7枚と初期手札7枚をセットしました。");
  setView("play");
}

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = new Uint8Array(6);
  crypto.getRandomValues(random);
  return [...random].map((value) => alphabet[value % alphabet.length]).join("");
}

function createPublicBoardSnapshot() {
  if (!game || !onlineRoom) return null;
  const deck = findDeck(game.deckId);
  return {
    playerId: onlineRoom.playerId,
    playerName: "プレイヤー",
    deckName: deck?.name || "プレイ中のデッキ",
    turn: game.turn,
    frontLine: [...game.frontLine],
    energyLine: [...game.energyLine],
    raidStacks: structuredClone(game.raidStacks || {}),
    rotated: { ...game.rotated },
    handCount: game.hand.length,
    pileCount: game.pile.length,
    lifeCount: game.lifeCards.length,
    trash: [...game.trash],
    removed: [...game.removed],
  };
}

function isValidOnlineSnapshot(snapshot, expectedSenderId) {
  const isCardZone = (zone) => Array.isArray(snapshot[zone])
    && snapshot[zone].length === 4
    && snapshot[zone].every((cardId) => cardId === null || (typeof cardId === "string" && cardId.length <= 100));
  const isCardList = (cards) => Array.isArray(cards)
    && cards.length <= 50
    && cards.every((cardId) => typeof cardId === "string" && cardId.length <= 100);
  return Boolean(snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
    && typeof snapshot.playerId === "string" && snapshot.playerId === expectedSenderId
    && typeof snapshot.playerName === "string" && snapshot.playerName.length <= 40
    && isCardZone("frontLine") && isCardZone("energyLine")
    && snapshot.raidStacks && typeof snapshot.raidStacks === "object" && !Array.isArray(snapshot.raidStacks)
    && Object.entries(snapshot.raidStacks).every(([key, stack]) =>
      /^(frontLine|energyLine):[0-3]$/.test(key) && isCardList(stack))
    && snapshot.rotated && typeof snapshot.rotated === "object" && !Array.isArray(snapshot.rotated)
    && Object.entries(snapshot.rotated).every(([key, rotated]) =>
      /^(frontLine|energyLine):[0-3]$/.test(key) && typeof rotated === "boolean")
    && ["turn", "handCount", "pileCount", "lifeCount"].every((key) =>
      Number.isInteger(snapshot[key]) && snapshot[key] >= 0 && snapshot[key] <= 10000)
    && isCardList(snapshot.trash) && isCardList(snapshot.removed));
}

function publishOnlineState() {
  if (!onlineRoom?.connected || !game || applyingOnlineState) return;
  const snapshot = createPublicBoardSnapshot();
  const signature = JSON.stringify(snapshot);
  if (signature === lastOnlineSnapshot) return;
  lastOnlineSnapshot = signature;
  onlineRoom.channel.send({
    type: "broadcast",
    event: "board-state",
    payload: { snapshot },
  }).then((status) => {
    if (status !== "ok") {
      console.error("対戦盤面を共有できませんでした。", status);
      showToast("盤面の共有に失敗しました。接続状態を確認してください。");
    }
  }).catch((error) => {
    console.error("対戦盤面を共有できませんでした。", error);
    showToast("盤面の共有に失敗しました。接続状態を確認してください。");
  });
}

async function connectOnlineRoom(deckId, requestedCode = "") {
  if (!supabaseClient) {
    showToast("オンライン対戦にはSupabaseの設定が必要です。");
    return;
  }
  const deck = findDeck(deckId);
  if (!deck || !deckSize(deck)) {
    showToast("カードが入ったデッキを選んでください。");
    return;
  }
  const code = requestedCode ? requestedCode.trim().toUpperCase() : createRoomCode();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    showToast("ルームコードは英数字6文字で入力してください。");
    return;
  }
  await leaveOnlineRoom(false);
  const playerId = crypto.randomUUID();
  const channel = supabaseClient.channel(`ua-game:${code}`, {
    config: { broadcast: { self: false }, presence: { key: playerId } },
  });
  onlineRoom = { code, playerId, channel, connected: false, opponent: null, opponentId: null, status: "接続中…" };
  lastOnlineSnapshot = "";
  channel
    .on("broadcast", { event: "board-state" }, ({ payload }) => {
      const snapshot = payload?.snapshot;
      if (!onlineRoom || onlineRoom.playerId !== playerId || !snapshot || snapshot.playerId === playerId) return;
      if (!isValidOnlineSnapshot(snapshot, onlineRoom.opponentId)) {
        console.warn("無効な対戦盤面データを受信したため破棄しました。");
        return;
      }
      onlineRoom.opponent = snapshot;
      onlineRoom.status = "対戦相手と接続中";
      if (game) {
        applyingOnlineState = true;
        renderPlay();
        applyingOnlineState = false;
      } else {
        renderPlay();
      }
    })
    .on("presence", { event: "sync" }, () => {
      if (!onlineRoom || onlineRoom.playerId !== playerId) return;
      const players = Object.values(channel.presenceState()).flat();
      const orderedPlayers = [...players].sort((left, right) =>
        (left.joinedAt || 0) - (right.joinedAt || 0) || left.playerId.localeCompare(right.playerId));
      if (orderedPlayers.length > 2 && orderedPlayers.findIndex((player) => player.playerId === playerId) > 1) {
        showToast("このルームは満員です。別のルームコードを使用してください。");
        void leaveOnlineRoom(true);
        return;
      }
      const opponent = orderedPlayers.find((player) => player.playerId !== playerId);
      if (players.length > 2) {
        showToast("このルームは満員です。別のルームコードを使用してください。");
        void leaveOnlineRoom(true);
        return;
      }
      onlineRoom.opponentName = opponent?.playerName || null;
      onlineRoom.opponentId = opponent?.playerId || null;
      if (!opponent) onlineRoom.opponent = null;
      onlineRoom.status = opponent ? "対戦相手と接続中" : "相手の参加を待っています";
      if (opponent && game) lastOnlineSnapshot = "";
      renderPlay();
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const currentPlayers = Object.values(channel.presenceState()).flat();
        if (currentPlayers.length >= 2) {
          showToast("このルームは満員です。別のルームコードを使用してください。");
          await leaveOnlineRoom(true);
          return;
        }
        try {
          const { error } = await channel.track({
            playerId,
            playerName: "プレイヤー",
            joinedAt: Date.now(),
          });
          if (error) throw error;
        } catch (error) {
          console.error("対戦ルームに参加できませんでした。", error);
          showToast("対戦ルームへの参加に失敗しました。");
          await leaveOnlineRoom(true);
          return;
        }
        if (!onlineRoom || onlineRoom.playerId !== playerId) return;
        onlineRoom.connected = true;
        startGame(deckId);
        showToast(requestedCode ? `ルーム ${code} に参加しました。` : `ルーム ${code} を作成しました。コードを友人に共有してください。`);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("対戦ルームへの接続に失敗しました。", status);
        showToast("対戦ルームに接続できません。SupabaseのRealtime設定を確認してください。");
        await leaveOnlineRoom(true);
      }
    });
}

async function leaveOnlineRoom(returnToSetup = false) {
  const currentRoom = onlineRoom;
  onlineRoom = null;
  lastOnlineSnapshot = "";
  if (currentRoom?.channel) {
    try {
      const status = await currentRoom.channel.unsubscribe();
      if (status !== "ok") throw new Error(`Realtime unsubscribe status: ${status}`);
    } catch (error) {
      console.error("対戦ルームから退出できませんでした。", error);
      showToast("対戦ルームの切断に失敗しました。");
    }
  }
  if (returnToSetup) {
    game = null;
    renderPlay();
  }
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

function cardMarkup(id, index, zone = "hand", layer = 0) {
  const card = getCard(id);
  if (!card) return "";
  const image = card.image
    ? `<img class="play-card-image" src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}" loading="lazy" />`
    : `<span class="play-card-art">${escapeHtml(card.symbol)}</span>`;
  const selected = zone === "hand" && game.selectedHandIndex === index;
  const action = zone === "hand"
    ? `data-select-card="${index}" aria-pressed="${selected}"`
    : `data-return-card="${zone}:${index}:${layer}" title="クリックして手札に戻す。別のエリアへドラッグできます" aria-label="${escapeHtml(card.name)}。右クリックで縦横切替"`;
  const dragSource = zone === "hand" ? `hand:${index}` : `field:${zone}:${index}:${layer}`;
  const rotated = zone !== "hand" && game.rotated[`${zone}:${index}`];
  return `<button class="play-card ${selected ? "selected" : ""} ${rotated ? "rotated" : ""} ${card.image ? "has-card-image" : ""}" style="--card-color:${COLORS[card.color].hex};--stack-layer:${layer};--stack-top:${layer}" draggable="true" data-drag-source="${dragSource}" ${action}>
    <span class="play-card-cost">${card.cost}</span>${image}<span class="play-card-name">${escapeHtml(card.name)}</span><span class="play-card-type">${COLORS[card.color].label} · BP ${card.bp || "—"}</span>${card.effect ? `<span class="play-card-effect">${escapeHtml(card.effect)}</span>` : ""}
  </button>`;
}

function renderGameDialog() {
  if (!game?.dialogMode) return "";
  if (game.dialogMode === "card-preview") {
    const card = getCard(game.previewCardId);
    if (!card) return "";
    return `<dialog id="game-dialog" class="game-dialog game-dialog-card-preview">
      <div class="game-dialog-head"><div><p>CARD DETAIL</p><h2>${escapeHtml(card.name)}</h2></div><button class="card-preview-close" data-close-game-dialog aria-label="閉じる">×</button></div>
      <div class="game-card-preview-layout">
        ${card.image ? `<img class="game-card-preview-image" src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}のカード画像" />` : `<div class="game-card-preview-art" style="--card-color:${COLORS[card.color].hex}">${escapeHtml(card.symbol)}</div>`}
        <div class="game-card-preview-details"><p>${escapeHtml(card.cardNumber || card.id)}${card.rarity ? ` · ${escapeHtml(card.rarity)}` : ""}</p>
          <div class="game-card-preview-stats"><span>色<strong>${COLORS[card.color].label}</strong></span><span>種類<strong>${escapeHtml(card.type)}</strong></span><span>コスト<strong>${card.cost}</strong></span><span>BP<strong>${card.bp || "—"}</strong></span></div>
          ${card.effect ? `<p class="game-card-preview-effect">${escapeHtml(card.effect)}</p>` : ""}
          ${game.previewSource ? `<button class="btn btn-light" data-inspect-return>このカードを手札に戻す</button>` : ""}
        </div>
      </div>
    </dialog>`;
  }
  if (game.dialogMode === "peek-count") {
    return `<dialog id="game-dialog" class="game-dialog">
      <div class="game-dialog-head"><div><p>DECK TOP</p><h2>山札を見る</h2></div><button class="card-preview-close" data-close-game-dialog aria-label="閉じる">×</button></div>
      <p class="game-dialog-note">山札の上から確認する枚数を指定してください。山札は ${game.pile.length} 枚です。</p>
      <label class="peek-count-label" for="peek-count">確認する枚数</label><input id="peek-count" class="search-input peek-count-input" type="number" min="1" max="${game.pile.length}" value="${Math.min(5, game.pile.length)}" />
      <div class="game-dialog-actions"><button class="btn btn-light" data-close-game-dialog>キャンセル</button><button class="btn btn-coral" data-confirm-peek ${game.pile.length ? "" : "disabled"}>山札を見る</button></div>
    </dialog>`;
  }
  if (game.dialogMode === "peek-cards") {
    const destinations = [["top", "山札の上"], ["bottom", "山札の下"], ["hand", "手札"], ["life", "ライフ"], ["energy", "エナジーライン"], ["front", "フロントライン"], ["trash", "トラッシュ"], ["removed", "リムーブ"]];
    const cards = game.peeked.map((item, index) => {
      const card = getCard(item.id);
      return `<div class="game-dialog-card">
        ${card?.image ? `<img src="${escapeHtml(card.image)}" alt="" />` : `<span class="game-dialog-card-symbol">${escapeHtml(card?.symbol || "?")}</span>`}
        <div class="game-dialog-card-name"><strong>${escapeHtml(card?.name || "不明なカード")}</strong><small>${escapeHtml(card?.cardNumber || item.id)}</small></div>
        <select class="select-input" data-peek-destination="${index}" aria-label="${escapeHtml(card?.name || "カード")}の移動先">${destinations.map(([value, label]) => `<option value="${value}" ${item.destination === value ? "selected" : ""}>${label}</option>`).join("")}</select>
        <div class="game-dialog-reorder"><button data-peek-move="${index}:up" aria-label="上へ移動" ${index === 0 ? "disabled" : ""}>↑</button><button data-peek-move="${index}:down" aria-label="下へ移動" ${index === game.peeked.length - 1 ? "disabled" : ""}>↓</button></div>
      </div>`;
    }).join("");
    return `<dialog id="game-dialog" class="game-dialog game-dialog-wide">
      <div class="game-dialog-head"><div><p>DECK TOP · ${game.peeked.length} CARDS</p><h2>確認したカードの順番と移動先</h2></div><button class="card-preview-close" data-close-game-dialog aria-label="閉じる">×</button></div>
      <p class="game-dialog-note">上から順に並んでいます。矢印で順番を変え、各カードの移動先を選んでください。</p>
      <div class="game-dialog-card-list">${cards}</div>
      <div class="game-dialog-actions"><button class="btn btn-light" data-close-game-dialog>戻す</button><button class="btn btn-coral" data-finish-peek>移動を確定</button></div>
    </dialog>`;
  }
  if (game.dialogMode === "trash" || game.dialogMode === "removed") {
    const source = game.dialogMode;
    const sourceName = source === "trash" ? "トラッシュ" : "リムーブエリア";
    const cards = game[source];
    const destinations = [
      ["hand", "手札"], ["life", "ライフ"], ["energy", "エナジーライン"], ["front", "フロントライン"],
      ["top", "山札の上"], ["bottom", "山札の下"],
      ...(source === "trash" ? [["removed", "リムーブ"]] : [["trash", "トラッシュ"]]),
    ];
    const rows = cards.map((id, index) => {
      const card = getCard(id);
      return `<div class="game-dialog-card">
        ${card?.image ? `<img src="${escapeHtml(card.image)}" alt="" />` : `<span class="game-dialog-card-symbol">${escapeHtml(card?.symbol || "?")}</span>`}
        <div class="game-dialog-card-name"><strong>${escapeHtml(card?.name || "不明なカード")}</strong><small>${escapeHtml(card?.cardNumber || id)}</small></div>
        <div class="game-dialog-move-actions">${destinations.map(([destination, label]) => `<button class="btn btn-light" data-zone-move="${source}:${index}:${destination}">${label}</button>`).join("")}</div>
      </div>`;
    }).join("");
    return `<dialog id="game-dialog" class="game-dialog game-dialog-wide">
      <div class="game-dialog-head"><div><p>PLAYER ZONE · ${cards.length} CARDS</p><h2>${sourceName}のカード</h2></div><button class="card-preview-close" data-close-game-dialog aria-label="閉じる">×</button></div>
      ${cards.length ? `<div class="game-dialog-card-list">${rows}</div>` : `<p class="game-dialog-empty">${sourceName}にカードはありません。</p>`}
    </dialog>`;
  }
  return "";
}

function openGameDialog(mode) {
  game.dialogMode = mode;
  renderPlay();
  document.querySelector("#game-dialog")?.showModal();
}

function closeGameDialog(restorePeek = true) {
  if (!game) return;
  document.querySelector("#game-dialog")?.close();
  if (restorePeek && game.peeked) game.pile.push(...game.peekOriginal.slice().reverse());
  game.peeked = null;
  game.peekOriginal = null;
  game.previewCardId = null;
  game.previewSource = null;
  game.dialogMode = null;
  renderPlay();
}

function confirmPeek() {
  const count = Number(document.querySelector("#peek-count")?.value);
  if (!Number.isInteger(count) || count < 1 || count > game.pile.length) {
    showToast(`確認する枚数は1〜${game.pile.length}枚で指定してください。`);
    return;
  }
  game.peekOriginal = [];
  for (let i = 0; i < count; i++) game.peekOriginal.push(game.pile.pop());
  game.peeked = game.peekOriginal.map((id) => ({ id, destination: "top" }));
  game.dialogMode = "peek-cards";
  renderPlay();
  document.querySelector("#game-dialog")?.showModal();
}

function finishPeek() {
  if (!game?.peeked) return;
  const energyCount = game.peeked.filter((item) => item.destination === "energy").length;
  const frontCount = game.peeked.filter((item) => item.destination === "front").length;
  if (energyCount > game.energyLine.filter((id) => !id).length) {
    showToast("エナジーラインの空きが足りません。移動先を変更してください。");
    return;
  }
  if (frontCount > game.frontLine.filter((id) => !id).length) {
    showToast("フロントラインの空きが足りません。移動先を変更してください。");
    return;
  }
  const destinations = new Map([
    ["top", []], ["bottom", []], ["hand", []], ["life", []], ["energy", []], ["front", []], ["trash", []], ["removed", []],
  ]);
  for (const item of game.peeked) destinations.get(item.destination)?.push(item.id);
  game.pile.push(...destinations.get("top").slice().reverse());
  game.pile.unshift(...destinations.get("bottom").slice().reverse());
  game.hand.push(...destinations.get("hand"));
  game.lifeCards.push(...destinations.get("life"));
  game.trash.push(...destinations.get("trash"));
  game.removed.push(...destinations.get("removed"));
  for (const zone of ["energy", "front"]) {
    const line = zone === "energy" ? game.energyLine : game.frontLine;
    for (const id of destinations.get(zone)) {
      const index = line.findIndex((slot) => !slot);
      delete game.rotated[`${zone === "energy" ? "energyLine" : "frontLine"}:${index}`];
      line[index] = id;
    }
  }
  const movedCount = game.peeked.length;
  game.peeked = null;
  game.peekOriginal = null;
  game.dialogMode = null;
  addLog(`山札を${movedCount}枚確認し、移動先を選びました。`);
  renderPlay();
}

function moveZoneCard(source, index, destination) {
  if (!game || !["trash", "removed"].includes(source)) return;
  const cardId = game[source][index];
  if (!cardId) return;
  if (destination === "energy" || destination === "front") {
    const line = destination === "energy" ? game.energyLine : game.frontLine;
    const emptyIndex = line.findIndex((slot) => !slot);
    if (emptyIndex < 0) {
      showToast(`${destination === "energy" ? "エナジーライン" : "フロントライン"}に空きがありません。`);
      return;
    }
    game[source].splice(index, 1);
    delete game.rotated[`${destination === "energy" ? "energyLine" : "frontLine"}:${emptyIndex}`];
    line[emptyIndex] = cardId;
  } else if (destination === "hand") {
    game[source].splice(index, 1);
    game.hand.push(cardId);
  } else if (destination === "life") {
    game[source].splice(index, 1);
    game.lifeCards.push(cardId);
  } else if (destination === "top") {
    game[source].splice(index, 1);
    game.pile.push(cardId);
  } else if (destination === "bottom") {
    game[source].splice(index, 1);
    game.pile.unshift(cardId);
  } else if ((source === "trash" && destination === "removed")
    || (source === "removed" && destination === "trash")) {
    game[source].splice(index, 1);
    game[destination].push(cardId);
  } else {
    return;
  }
  game.dialogMode = source;
  addLog(`${getCard(cardId)?.name || "カード"}を${source === "trash" ? "トラッシュ" : "リムーブ"}から移動しました。`);
  renderPlay();
  document.querySelector("#game-dialog")?.showModal();
}

function renderFieldSlot(zone, index) {
  const id = game[zone][index];
  const slot = `${zone}:${index}`;
  const overlays = game.raidStacks?.[slot] || [];
  if (!id) return `<div class="field-slot" data-drop-zone="field:${zone}:${index}">空きスペース</div>`;
  const stack = [id, ...overlays];
  const cards = stack.map((cardId, layer) => {
    if (layer === stack.length - 1) return cardMarkup(cardId, index, zone, layer);
    const card = getCard(cardId);
    if (!card) return "";
    return `<div class="play-card raid-underlay ${card.image ? "has-card-image" : ""}" style="--card-color:${COLORS[card.color].hex};--stack-layer:${layer};--stack-top:${layer}">
      ${card.image ? `<img class="play-card-image" src="${escapeHtml(card.image)}" alt="" loading="lazy" />` : `<span class="play-card-art">${escapeHtml(card.symbol)}</span>`}
      <span class="play-card-cost">${card.cost}</span><span class="play-card-name">${escapeHtml(card.name)}</span><span class="play-card-type">${COLORS[card.color].label} · BP ${card.bp || "—"}</span>${card.effect ? `<span class="play-card-effect">${escapeHtml(card.effect)}</span>` : ""}
    </div>`;
  }).join("");
  return `<div class="field-slot filled ${stack.length > 1 ? "raid-stacked" : ""}" data-drop-zone="field:${zone}:${index}">
    <div class="field-card-stack" style="--stack-size:${stack.length}">${cards}</div>
    <button class="field-card-inspect" data-inspect-game-card="${escapeHtml(stack[stack.length - 1])}" data-inspect-source="field:${zone}:${index}:${stack.length - 1}" aria-label="${escapeHtml(getCard(stack[stack.length - 1])?.name || "カード")}の詳細を拡大">拡大</button>
    ${stack.length > 1 ? `<span class="raid-stack-count" title="${stack.length}枚を重ねています">重ね ${stack.length}</span>` : ""}
  </div>`;
}

function moveGameCard(sourceValue, destinationValue) {
  if (!game) return false;
  const source = sourceValue.split(":");
  const destination = destinationValue.split(":");
  let cardId;
  let rotation = false;
  let destinationField = null;

  if (destination[0] === "field") {
    const [zone, index] = [destination[1], Number(destination[2])];
    const line = game[zone];
    if (!["frontLine", "energyLine"].includes(zone) || !Number.isInteger(index) || !line || index < 0 || index >= line.length) return false;
    if (source[0] === "field" && source[1] === zone && Number(source[2]) === index) return false;
    const occupied = Boolean(line[index]);
    destinationField = { zone, index, occupied };
  }

  const [sourceType, sourceZone, sourceIndexText, sourceLayerText] = source;
  const index = Number(["hand", "trash", "removed"].includes(sourceType) ? sourceZone : sourceIndexText);
  if (sourceType === "hand" && Number.isInteger(index)) {
    cardId = game.hand[index];
  } else if (sourceType === "life" && sourceZone === "top") {
    cardId = game.lifeCards[game.lifeCards.length - 1];
  } else if (sourceType === "pile" && sourceZone === "top") {
    cardId = game.pile[game.pile.length - 1];
  } else if (sourceType === "field" && ["frontLine", "energyLine"].includes(sourceZone)) {
    const line = game[sourceZone];
    const slotIndex = Number(sourceIndexText);
    const layer = Number(sourceLayerText);
    const overlays = game.raidStacks?.[`${sourceZone}:${slotIndex}`] || [];
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= line.length || !Number.isInteger(layer) || layer < 0) return false;
    if (overlays.length !== layer) return false;
    cardId = layer === 0 ? line[slotIndex] : overlays[layer - 1];
    rotation = Boolean(game.rotated[`${sourceZone}:${slotIndex}`]);
  } else if ((sourceType === "trash" || sourceType === "removed") && Number.isInteger(index)) {
    cardId = game[sourceType][index];
  } else {
    return false;
  }
  if (!cardId) return false;

  const validDestination = ["hand", "life", "trash", "removed", "pile-top", "pile-bottom"].includes(destinationValue)
    || Boolean(destinationField);
  if (!validDestination) return false;

  if (sourceType === "hand") {
    game.hand.splice(index, 1);
    if (game.selectedHandIndex === index) game.selectedHandIndex = null;
    else if (game.selectedHandIndex > index) game.selectedHandIndex--;
  } else if (sourceType === "life") game.lifeCards.pop();
  else if (sourceType === "pile") game.pile.pop();
  else if (sourceType === "trash" || sourceType === "removed") game[sourceType].splice(index, 1);
  else if (sourceType === "field") {
    const line = game[sourceZone];
    const slotIndex = Number(sourceIndexText);
    const layer = Number(sourceLayerText);
    const overlays = game.raidStacks?.[`${sourceZone}:${slotIndex}`] || [];
    if (layer > 0) {
      overlays.pop();
      if (!overlays.length) delete game.raidStacks[`${sourceZone}:${slotIndex}`];
    } else line[slotIndex] = null;
    if (!line[slotIndex]) delete game.rotated[`${sourceZone}:${slotIndex}`];
  }

  if (destinationField) {
    const { zone, index: targetIndex, occupied } = destinationField;
    if (occupied) {
      const slot = `${zone}:${targetIndex}`;
      if (!game.raidStacks[slot]) game.raidStacks[slot] = [];
      game.raidStacks[slot].push(cardId);
      if (rotation) game.rotated[slot] = true;
      addLog(`${getCard(cardId).name}を${zone === "energyLine" ? "エナジーライン" : "フロントライン"}のカードに重ねました。`);
    } else {
      game[zone][targetIndex] = cardId;
      if (rotation) game.rotated[`${zone}:${targetIndex}`] = true;
      addLog(`${getCard(cardId).name}を${zone === "energyLine" ? "エナジーライン" : "フロントライン"}に移動しました。`);
    }
  } else if (destinationValue === "hand") {
    game.hand.push(cardId);
    if (sourceType === "field") game.selectedHandIndex = game.hand.length - 1;
    addLog(`${getCard(cardId).name}を手札に移動しました。`);
  } else if (destinationValue === "life") {
    game.lifeCards.push(cardId);
    addLog(`${getCard(cardId).name}をライフに移動しました。`);
  } else if (destinationValue === "trash" || destinationValue === "removed") {
    game[destinationValue].push(cardId);
    addLog(`${getCard(cardId).name}を${destinationValue === "trash" ? "トラッシュ" : "リムーブ"}に移動しました。`);
  } else if (destinationValue === "pile-top") {
    game.pile.push(cardId);
    addLog(`${getCard(cardId).name}を山札の上に戻しました。`);
  } else if (destinationValue === "pile-bottom") {
    game.pile.unshift(cardId);
    addLog(`${getCard(cardId).name}を山札の下に置きました。`);
  }

  renderPlay();
  return true;
}

function renderOpponentBoard() {
  if (!onlineRoom) return "";
  const opponent = onlineRoom.opponent;
  const slotRow = (zone) => {
    const cards = Array.isArray(opponent?.[zone]) ? opponent[zone] : [];
    return Array.from({ length: 4 }, (_, index) => {
      const cardId = cards[index];
      const card = typeof cardId === "string" ? getCard(cardId) : null;
      if (!card) return `<div class="remote-field-slot">空きスペース</div>`;
      const stack = opponent.raidStacks?.[`${zone}:${index}`];
      const topId = Array.isArray(stack) && stack.length ? stack[stack.length - 1] : cardId;
      const topCard = getCard(topId) || card;
      return `<div class="remote-field-slot"><div class="remote-card ${opponent.rotated?.[`${zone}:${index}`] ? "rotated" : ""}" style="--card-color:${COLORS[topCard.color]?.hex || COLORS.none.hex}">${topCard.image ? `<img src="${escapeHtml(topCard.image)}" alt="" loading="lazy" />` : `<span>${escapeHtml(topCard.symbol || "？")}</span>`}<strong>${escapeHtml(topCard.name)}</strong><small>${escapeHtml(topCard.type)} · BP ${topCard.bp || "—"}</small></div>${stack?.length ? `<span class="raid-stack-count">重ね ${stack.length + 1}</span>` : ""}</div>`;
    }).join("");
  };
  const knownTrash = Array.isArray(opponent?.trash) ? opponent.trash : [];
  const knownRemoved = Array.isArray(opponent?.removed) ? opponent.removed : [];
  const publicCards = [...knownTrash, ...knownRemoved]
    .map((id) => getCard(id)?.name)
    .filter(Boolean);
  return `<section class="opponent-board" aria-label="対戦相手の盤面">
    <div class="opponent-board-head"><div><span class="utility-title">OPPONENT</span><h3>${escapeHtml(opponent?.playerName || onlineRoom.opponentName || "対戦相手")}</h3><small>${escapeHtml(onlineRoom.status)}</small></div><div class="opponent-counts"><span>山札 ${Number.isInteger(opponent?.pileCount) ? opponent.pileCount : "—"}</span><span>手札 ${Number.isInteger(opponent?.handCount) ? opponent.handCount : "—"}</span><span>ライフ ${Number.isInteger(opponent?.lifeCount) ? opponent.lifeCount : "—"}</span><span>TURN ${Number.isInteger(opponent?.turn) ? opponent.turn : "—"}</span></div></div>
    <div class="zone-label">FRONT LINE <span>フロントライン</span></div><div class="remote-field-zone">${slotRow("frontLine")}</div>
    <div class="zone-label">ENERGY LINE <span>エナジーライン</span></div><div class="remote-field-zone">${slotRow("energyLine")}</div>
    <div class="opponent-public-zones"><span>トラッシュ ${knownTrash.length}枚</span><span>リムーブ ${knownRemoved.length}枚</span>${publicCards.length ? `<small>${publicCards.map(escapeHtml).join("、")}</small>` : ""}</div>
  </section>`;
}

function renderPlay() {
  const el = document.querySelector("#view-play");
  if (!game) {
    const available = decks.filter((deck) => deckSize(deck) > 0);
    const deckOptions = available.map((deck) => `<option value="${escapeHtml(deck.id)}">${escapeHtml(deck.name)}　(${deckSize(deck)}枚)</option>`).join("");
    el.innerHTML = `<div class="page-heading play-heading"><div><div class="eyebrow">PLAYTEST</div><h1>一人回し・オンライン対戦</h1><p>一人で動きを試すか、ルームコードを友人に共有して対戦できます。</p></div></div>
      ${available.length ? `<div class="setup-state"><div class="setup-icon">▷</div><h2>デッキを選んでスタート</h2><p>シャッフル後、ライフ7枚と初期手札7枚をセットします。エナジーラインやフロントラインへの移動も試せます。</p><select id="play-deck-select" class="select-input setup-select">${deckOptions}</select><button class="btn btn-coral" data-start-selected>▷　一人回しを始める</button>
        <div class="online-setup"><div class="online-setup-heading"><span class="eyebrow">FRIEND MATCH</span><h3>友人とオンライン対戦</h3><p>Supabase Realtimeで盤面を共有します。ルームコードを知っている人は参加できます。</p></div>
          <select id="online-deck-select" class="select-input setup-select" aria-label="オンライン対戦で使うデッキ">${deckOptions}</select>
          <div class="online-room-actions"><button class="btn btn-coral" data-create-room ${supabaseClient ? "" : "disabled"}>ルームを作成</button><span>または</span><input id="online-room-code" class="search-input" maxlength="6" autocomplete="off" placeholder="6桁のコード" aria-label="ルームコード" /><button class="btn btn-light" data-join-room ${supabaseClient ? "" : "disabled"}>参加</button></div>
          ${supabaseClient ? "" : `<small class="online-config-note">Supabaseの設定後に利用できます。</small>`}
        </div></div>` : `<div class="setup-state"><div class="setup-icon">▤</div><h2>デッキがありません</h2><p>まずはデッキを作ってカードを入れましょう。</p><button class="btn btn-coral" data-action="new-deck">デッキを作る</button></div>`}
      <p class="rules-note" style="margin-top:15px">一人回し用の盤面です。AP・エナジーの支払い、効果、バトル等のルール処理は行わないため、実際の対戦では公式ルールをご確認ください。</p>`;
    return;
  }
  const deck = findDeck(game.deckId);
  const hand = game.hand.map((id, index) => cardMarkup(id, index)).join("");
  const renderSlots = (zone) => game[zone].map((_, index) => renderFieldSlot(zone, index)).join("");
  const lifeStack = game.lifeCards.length
    ? `<button class="zone-stack life-stack" data-life-damage draggable="true" data-drag-source="life:top" aria-label="ライフから1枚を手札に加える"><span class="stack-card"></span><span class="stack-count">${game.lifeCards.length}</span><small>ダメージ</small></button>`
    : `<div class="zone-stack empty-stack"><span class="stack-count">0</span><small>ライフなし</small></div>`;
  const selectedCard = game.selectedHandIndex === null ? null : getCard(game.hand[game.selectedHandIndex]);
  const selected = game.selectedHandIndex !== null && game.hand[game.selectedHandIndex] !== undefined;
  const log = game.log.length ? game.log.map((item) => `<div class="log-item"><span class="log-time">${item.time}</span><span>${escapeHtml(item.message)}</span></div>`).join("") : `<div class="no-results">まだ操作はありません</div>`;
  el.innerHTML = `  <div class="page-heading play-heading"><div><div class="eyebrow">${onlineRoom ? "FRIEND MATCH" : "SOLO PLAYTEST"}</div><h1>${onlineRoom ? "オンライン対戦" : "一人回し"}</h1><p>${onlineRoom ? `ルームコード <strong class="room-code">${onlineRoom.code}</strong>　·　${escapeHtml(onlineRoom.status)}　<button class="text-button" data-copy-room>コードをコピー</button>` : "カードを移動先へドラッグできます。クリック操作も利用できます。"}</p></div><button class="btn btn-light" data-end-game>← ${onlineRoom ? "ルームを退出" : "終了する"}</button></div>
    <div class="play-layout"><section class="play-table">
      <div class="play-table-top"><div><h2>${escapeHtml(deck?.name || "プレイ中のデッキ")}</h2><p>山札 ${game.pile.length} 枚　·　トラッシュ ${game.trash.length} 枚</p></div><span class="round-badge">TURN ${game.turn}</span></div>
      ${renderOpponentBoard()}
      <section class="player-board" aria-label="自分側の盤面">
        <div class="zone-label">FRONT LINE <span>${game.frontLine.filter(Boolean).length} / 4　·　フロントライン</span></div>
        <div class="field-zone front-zone">${renderSlots("frontLine")}</div>
        <div class="zone-label">ENERGY LINE <span>${game.energyLine.filter(Boolean).length} / 4　·　エナジーエリア</span></div>
        <div class="field-zone energy-zone">${renderSlots("energyLine")}</div>
      <div class="utility-zones">
          <button class="zone-stack deck-stack" data-draw data-drop-zone="pile-top" draggable="${game.pile.length ? "true" : "false"}" ${game.pile.length ? `data-drag-source="pile:top"` : ""} aria-label="山札から1枚ドロー"><span class="stack-card"></span><span class="stack-count">${game.pile.length}</span><small>山札 · ドロー</small></button>
        <button class="utility-zone deck-peek-button" data-open-peek ${game.pile.length ? "" : "disabled"}><span class="utility-title">DECK</span><strong>山札を見る</strong><small>上からX枚を確認</small></button>
          <button class="utility-zone deck-bottom-drop" data-drop-zone="pile-bottom"><span class="utility-title">DECK</span><strong>山札の下へ</strong><small>カードをドロップ</small></button>
          <div class="utility-zone life-zone" data-drop-zone="life"><span class="utility-title">LIFE <small>ライフエリア</small></span>${lifeStack}</div>
          <div class="utility-zone ap-zone"><span class="utility-title">AP <small>APエリア</small></span><div class="ap-cards">${[1, 2, 3].map((item) => `<span class="ap-card" aria-label="APカード ${item}">${item}</span>`).join("")}</div></div>
          <button class="utility-zone small-pile zone-open-button" data-open-zone="trash" data-drop-zone="trash" draggable="${game.trash.length ? "true" : "false"}" ${game.trash.length ? `data-drag-source="trash:${game.trash.length - 1}"` : ""}><span class="utility-title">TRASH <small>トラッシュ</small></span><strong>${game.trash.length}</strong><small>一覧・移動</small></button>
          <button class="utility-zone small-pile zone-open-button" data-open-zone="removed" data-drop-zone="removed" draggable="${game.removed.length ? "true" : "false"}" ${game.removed.length ? `data-drag-source="removed:${game.removed.length - 1}"` : ""}><span class="utility-title">REMOVED <small>リムーブ</small></span><strong>${game.removed.length}</strong><small>一覧・移動</small></button>
        </div>
        <div class="zone-label">HAND <span>${game.hand.length} 枚 · カードを選択</span></div>
        <div class="hand-zone" data-drop-zone="hand">${hand || `<span class="empty-zone">手札がありません。ドローしてみましょう。</span>`}</div>
      <div class="play-controls"><div class="control-group"><button class="btn btn-light" data-place-zone="energyLine" ${selected ? "" : "disabled"}>${selectedCard ? `↓ ${escapeHtml(selectedCard.name)}をエナジーへ` : "↓ エナジーラインへ"}</button><button class="btn btn-coral" data-place-zone="frontLine" ${selected ? "" : "disabled"}>${selectedCard ? `↑ ${escapeHtml(selectedCard.name)}をフロントへ` : "↑ フロントラインへ"}</button><button class="btn btn-light" data-discard-selected ${selected ? "" : "disabled"}>トラッシュへ</button></div><div class="control-group"><button class="btn btn-light" data-draw-multiple>＋＋ 2枚ドロー</button><button class="btn btn-light" data-mulligan>↻ マリガン</button><button class="btn btn-coral" data-next-turn>次のターン →</button></div></div>
      </section>
    </section>
    <aside class="game-sidebar"><section class="game-panel"><h3>ゲーム情報</h3><div class="game-stat"><span>ターン</span><strong>${game.turn}</strong></div><div class="game-stat"><span>山札</span><strong>${game.pile.length} 枚</strong></div><div class="game-stat"><span>手札</span><strong>${game.hand.length} 枚</strong></div><div class="game-stat"><span>ライフ</span><strong>${game.lifeCards.length} / 7 枚</strong></div><div class="game-stat"><span>選択中</span><strong>${selectedCard ? escapeHtml(selectedCard.name) : "—"}</strong></div></section>
      <section class="game-panel"><h3>プレイログ</h3><div class="game-log">${log}</div></section>
      <div class="rules-note">カードを手札・ライフ・山札・フロントライン・エナジーライン・トラッシュ・リムーブへドラッグして移動できます。フロントラインまたはエナジーラインのカードに重ねてドロップするとスタックします。場のカードをクリックすると手札に戻り、右クリックで縦向き・横向きを切り替えます。山札を見ると上から指定枚数を確認して順番や移動先を決められます。エナジー・APの支払いは手動です。</div>
    </aside></div>${renderGameDialog()}`;
  publishOnlineState();
}

document.addEventListener("click", async (event) => {
  const dialog = document.querySelector("#card-preview-dialog");
  if (dialog && event.target === dialog) { dialog.close(); return; }
  const gameDialog = document.querySelector("#game-dialog");
  if (gameDialog && event.target === gameDialog) { closeGameDialog(); return; }
  const target = event.target.closest("button");
  if (!target || target.disabled) return;
  if (target.hasAttribute("data-open-auth")) {
    if (!supabaseClient) {
      showToast("Supabase未設定です。supabase-config.jsにProject URLと公開キーを設定してください。");
      return;
    }
    renderAuthStatus();
    document.querySelector("#auth-dialog")?.showModal();
    return;
  }
  if (target.hasAttribute("data-close-auth")) {
    document.querySelector("#auth-dialog")?.close();
    return;
  }
  if (target.hasAttribute("data-sign-up")) {
    event.preventDefault();
    document.querySelector("#auth-form")?.requestSubmit(target);
    return;
  }
  if (target.hasAttribute("data-sign-out")) {
    if (!supabaseClient) return;
    clearTimeout(cloudSyncTimer);
    await flushCloudDeckChanges();
    if (pendingCloudUpserts.size || pendingCloudDeletes.size) {
      showToast("未同期の変更があります。接続を確認してからログアウトしてください。");
      return;
    }
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("ログアウトできませんでした。", error);
      showToast("ログアウトに失敗しました。");
      return;
    }
    document.querySelector("#auth-dialog")?.close();
    showToast("ログアウトしました。");
    return;
  }
  if (target.hasAttribute("data-close-game-dialog")) { closeGameDialog(); return; }
  if (target.dataset.inspectGameCard) {
    game.previewCardId = target.dataset.inspectGameCard;
    game.previewSource = target.dataset.inspectSource;
    openGameDialog("card-preview");
    return;
  }
  if (target.hasAttribute("data-inspect-return")) {
    const source = game.previewSource;
    game.previewCardId = null;
    game.previewSource = null;
    game.dialogMode = null;
    document.querySelector("#game-dialog")?.close();
    if (source) moveGameCard(source, "hand");
    return;
  }
  if (target.hasAttribute("data-open-peek")) { openGameDialog("peek-count"); return; }
  if (target.hasAttribute("data-confirm-peek")) { confirmPeek(); return; }
  if (target.hasAttribute("data-finish-peek")) { finishPeek(); return; }
  if (target.dataset.openZone) { openGameDialog(target.dataset.openZone); return; }
  if (target.dataset.peekMove) {
    const [indexText, direction] = target.dataset.peekMove.split(":");
    const index = Number(indexText);
    const nextIndex = index + (direction === "up" ? -1 : 1);
    if (nextIndex >= 0 && nextIndex < game.peeked.length) {
      [game.peeked[index], game.peeked[nextIndex]] = [game.peeked[nextIndex], game.peeked[index]];
      renderPlay();
      document.querySelector("#game-dialog")?.showModal();
    }
    return;
  }
  if (target.dataset.zoneMove) {
    const [source, index, destination] = target.dataset.zoneMove.split(":");
    moveZoneCard(source, Number(index), destination);
    return;
  }
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
  if (target.hasAttribute("data-create-room") || target.hasAttribute("data-join-room")) {
    const deckSelect = document.querySelector("#online-deck-select");
    if (!deckSelect) return;
    const roomCode = target.hasAttribute("data-join-room")
      ? document.querySelector("#online-room-code")?.value || ""
      : "";
    void connectOnlineRoom(deckSelect.value, roomCode);
    return;
  }
  if (target.hasAttribute("data-copy-room")) {
    if (!onlineRoom) return;
    try {
      await navigator.clipboard.writeText(onlineRoom.code);
      showToast("ルームコードをコピーしました。");
    } catch (error) {
      console.error("ルームコードをコピーできませんでした。", error);
      showToast(`ルームコード ${onlineRoom.code} をコピーできませんでした。`);
    }
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
  if (target.hasAttribute("data-end-game")) {
    game = null;
    if (onlineRoom) await leaveOnlineRoom();
    renderPlay();
    return;
  }
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
    const [zone, indexText, layerText] = target.dataset.returnCard.split(":");
    if (!["energyLine", "frontLine"].includes(zone)) return;
    moveGameCard(`field:${zone}:${indexText}:${layerText}`, "hand");
    return;
  }
});

document.addEventListener("dragstart", (event) => {
  if (!(event.target instanceof Element)) return;
  const source = event.target.closest("[data-drag-source]");
  if (!source || !game) return;
  game.dragSource = source.dataset.dragSource;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", game.dragSource);
});

document.addEventListener("dragover", (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest("[data-drop-zone]");
  if (!target || !game?.dragSource) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  target.classList.add("drop-active");
});

document.addEventListener("dragleave", (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest("[data-drop-zone]");
  if (target && !target.contains(event.relatedTarget)) target.classList.remove("drop-active");
});

document.addEventListener("drop", (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest("[data-drop-zone]");
  if (!target || !game) return;
  event.preventDefault();
  const source = game.dragSource || event.dataTransfer.getData("text/plain");
  game.dragSource = null;
  document.querySelectorAll(".drop-active").forEach((element) => element.classList.remove("drop-active"));
  if (source) moveGameCard(source, target.dataset.dropZone);
});

document.addEventListener("dragend", () => {
  if (game) game.dragSource = null;
  document.querySelectorAll(".drop-active").forEach((element) => element.classList.remove("drop-active"));
});

document.addEventListener("contextmenu", (event) => {
  const card = event.target.closest(".play-card[data-return-card]");
  if (!card || !game) return;
  event.preventDefault();
  const [zone, indexText] = card.dataset.returnCard.split(":");
  const key = `${zone}:${indexText}`;
  game.rotated[key] = !game.rotated[key];
  const overlays = game.raidStacks[key] || [];
  const topCardId = overlays[overlays.length - 1] || game[zone][Number(indexText)];
  addLog(`${getCard(topCardId)?.name || "カード"}を${game.rotated[key] ? "横向き" : "縦向き"}にしました。`);
  renderPlay();
});

document.addEventListener("change", (event) => {
  if (!game || !event.target.matches("[data-peek-destination]")) return;
  const item = game.peeked?.[Number(event.target.dataset.peekDestination)];
  if (item) item.destination = event.target.value;
});

document.addEventListener("cancel", (event) => {
  if (event.target.id !== "game-dialog") return;
  event.preventDefault();
  closeGameDialog();
}, true);

document.addEventListener("input", (event) => {
  if (event.target.id === "online-room-code") {
    const input = event.target;
    const cursor = input.selectionStart;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    input.setSelectionRange(cursor, cursor);
  }
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

document.addEventListener("submit", async (event) => {
  if (event.target.id === "auth-form") {
    event.preventDefault();
    const message = document.querySelector("#auth-message");
    const email = document.querySelector("#auth-email").value.trim();
    const password = document.querySelector("#auth-password").value;
    const signUp = event.submitter?.hasAttribute("data-sign-up");
    if (!supabaseClient) {
      if (message) message.textContent = "Supabase未設定です。設定ファイルを確認してください。";
      return;
    }
    if (message) message.textContent = signUp ? "アカウントを作成しています…" : "ログインしています…";
    try {
      const result = signUp
        ? await supabaseClient.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href.split("#")[0] },
        })
        : await supabaseClient.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (signUp && !result.data.session) {
        if (message) message.textContent = "確認メールを送信しました。メール内のリンクから認証してからログインしてください。";
        return;
      }
      if (result.data.user) await activateCloudUser(result.data.user);
    } catch (error) {
      console.error(signUp ? "アカウントを作成できませんでした。" : "ログインできませんでした。", error);
      if (message) message.textContent = error.message || "認証に失敗しました。入力内容をご確認ください。";
    }
    return;
  }
});

document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
renderSidebarDecks();
renderDecks();
renderPlay();
localStorage.removeItem("union-deck-lab-catalog-url-v1");
initializeSupabase();
