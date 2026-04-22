const state = {
  mode: "audit",
  lastText: "",
};

const modeButtons = document.querySelectorAll(".mode-button");
const panels = document.querySelectorAll("[data-panel]");
const form = document.querySelector("#marketing-form");
const output = document.querySelector("#output");
const sampleButton = document.querySelector("#sample-button");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const testSummary = document.querySelector("#test-summary");

const fields = {
  pageInput: document.querySelector("#pageInput"),
  pageGoal: document.querySelector("#pageGoal"),
  pageAudience: document.querySelector("#pageAudience"),
  budget: document.querySelector("#budget"),
  businessType: document.querySelector("#businessType"),
  marketingGoal: document.querySelector("#marketingGoal"),
  offer: document.querySelector("#offer"),
};

const labels = {
  pageGoal: {
    predaj: "predaj produktu alebo služby",
    lead: "získanie leadu",
    informovanie: "informovanie návštevníka",
    registracia: "registrácia alebo rezervácia",
  },
  businessType: {
    lokalny: "lokálny podnik",
    eshop: "e-shop",
    b2b: "B2B služby",
    creator: "osobná značka alebo tvorca",
  },
  marketingGoal: {
    predaj: "predaj",
    brand: "budovanie značky",
    lead: "získavanie leadov",
    retencia: "udržanie zákazníkov",
  },
};

const goalContent = {
  predaj: {
    problem: "hodnota ponuky nemusí byť jasná pred prvým scrollom",
    cta: "zvýrazniť primárne tlačidlo s konkrétnou akciou",
    headline: "Objednajte si riešenie, ktoré šetrí čas už od prvého dňa",
  },
  lead: {
    problem: "formulár môže pôsobiť ako záväzok bez jasnej protihodnoty",
    cta: "ponúknuť krátku výmenu, napríklad konzultáciu, checklist alebo cenový odhad",
    headline: "Získajte rýchle odporúčanie pripravené pre váš ďalší krok",
  },
  informovanie: {
    problem: "obsah môže návštevníka viesť k čítaniu, nie k rozhodnutiu",
    cta: "doplniť jasný ďalší krok po prečítaní hlavného bloku",
    headline: "Všetko podstatné vysvetlené jednoducho a bez zbytočného hľadania",
  },
  registracia: {
    problem: "návštevník nemusí vidieť dôvod registrovať sa hneď",
    cta: "ukázať benefit registrácie pri tlačidle a znížiť počet polí",
    headline: "Rezervujte si miesto za menej než minútu",
  },
};

const strategyRules = {
  lokalny: {
    channels: ["Google Business Profile", "lokálne SEO", "Meta Ads s geolokáciou"],
    optimization: ["recenzie a fotky prevádzky", "lokálne kľúčové slová", "ponuka s jasnou dostupnosťou"],
  },
  eshop: {
    channels: ["Google Shopping", "Meta Ads remarketing", "e-mail automatizácia"],
    optimization: ["produktové stránky", "rýchlosť nákupu", "košík a opustené objednávky"],
  },
  b2b: {
    channels: ["LinkedIn obsah", "Google Search kampane", "lead magnet"],
    optimization: ["case studies", "kontaktný formulár", "dôkazy odbornosti"],
  },
  creator: {
    channels: ["Instagram alebo TikTok", "newsletter", "komunitný obsah"],
    optimization: ["konzistentný profil", "ukážky práce", "jednoduchá cesta k objednávke"],
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function textList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function money(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function setMode(mode) {
  state.mode = mode;

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === mode);
  });
}

function getBudgetTier(budget) {
  const amount = Number(budget) || 0;

  if (amount < 300) {
    return {
      name: "nízky rozpočet",
      focus: "organický obsah, lokálne kanály a veľmi presne cielené testy",
      split: "70 % obsah a SEO, 30 % malé výkonnostné testy",
    };
  }

  if (amount < 1000) {
    return {
      name: "stredný rozpočet",
      focus: "kombinácia plateného testovania, úprav webu a remarketingu",
      split: "50 % platené kampane, 30 % optimalizácia webu, 20 % obsah",
    };
  }

  return {
    name: "vyšší rozpočet",
    focus: "škálovanie kampaní, systematická tvorba obsahu a meranie konverzií",
    split: "60 % platené kampane, 25 % kreatíva a obsah, 15 % meranie a testovanie",
  };
}

function renderAudit() {
  const pageInput = fields.pageInput.value.trim() || "nezadaná stránka alebo koncept";
  const goal = fields.pageGoal.value;
  const audience = fields.pageAudience.value.trim() || "návštevníci stránky";
  const content = goalContent[goal];

  const issues = [
    `Prvý blok stránky môže príliš všeobecne vysvetľovať ponuku pre skupinu: ${audience}.`,
    `Hlavná výzva na akciu nemusí priamo podporovať cieľ: ${labels.pageGoal[goal]}.`,
    `Na stránke pravdepodobne chýba rýchly dôkaz dôvery, napríklad recenzia, číslo, ukážka výsledku alebo porovnanie.`,
    `Sekcie môžu byť zoradené podľa firmy, nie podľa otázok, ktoré má zákazník pred rozhodnutím.`,
  ];

  const recommendations = [
    `Upraviť hero sekciu tak, aby v jednej vete pomenovala výsledok pre cieľovú skupinu: ${audience}.`,
    `Doplniť jedno dominantné CTA a text pri ňom zamerať na to, že cieľom je ${labels.pageGoal[goal]}.`,
    `Pridať dôkaz dôvery hneď pri hlavnom argumente: referenciu, konkrétny benefit, garanciu alebo krátku metriku.`,
    `Zjednodušiť poradie obsahu na: problém, riešenie, dôkaz, ponuka, akcia.`,
  ];

  const html = `
    <div class="result-block">
      <h3>Analyzovaný vstup</h3>
      <p>${escapeHtml(pageInput)}</p>
    </div>
    <div class="result-block">
      <h3>Identifikácia nedostatkov</h3>
      <ul>${listItems(issues)}</ul>
    </div>
    <div class="result-block">
      <h3>Odporúčané úpravy</h3>
      <ol>${listItems(recommendations)}</ol>
    </div>
    <div class="result-block">
      <h3>Alternatívny headline</h3>
      <p class="quote-output">${escapeHtml(content.headline)}</p>
    </div>
    <div class="result-block">
      <h3>Priorita</h3>
      <p>Najskôr vyriešiť bod: ${escapeHtml(content.problem)}. Potom ${escapeHtml(content.cta)}.</p>
    </div>
  `;

  const text = [
    "AUDIT LANDING PAGE",
    "",
    `Analyzovaný vstup: ${pageInput}`,
    `Primárny cieľ: ${labels.pageGoal[goal]}`,
    `Cieľová skupina: ${audience}`,
    "",
    "Identifikácia nedostatkov:",
    textList(issues),
    "",
    "Odporúčané úpravy:",
    textList(recommendations),
    "",
    `Alternatívny headline: ${content.headline}`,
    "",
    `Priorita: Najskôr vyriešiť bod: ${content.problem}. Potom ${content.cta}.`,
  ].join("\n");

  return { html, text };
}

function renderStrategy() {
  const budget = Number(fields.budget.value) || 0;
  const businessType = fields.businessType.value;
  const marketingGoal = fields.marketingGoal.value;
  const offer = fields.offer.value.trim() || "zadaná ponuka";
  const tier = getBudgetTier(budget);
  const rules = strategyRules[businessType];

  const channels = [...rules.channels];

  if (marketingGoal === "brand") {
    channels.unshift("organický obsah so sériou tém");
  }

  if (marketingGoal === "lead" && !channels.includes("lead magnet")) {
    channels.push("lead magnet");
  }

  const steps = [
    "Nastaviť meranie konverzie a jednu hlavnú metriku úspechu.",
    `Pripraviť vstupnú ponuku pre segment: ${labels.businessType[businessType]}.`,
    `Spustiť prvý test s rozpočtovým rámcom ${money(budget)} a po 7 dňoch vyhodnotiť cenu výsledku.`,
    "Presunúť rozpočet iba do kanála, ktorý prináša najkvalitnejší signál.",
  ];

  const strategy = `Pre ponuku "${offer}" odporúčam stratégiu zameranú na ${labels.marketingGoal[marketingGoal]}. Pri rozpočte ${money(budget)} ide o ${tier.name}, preto má dávať najväčší zmysel ${tier.focus}.`;

  const html = `
    <div class="result-block">
      <h3>Odporúčaná stratégia</h3>
      <p>${escapeHtml(strategy)}</p>
      <p><strong>Rozdelenie rozpočtu:</strong> ${escapeHtml(tier.split)}.</p>
    </div>
    <div class="result-block">
      <h3>Vhodné komunikačné kanály</h3>
      <ul>${listItems(channels)}</ul>
    </div>
    <div class="result-block">
      <h3>Oblasti na optimalizáciu</h3>
      <ul>${listItems(rules.optimization)}</ul>
    </div>
    <div class="result-block">
      <h3>Stručné zdôvodnenie</h3>
      <p>Vybrané kanály zodpovedajú typu podnikania, cieľu a veľkosti rozpočtu. Nástroj odporúča začať menším testom, merať konkrétny výsledok a až potom škálovať.</p>
    </div>
    <div class="result-block">
      <h3>Prvé kroky</h3>
      <ol>${listItems(steps)}</ol>
    </div>
  `;

  const text = [
    "MARKETINGOVÝ ROZHODOVAČ",
    "",
    `Ponuka: ${offer}`,
    `Typ podnikania: ${labels.businessType[businessType]}`,
    `Marketingový cieľ: ${labels.marketingGoal[marketingGoal]}`,
    `Rozpočet: ${money(budget)}`,
    "",
    "Odporúčaná stratégia:",
    strategy,
    `Rozdelenie rozpočtu: ${tier.split}.`,
    "",
    "Vhodné komunikačné kanály:",
    textList(channels),
    "",
    "Oblasti na optimalizáciu:",
    textList(rules.optimization),
    "",
    "Stručné zdôvodnenie:",
    "Vybrané kanály zodpovedajú typu podnikania, cieľu a veľkosti rozpočtu. Nástroj odporúča začať menším testom, merať konkrétny výsledok a až potom škálovať.",
    "",
    "Prvé kroky:",
    textList(steps),
  ].join("\n");

  return { html, text };
}

function generate() {
  const result = state.mode === "audit" ? renderAudit() : renderStrategy();
  output.innerHTML = result.html;
  state.lastText = result.text;
  testSummary.textContent =
    state.mode === "audit"
      ? "Ukážka obsahuje audit landing page so zoznamom nedostatkov, odporúčaniami a alternatívnym headlineom."
      : "Ukážka obsahuje odporúčanú stratégiu, kanály, optimalizácie, zdôvodnenie a prvé kroky.";
}

function fillSample() {
  if (state.mode === "audit") {
    fields.pageInput.value =
      "Landing page pre lokálne fitness štúdio. Stránka komunikuje moderné tréningy, ale hlavný CTA text je iba Kontaktujte nás.";
    fields.pageGoal.value = "lead";
    fields.pageAudience.value = "ľudia z mesta, ktorí chcú začať pravidelne cvičiť";
  } else {
    fields.budget.value = "1000";
    fields.businessType.value = "eshop";
    fields.marketingGoal.value = "predaj";
    fields.offer.value = "e-shop s prírodnou kozmetikou pre citlivú pleť";
  }

  generate();
}

async function copyOutput() {
  if (!state.lastText) {
    generate();
  }

  try {
    await navigator.clipboard.writeText(state.lastText);
    copyButton.classList.add("success");
    window.setTimeout(() => copyButton.classList.remove("success"), 900);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = state.lastText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
}

function downloadOutput() {
  if (!state.lastText) {
    generate();
  }

  const blob = new Blob([state.lastText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `marketpilot-${state.mode}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
    generate();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

sampleButton.addEventListener("click", fillSample);
copyButton.addEventListener("click", copyOutput);
downloadButton.addEventListener("click", downloadOutput);

generate();
