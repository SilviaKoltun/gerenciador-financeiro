// elementos
const listaEl = document.getElementById("lista");
const contadorEl = document.getElementById("contador");
const msgEl = document.getElementById("msg");

const resumoSaldo = document.getElementById("resumoSaldo");
const resumoReceita = document.getElementById("resumoReceita");
const resumoDespesa = document.getElementById("resumoDespesa");

const fBusca = document.getElementById("fBusca");
const fTipo = document.getElementById("fTipo");
const fDe = document.getElementById("fDe");
const fAte = document.getElementById("fAte");

const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const btnLimparTudo = document.getElementById("btnLimparTudo");

function lerLancamentos() {
  try { return JSON.parse(localStorage.getItem("lancamentos")) || []; }
  catch { return []; }
}
function salvarLancamentos(lista) {
  localStorage.setItem("lancamentos", JSON.stringify(lista));
}

// helpers
function formatarBRL(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function somar(lista, tipo) {
  return lista.filter(l => l.tipo === tipo).reduce((acc, i) => acc + Number(i.valor || 0), 0);
}

function renderResumo(lista) {
  const totalR = somar(lista, "receita");
  const totalD = somar(lista, "despesa");
  const saldo = totalR - totalD;

  resumoReceita.textContent = formatarBRL(totalR);
  resumoDespesa.textContent = formatarBRL(totalD);
  resumoSaldo.textContent = formatarBRL(saldo);
}

function passaFiltroData(l, de, ate) {
  const d = (l.data || "").trim();
  if (!d) return false;

  if (de && d < de) return false;
  if (ate && d > ate) return false;
  return true;
}

function aplicarFiltros(lista) {
  const busca = fBusca.value.trim().toLowerCase();
  const tipo = fTipo.value;
  const de = fDe.value;
  const ate = fAte.value;

  return lista.filter(l => {
    const desc = (l.descricao || "").toLowerCase();

    if (busca && !desc.includes(busca)) return false;
    if (tipo !== "todos" && l.tipo !== tipo) return false;

    if (de || ate) {
      if (!passaFiltroData(l, de, ate)) return false;
    }

    return true;
  });
}

// lista
function renderLista(listaFiltrada, listaOriginal) {
  listaEl.innerHTML = "";

  if (listaFiltrada.length === 0) {
    msgEl.textContent = "Nenhum lançamento encontrado com esses filtros.";
    contadorEl.textContent = "0";
    return;
  }

  msgEl.textContent = "";
  contadorEl.textContent = String(listaFiltrada.length);

  // mais recente primeiro
  const ordenada = [...listaFiltrada].sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  ordenada.forEach(l => {
    const ehReceita = l.tipo === "receita";

    const tipoTxt = ehReceita ? "Receita" : "Despesa";
    const classeValor = ehReceita ? "receita" : "despesa";
    const sinal = ehReceita ? "+" : "-";

    const cat = l.categoria ? ` • ${l.categoria}` : "";

    const forma = ehReceita
      ? (l.recebimento ? ` • ${l.recebimento}` : "")
      : (l.pagamento ? ` • ${l.pagamento}` : "");

    const venc = !ehReceita && l.vencimento ? ` • Venc: ${l.vencimento}` : "";

    let status = "";
    if (ehReceita) {
      if (typeof l.recebido === "boolean") {
        status = l.recebido
          ? ` <span class="badge text-bg-success ms-2">Recebido</span>`
          : ` <span class="badge text-bg-warning ms-2">Pendente</span>`;
      }
    } else {
      if (typeof l.pago === "boolean") {
        status = l.pago
          ? ` <span class="badge text-bg-success ms-2">Pago</span>`
          : ` <span class="badge text-bg-warning ms-2">Em aberto</span>`;
      }
    }

    const idx = listaOriginal.indexOf(l);

    const item = document.createElement("div");
    item.className = "list-group-item d-flex justify-content-between align-items-center gap-3";

    item.innerHTML = `
      <div class="d-flex flex-column">
        <div class="fw-semibold">
          ${l.descricao || "(Sem descrição)"}${status}
        </div>
        <div class="small text-muted">
          ${tipoTxt}${cat}${forma} • ${l.data || "-"}${venc}
        </div>
      </div>

      <div class="d-flex align-items-center gap-3">
        <div class="lanc-valor ${classeValor}">
          ${sinal} ${formatarBRL(Number(l.valor || 0))}
        </div>
        <button class="btn btn-sm btn-outline-danger" data-del="${idx}" title="Excluir">🗑</button>
      </div>
    `;

    listaEl.appendChild(item);
  });
}

// init
let lancamentos = lerLancamentos();
let lancamentosFiltrados = aplicarFiltros(lancamentos);
renderResumo(lancamentosFiltrados);
renderLista(lancamentosFiltrados, lancamentos);

// eventos de filtro
[fBusca, fTipo, fDe, fAte].forEach(el => {
  el.addEventListener("input", () => {
    let lancamentosAtualizados = aplicarFiltros(lancamentos);
    renderResumo(lancamentosAtualizados);  
    renderLista(lancamentosAtualizados, lancamentos);
  });
});

// excluir
listaEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const idx = Number(btn.dataset.del);
  if (!Number.isInteger(idx) || idx < 0) return;

  lancamentos.splice(idx, 1);
  salvarLancamentos(lancamentos);

  let lancamentosAtualizados = aplicarFiltros(lancamentos);
  renderResumo(lancamentosAtualizados);  
  renderLista(lancamentosAtualizados, lancamentos);
});

// limpar filtros
btnLimparFiltros.addEventListener("click", () => {
  fBusca.value = "";
  fTipo.value = "todos";
  fDe.value = "";
  fAte.value = "";
  let lancamentosAtualizados = aplicarFiltros(lancamentos);
  renderResumo(lancamentosAtualizados);  
  renderLista(lancamentosAtualizados, lancamentos);
});

// limpar tudo (teste)
btnLimparTudo.addEventListener("click", () => {
  const ok = confirm("Tem certeza que deseja apagar TODOS os lançamentos?");
  if (!ok) return;

  lancamentos = [];
  salvarLancamentos(lancamentos);

  renderResumo(lancamentos);
  renderLista([], lancamentos);
  msgEl.textContent = "Lançamentos apagados.";
  contadorEl.textContent = "0";
});