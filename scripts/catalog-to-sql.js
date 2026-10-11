const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(repositoryRoot, "assets", "cards", "catalog.json");
const outputPath = path.join(repositoryRoot, "supabase", "catalog-seed.sql");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

function jsonbLiteral(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

const titles = catalog.titles.map(({ id, name }) => ({ id, name }));
const cards = catalog.cards.map((card) => ({
  id: card.id,
  title_id: card.titleId,
  name: card.name,
  color: card.color,
  cost: card.cost,
  bp: card.bp || 0,
  type: card.type,
  symbol: card.symbol || "",
  image: card.image || null,
  card_number: card.cardNumber || null,
  rarity: card.rarity || null,
  ap_cost: card.apCost ?? null,
  required_energy: card.requiredEnergy ?? null,
  generated_energy: card.generatedEnergy ?? null,
  effect: card.effect || null,
}));

const sql = `insert into public.titles (id, name)
select item.id, item.name
from jsonb_to_recordset(${jsonbLiteral(titles)}) as item(id text, name text)
on conflict (id) do update set name = excluded.name, updated_at = now();

insert into public.cards (
  id, title_id, name, color, cost, bp, type, symbol, image, card_number,
  rarity, ap_cost, required_energy, generated_energy, effect
)
select item.id, item.title_id, item.name, item.color, item.cost, item.bp,
       item.type, item.symbol, item.image, item.card_number, item.rarity,
       item.ap_cost, item.required_energy, item.generated_energy, item.effect
from jsonb_to_recordset(${jsonbLiteral(cards)}) as item(
  id text, title_id text, name text, color text, cost integer, bp integer,
  type text, symbol text, image text, card_number text, rarity text,
  ap_cost integer, required_energy integer, generated_energy integer, effect text
)
on conflict (id) do update set
  title_id = excluded.title_id,
  name = excluded.name,
  color = excluded.color,
  cost = excluded.cost,
  bp = excluded.bp,
  type = excluded.type,
  symbol = excluded.symbol,
  image = excluded.image,
  card_number = excluded.card_number,
  rarity = excluded.rarity,
  ap_cost = excluded.ap_cost,
  required_energy = excluded.required_energy,
  generated_energy = excluded.generated_energy,
  effect = excluded.effect,
  updated_at = now();
`;

fs.writeFileSync(outputPath, sql, "utf8");
console.log(`Wrote ${titles.length} titles and ${cards.length} cards to ${path.relative(repositoryRoot, outputPath)}`);
