const campoBusca = document.getElementById("campoBusca");
const listaEl = document.getElementById("listaLancamentos");
const contadorLanc = document.getElementById("contadorLanc");
const msg = document.getElementById("msg");

const resumoSaldo = document.getElementById("resumoSaldo");
const resumoReceita = document.getElementById("resumoReceita");
const resumoDespesa = document.getElementById("resumoDespesa");

const btnLimparTudo = document.getElementById("btnLimparTudo");

function lerLancamentos() {
  try { return JSON.parse(localStorage.getItem("lancamentos")) || []; }
  catch { return []; }
}

function salvarLancamentos(lista) {
  localStorage.setItem("lancamentos", JSON.stringify(lista));
}

function formatarBRL(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function somar(lista, tipo) {
  return lista
    .filter(l => l.tipo === tipo)
    .reduce((acc, i) => acc + Number(i.valor || 0), 0);
}

function renderResumo(lista) {
  const totalR = somar(lista, "receita");
  const totalD = somar(lista, "despesa");
  const saldo = totalR - totalD;

  resumoReceita.textContent = formatarBRL(totalR);
  resumoDespesa.textContent = formatarBRL(totalD);
  resumoSaldo.textContent = formatarBRL(saldo);
}

function renderLista(lista) {
  listaEl.innerHTML = "";

  if (lista.length === 0) {
    msg.textContent = "Nenhum lançamento ainda. Crie uma receita ou despesa.";
    contadorLanc.textContent = "0";
    return;
  }

  msg.textContent = "";
  contadorLanc.textContent = String(lista.length);

  // últimos primeiro (mais recente no topo)
  const ordenada = [...lista].reverse();

  ordenada.forEach((lanc, indexReverso) => {
    const ehReceita = lanc.tipo === "receita";

    const tipoTxt = ehReceita ? "Receita" : "Despesa";
    const classeValor = ehReceita ? "receita" : "despesa";
    const sinal = ehReceita ? "+" : "-";

    // índice real no array original
    const indexReal = lista.length - 1 - indexReverso;

    // categoria
    const cat = lanc.categoria ? ` • ${lanc.categoria}` : "";

    // forma (receita = recebimento | despesa = pagamento)
    const forma = ehReceita
      ? (lanc.recebimento ? ` • ${lanc.recebimento}` : "")
      : (lanc.pagamento ? ` • ${lanc.pagamento}` : "");

    // vencimento só pra despesa
    const venc = !ehReceita && lanc.vencimento ? ` • Venc: ${lanc.vencimento}` : "";

    // status (Recebido/Pendente) ou (Pago/Em aberto)
    let status = "";
    if (ehReceita) {
      if (typeof lanc.recebido === "boolean") {
        status = lanc.recebido
          ? ` <span class="badge text-bg-success ms-2">Recebido</span>`
          : ` <span class="badge text-bg-warning ms-2">Pendente</span>`;
      }
    } else {
      if (typeof lanc.pago === "boolean") {
        status = lanc.pago
          ? ` <span class="badge text-bg-success ms-2">Pago</span>`
          : ` <span class="badge text-bg-warning ms-2">Em aberto</span>`;
      }
    }

    const item = document.createElement("div");
    item.className = "list-group-item d-flex justify-content-between align-items-center gap-3";

    item.innerHTML = `
      <div class="d-flex flex-column">
        <div class="fw-semibold">
          ${lanc.descricao || "(Sem descrição)"}${status}
        </div>
        <div class="small text-muted">
          ${tipoTxt}${cat}${forma} • ${lanc.data || "-"}${venc}
        </div>
      </div>

      <div class="d-flex align-items-center gap-3">
        <div class="lanc-valor ${classeValor}">
          ${sinal} ${formatarBRL(Number(lanc.valor || 0))}
        </div>
        <button class="btn btn-sm btn-outline-danger" data-del="${indexReal}" title="Excluir">🗑</button>
      </div>
    `;

    listaEl.appendChild(item);
  });
}

function aplicarBusca(lista, texto) {
  const t = texto.trim().toLowerCase();
  if (!t) return lista;
  return lista.filter(l => (l.descricao || "").toLowerCase().includes(t));
}

let lancamentos = lerLancamentos();
renderResumo(lancamentos);
renderLista(lancamentos);

campoBusca.addEventListener("input", () => {
  const filtrada = aplicarBusca(lancamentos, campoBusca.value);
  renderLista(filtrada);
});

listaEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const idx = Number(btn.dataset.del);
  if (!Number.isInteger(idx)) return;

  lancamentos.splice(idx, 1);
  salvarLancamentos(lancamentos);

  renderResumo(lancamentos);
  renderLista(aplicarBusca(lancamentos, campoBusca.value));
});

// limpar tudo (teste)
btnLimparTudo.addEventListener("click", () => {
  const ok = confirm("Tem certeza que deseja apagar TODOS os lançamentos?");
  if (!ok) return;

  lancamentos = [];
  salvarLancamentos(lancamentos);

  campoBusca.value = "";
  renderResumo(lancamentos);
  renderLista(lancamentos);
});