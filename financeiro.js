const campoBusca = document.getElementById("campoBusca");
const listaEl = document.getElementById("listaLancamentos");
const contadorLanc = document.getElementById("contadorLanc");
const msg = document.getElementById("msg");

const resumoSaldo = document.getElementById("resumoSaldo");
const resumoReceita = document.getElementById("resumoReceita");
const resumoDespesa = document.getElementById("resumoDespesa");

const btnLimparTudo = document.getElementById("btnLimparTudo");

const listaPrevisoes = document.getElementById("listaPrevisoes");
const msgPrevisao = document.getElementById("msgPrevisao");

// Storage 
function lerLancamentos() {
  try {
    return JSON.parse(localStorage.getItem("lancamentos")) || [];
  } catch {
    return [];
  }
}

function salvarLancamentos(lista) {
  localStorage.setItem("lancamentos", JSON.stringify(lista));
}

function lerRecorrentes() {
  try {
    return JSON.parse(localStorage.getItem("recorrentes")) || [];
  } catch {
    return [];
  }
}

// Helpers
function formatarBRL(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function somar(lista, tipo) {
  return lista
    .filter(l => l.tipo === tipo)
    .reduce((acc, i) => acc + Number(i.valor || 0), 0);
}

function gerarId() {
  return "gerado_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

function ultimoDiaDoMes(ano, mes) {
  return new Date(ano, mes + 1, 0).getDate();
}

function montarData(ano, mes, dia) {
  const diaReal = Math.min(dia, ultimoDiaDoMes(ano, mes));
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(diaReal).padStart(2, "0")}`;
}

function obterDiaVencimento(item) {
  const base = item.vencimento || item.data;
  if (!base) return 1;
  return Number(base.split("-")[2]) || 1;
}

function compararData(a, b) {
  return new Date(a.data) - new Date(b.data);
}

function chaveRecorrencia(origemId, mesRef) {
  return `${origemId}_${mesRef}`;
}

//  Gerar ocorrências 
function gerarOcorrenciasAteMesAtual(lancamentos, recorrentes) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const lista = [...lancamentos];

  recorrentes.forEach((rec) => {
    const dataBase = rec.vencimento || rec.data;
    if (!dataBase) return;

    const [anoInicio, mesInicio] = dataBase.split("-").map(Number);
    if (!anoInicio || !mesInicio) return;

    const dia = obterDiaVencimento(rec);

    let ano = anoInicio;
    let mes = mesInicio - 1;

    while (ano < anoAtual || (ano === anoAtual && mes <= mesAtual)) {
      const mesRef = `${ano}-${String(mes + 1).padStart(2, "0")}`;
      const chave = chaveRecorrencia(rec.id, mesRef);

      const jaExiste = lista.some(item => item.chaveRecorrencia === chave);

      if (!jaExiste) {
        const dataGerada = montarData(ano, mes, dia);

        lista.push({
          id: gerarId(),
          origemId: rec.id,
          chaveRecorrencia: chave,
          tipo: "despesa",
          descricao: rec.descricao,
          valor: rec.valor,
          categoria: rec.categoria,
          pagamento: rec.pagamento,
          data: dataGerada,
          vencimento: dataGerada,
          recorrente: "sim",
          pago: false,
          geradoAutomaticamente: true
        });
      }

      mes++;
      if (mes > 11) {
        mes = 0;
        ano++;
      }
    }
  });

  return lista;
}

// Previsões futuras 
function gerarPrevisoesFuturas(recorrentes, quantidadeMeses = 3) {
  const previsoes = [];
  const hoje = new Date();
  const diaHoje = hoje.getDate();

  recorrentes.forEach((rec) => {
    const dia = obterDiaVencimento(rec);

    for (let i = 1; i <= quantidadeMeses; i++) {
      const futura = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const ano = futura.getFullYear();
      const mes = futura.getMonth();

      const dataPrevista = montarData(ano, mes, dia);

      previsoes.push({
        tipo: "despesa",
        descricao: rec.descricao,
        valor: rec.valor,
        categoria: rec.categoria,
        pagamento: rec.pagamento,
        data: dataPrevista,
        vencimento: dataPrevista,
        recorrente: "sim",
        previsao: true
      });
    }
  });

  return previsoes.sort(compararData);
}

// Resumo 
function renderResumo(lista) {
  const totalR = somar(lista, "receita");
  const totalD = somar(lista, "despesa");
  const saldo = totalR - totalD;

  resumoReceita.textContent = formatarBRL(totalR);
  resumoDespesa.textContent = formatarBRL(totalD);
  resumoSaldo.textContent = formatarBRL(saldo);
}

// Lista principal 
function renderLista(lista) {
  listaEl.innerHTML = "";

  if (lista.length === 0) {
    msg.textContent = "Nenhum lançamento ainda. Crie uma receita ou despesa.";
    contadorLanc.textContent = "0";
    return;
  }

  msg.textContent = "";
  contadorLanc.textContent = String(lista.length);

  const ordenada = [...lista].sort(compararData).reverse();

  ordenada.forEach((lanc, index) => {
    const ehReceita = lanc.tipo === "receita";

    const tipoTxt = ehReceita ? "Receita" : "Despesa";
    const classeValor = ehReceita ? "receita" : "despesa";
    const sinal = ehReceita ? "+" : "-";

    const cat = lanc.categoria ? ` • ${lanc.categoria}` : "";

    const forma = ehReceita
      ? (lanc.recebimento ? ` • ${lanc.recebimento}` : "")
      : (lanc.pagamento ? ` • ${lanc.pagamento}` : "");

    const venc = !ehReceita && lanc.vencimento ? ` • Venc: ${lanc.vencimento}` : "";

    const dataRecebimento = ehReceita && lanc.dataRecebimento
      ? ` • Recebido em: ${lanc.dataRecebimento}`
      : "";

    const badgeRecorrente = !ehReceita && String(lanc.recorrente).toLowerCase() === "sim"
      ? ` <span class="badge text-bg-info ms-2">Recorrente</span>`
      : "";

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

    const podeEditar = !lanc.geradoAutomaticamente;
    const acoes = podeEditar
      ? `
        <button class="btn btn-sm btn-outline-danger" data-del="${index}" title="Excluir">
          🗑
        </button>
      `
      : `
        <span class="badge text-bg-secondary">Automático</span>
      `;

    const item = document.createElement("div");
    item.className = "list-group-item d-flex justify-content-between align-items-center gap-3";

    item.innerHTML = `
      <div class="d-flex flex-column">
        <div class="fw-semibold">
          ${lanc.descricao || "(Sem descrição)"}${status}${badgeRecorrente}
        </div>
        <div class="small text-muted">
          ${tipoTxt}${cat}${forma} • ${lanc.data || "-"}${venc}${dataRecebimento}
        </div>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
        <div class="lanc-valor ${classeValor}">
          ${sinal} ${formatarBRL(Number(lanc.valor || 0))}
        </div>
        ${acoes}
      </div>
    `;

    listaEl.appendChild(item);
  });
}

// Lista de previsões 
function renderPrevisoes(lista) {
  if (!listaPrevisoes || !msgPrevisao) return;

  listaPrevisoes.innerHTML = "";

  if (lista.length === 0) {
    msgPrevisao.textContent = "Nenhuma previsão futura encontrada.";
    return;
  }

  msgPrevisao.textContent = "";

  lista.forEach((item) => {
    const el = document.createElement("div");
    el.className = "list-group-item d-flex justify-content-between align-items-center gap-3";

    el.innerHTML = `
      <div class="d-flex flex-column">
        <div class="fw-semibold">
          ${item.descricao}
          <span class="badge text-bg-light ms-2">Previsto</span>
        </div>
        <div class="small text-muted">
          ${item.categoria ? item.categoria + " • " : ""}
          ${item.pagamento ? item.pagamento + " • " : ""}
          ${item.vencimento}
        </div>
      </div>

      <div class="lanc-valor despesa">
        - ${formatarBRL(Number(item.valor || 0))}
      </div>
    `;

    listaPrevisoes.appendChild(el);
  });
}

// Busca 
function aplicarBusca(lista, texto) {
  const t = texto.trim().toLowerCase();
  if (!t) return lista;

  return lista.filter(l => {
    const descricao = (l.descricao || "").toLowerCase();
    const categoria = (l.categoria || "").toLowerCase();
    return descricao.includes(t) || categoria.includes(t);
  });
}

// Init 
const lancamentosBase = lerLancamentos();
const recorrentes = lerRecorrentes();

let lancamentos = gerarOcorrenciasAteMesAtual(lancamentosBase, recorrentes);

// salva as ocorrências geradas para não recriar diferente depois
salvarLancamentos(lancamentos);

const previsoes = gerarPrevisoesFuturas(recorrentes, 3);

renderResumo(lancamentos);
renderLista(lancamentos);
renderPrevisoes(previsoes);

// buscar
campoBusca.addEventListener("input", () => {
  const filtrada = aplicarBusca(lancamentos, campoBusca.value);
  renderLista(filtrada);
});

// excluir
listaEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const idx = Number(btn.dataset.del);
  if (!Number.isInteger(idx)) return;

  const ordenada = [...lancamentos].sort(compararData).reverse();
  const itemSelecionado = ordenada[idx];
  if (!itemSelecionado) return;

  lancamentos = lancamentos.filter(item => item.id !== itemSelecionado.id);
  salvarLancamentos(lancamentos);

  renderResumo(lancamentos);
  renderLista(aplicarBusca(lancamentos, campoBusca.value));
});

// limpar tudo
btnLimparTudo.addEventListener("click", () => {
  const ok = confirm("Tem certeza que deseja apagar TODOS os lançamentos?");
  if (!ok) return;

  localStorage.removeItem("lancamentos");
  localStorage.removeItem("recorrentes");

  lancamentos = [];
  campoBusca.value = "";

  renderResumo(lancamentos);
  renderLista(lancamentos);
  renderPrevisoes([]);
});