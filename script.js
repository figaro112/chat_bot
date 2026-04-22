const state = {
  mode: "audit",
  lastText: "",
  isLoading: false,
};

const modeButtons = document.querySelectorAll(".mode-button");
const panels = document.querySelectorAll("[data-panel]");
const form = document.querySelector("#marketing-form");
const output = document.querySelector("#output");
const sampleButton = document.querySelector("#sample-button");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const testSummary = document.querySelector("#test-summary");
const generateButton = form.querySelector(".primary-button");

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
    predaj: "Predaj produktu alebo služby",
    lead: "Získanie leadu",
    informovanie: "Informovanie návštevníka",
    registracia: "Registrácia alebo rezervácia",
  },
  businessType: {
    lokalny: "Lokálny podnik",
    eshop: "E-shop",
    b2b: "B2B služby",
    creator: "Osobná značka alebo tvorca",
  },
  marketingGoal: {
    predaj: "Predaj",
    brand: "Budovanie značky",
    lead: "Získavanie leadov",
    retencia: "Udržanie zákazníkov",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
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
  state.lastText = "";

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === mode);
  });

  updateTestSummary();
  showEmptyState("Vyplň vstupy a spusti generovanie cez ChatGPT.");
}

function updateTestSummary() {
  testSummary.textContent =
    state.mode === "audit"
      ? "Ukážka vygeneruje audit landing page so zoznamom nedostatkov, odporúčaniami a alternatívnym headlineom."
      : "Ukážka vygeneruje odporúčanú stratégiu, kanály, optimalizácie, zdôvodnenie a prvé kroky.";
}

function collectInputs() {
  if (state.mode === "audit") {
    return {
      pageInput: fields.pageInput.value.trim(),
      pageGoal: fields.pageGoal.value,
      pageGoalLabel: labels.pageGoal[fields.pageGoal.value],
      pageAudience: fields.pageAudience.value.trim(),
    };
  }

  return {
    budget: Number(fields.budget.value) || 0,
    budgetLabel: money(fields.budget.value),
    businessType: fields.businessType.value,
    businessTypeLabel: labels.businessType[fields.businessType.value],
    marketingGoal: fields.marketingGoal.value,
    marketingGoalLabel: labels.marketingGoal[fields.marketingGoal.value],
    offer: fields.offer.value.trim(),
  };
}

function showEmptyState(message) {
  output.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
}

function showError(message) {
  output.innerHTML = `
    <div class="result-block error-state">
      <h3>Generovanie zlyhalo</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  generateButton.disabled = isLoading;
  sampleButton.disabled = isLoading;
  generateButton.classList.toggle("loading", isLoading);

  if (isLoading) {
    generateButton.dataset.originalText = generateButton.textContent.trim();
    generateButton.lastChild.textContent = " ChatGPT generuje...";
  } else if (generateButton.dataset.originalText) {
    generateButton.lastChild.textContent = " Vygenerovať výstup";
  }
}

function renderSection(section) {
  const heading = escapeHtml(section.heading || "Výstup");
  const kind = section.kind || "paragraph";
  const items = Array.isArray(section.items) ? section.items.filter(Boolean) : [];
  const body = section.body || "";

  if (items.length > 0) {
    const tag = kind === "ordered" ? "ol" : "ul";
    return `
      <div class="result-block">
        <h3>${heading}</h3>
        <${tag}>${listItems(items)}</${tag}>
      </div>
    `;
  }

  if (kind === "quote") {
    return `
      <div class="result-block">
        <h3>${heading}</h3>
        <p class="quote-output">${escapeHtml(body)}</p>
      </div>
    `;
  }

  return `
    <div class="result-block">
      <h3>${heading}</h3>
      <p>${escapeHtml(body)}</p>
    </div>
  `;
}

function buildTextFromResult(result) {
  const lines = [result.title || "MarketPilot výstup", ""];

  result.sections.forEach((section) => {
    lines.push(section.heading || "Výstup");

    if (Array.isArray(section.items) && section.items.length > 0) {
      lines.push(textList(section.items));
    } else {
      lines.push(section.body || "");
    }

    lines.push("");
  });

  return lines.join("\n").trim();
}

function renderAiResult(result) {
  const sections = Array.isArray(result.sections) ? result.sections : [];

  if (sections.length === 0) {
    throw new Error("Backend vrátil prázdny výstup.");
  }

  output.innerHTML = sections.map(renderSection).join("");
  state.lastText = result.text || buildTextFromResult({ ...result, sections });
}

async function generate() {
  if (state.isLoading) {
    return;
  }

  setLoading(true);
  showEmptyState("ChatGPT pripravuje konkrétny marketingový výstup...");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: state.mode,
        inputs: collectInputs(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Nepodarilo sa spojiť s backendom.");
    }

    renderAiResult(data);
  } catch (error) {
    state.lastText = "";
    showError(
      error.message ||
        "Skontroluj, či je projekt nasadený s backendom a či je nastavený OPENAI_API_KEY.",
    );
  } finally {
    setLoading(false);
  }
}

function fillSample() {
  if (state.mode === "audit") {
    fields.pageInput.value =
      "Landing page pre lokálne fitness štúdio. Stránka komunikuje moderné tréningy, ale hlavný CTA text je iba Kontaktujte nás.";
    fields.pageGoal.value = "lead";
    fields.pageAudience.value =
      "ľudia z mesta, ktorí chcú začať pravidelne cvičiť";
  } else {
    fields.budget.value = "1000";
    fields.businessType.value = "eshop";
    fields.marketingGoal.value = "predaj";
    fields.offer.value = "e-shop s prírodnou kozmetikou pre citlivú pleť";
  }
}

async function copyOutput() {
  if (!state.lastText) {
    await generate();
  }

  if (!state.lastText) {
    return;
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

async function downloadOutput() {
  if (!state.lastText) {
    await generate();
  }

  if (!state.lastText) {
    return;
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
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

sampleButton.addEventListener("click", () => {
  fillSample();
  generate();
});

copyButton.addEventListener("click", copyOutput);
downloadButton.addEventListener("click", downloadOutput);

updateTestSummary();
showEmptyState("Vyplň vstupy a spusti generovanie cez ChatGPT.");
