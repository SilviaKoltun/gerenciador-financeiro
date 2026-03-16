const MODO_TESTE = true;

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

function formatarBRL(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

function getMesAnoAtual() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${ano}-${mes}`;
}

function nomeMesPt(idx) {
  const nomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return nomes[idx] || "";
}

function somarMes(lista, tipo, mesAno) {
  return lista
    .filter(l => l.tipo === tipo && (l.data || "").startsWith(mesAno))
    .reduce((acc, l) => acc + Number(l.valor || 0), 0);
}

const usuario = localStorage.getItem("usuarioLogado");
if (!MODO_TESTE && !usuario) {
  window.location.href = "login.html";
}

function preencherNomeTopo() {
  const el = document.getElementById("perfilNomeTopo");
  if (el) el.textContent = usuario || "Visitante";
}


function atualizarDashboardMensal() {
  const lanc = lerLancamentos();
  const mesAno = getMesSelecionado();

  const totalR = somarMes(lanc, "receita", mesAno);
  const totalD = somarMes(lanc, "despesa", mesAno);
  const saldoMes = totalR - totalD;

  const mesAtualLabel = document.getElementById("mesAtualLabel");
  if (mesAtualLabel) {
    const [ano, mes] = mesAno.split("-");
    mesAtualLabel.textContent = `${nomeMesPt(Number(mes) - 1)} / ${ano}`;
  }

  const elTotalR = document.getElementById("totalReceitaMes");
  if (elTotalR) elTotalR.textContent = `Receitas: ${formatarBRL(totalR)}`;

  const elTotalD = document.getElementById("totalDespesaMes");
  if (elTotalD) elTotalD.textContent = `Despesas: ${formatarBRL(totalD)}`;

  const elSaldoMes = document.getElementById("saldoMes");
  if (elSaldoMes) elSaldoMes.textContent = `Saldo: ${formatarBRL(saldoMes)}`;

  const saldoBox = document.getElementById("saldoBox");
  const btnToggleSaldo = document.getElementById("btnToggleSaldo");

  if (saldoBox) {
    const saldoTexto = formatarBRL(saldoMes);
    saldoBox.textContent = saldoTexto;

    if (btnToggleSaldo) {
      let visivel = true;
      btnToggleSaldo.onclick = () => {
        visivel = !visivel;
        saldoBox.textContent = visivel ? saldoTexto : "••••••";
      };
    }
  }

  // Barras
  const barReceita = document.getElementById("barReceita");
  const barDespesas = document.getElementById("barDespesas");
  if (barReceita && barDespesas) {
    const ALTURA_MAX = 260;
    const ALTURA_MIN = 18;
    const ALTURA_ZERO = 8;

    const maior = Math.max(totalR, totalD, 1);

    const hR = totalR > 0 ? Math.max(ALTURA_MIN, Math.round((totalR / maior) * ALTURA_MAX)) : ALTURA_ZERO;
    const hD = totalD > 0 ? Math.max(ALTURA_MIN, Math.round((totalD / maior) * ALTURA_MAX)) : ALTURA_ZERO;

    barReceita.style.height = `${hR}px`;
    barDespesas.style.height = `${hD}px`;

    barReceita.title = `Receitas do mês: ${formatarBRL(totalR)}`;
    barDespesas.title = `Despesas do mês: ${formatarBRL(totalD)}`;
  }
}

// ÚLTIMOS LANÇAMENTOS (3)

function renderUltimos() {
  const ultimosEl = document.getElementById("ultimosLancamentos");
  const msgUltimos = document.getElementById("msgUltimos");
  if (!ultimosEl) return;

  const lista = lerLancamentos();
  ultimosEl.innerHTML = "";

  if (!lista.length) {
    if (msgUltimos) msgUltimos.textContent = "Sem lançamentos ainda. Vá em Receita ou Despesa.";
    return;
  }

  if (msgUltimos) msgUltimos.textContent = "";

  const ultimos = [...lista].slice(-3).reverse();

  ultimos.forEach(l => {
    const tipoTxt = l.tipo === "receita" ? "Receita" : "Despesa";
    const sinal = l.tipo === "receita" ? "+" : "-";
    const cor = l.tipo === "receita" ? "text-primary" : "text-danger";

    const item = document.createElement("div");
    item.className = "list-group-item d-flex justify-content-between align-items-center";

    item.innerHTML = `
      <div>
        <div class="fw-semibold">${l.descricao || "(Sem descrição)"}</div>
        <div class="small text-muted">${tipoTxt} • ${l.data || "-"}</div>
      </div>
      <div class="fw-bold ${cor}">${sinal} ${formatarBRL(Number(l.valor || 0))}</div>
    `;

    ultimosEl.appendChild(item);
  });
}

// ALERTAS (SINO + MODAL)
function calcularAlertas() {
  const hoje = hojeISO();
  const lanc = lerLancamentos();

  const despesasAbertas = lanc.filter(l =>
    l.tipo === "despesa" &&
    l.vencimento &&
    l.pago === false
  );

  const vencendoHoje = despesasAbertas.filter(d => d.vencimento === hoje);
  const vencidas = despesasAbertas.filter(d => d.vencimento < hoje);

  return { vencendoHoje, vencidas };
}

function getAssinaturaDespesa(d) {
  return `${d.data || ""}|${d.vencimento || ""}|${d.valor || ""}|${d.descricao || ""}`;
}

function marcarComoPago(assinatura) {
  const lanc = lerLancamentos();
  const idx = lanc.findIndex(l => l.tipo === "despesa" && getAssinaturaDespesa(l) === assinatura);
  if (idx === -1) return;

  lanc[idx].pago = true;
  salvarLancamentos(lanc);
}

function atualizarSino() {
  const badge = document.getElementById("badgeAlertas");
  const lista = document.getElementById("listaAlertas");
  const resumo = document.getElementById("resumoAlertas");
  if (!badge || !lista || !resumo) return;

  const { vencendoHoje, vencidas } = calcularAlertas();
  const total = vencendoHoje.length + vencidas.length;

  badge.textContent = total;
  badge.classList.toggle("d-none", total === 0);

  lista.innerHTML = "";

  if (total === 0) {
    resumo.textContent = "Você não tem contas vencendo hoje ou vencidas. ✅";
    return;
  }

  resumo.textContent = `Você tem ${total} alerta(s): ${vencendoHoje.length} vencendo hoje e ${vencidas.length} vencida(s).`;

  function addItem(despesa, tipoTag) {
    const item = document.createElement("div");
    item.className = "list-group-item d-flex justify-content-between align-items-center gap-2";

    const cor = tipoTag === "Vence hoje" ? "bg-warning text-dark" : "bg-danger";

    item.innerHTML = `
      <div class="d-flex flex-column">
        <div class="fw-semibold">
          ${despesa.descricao || "(Sem descrição)"}
          <span class="badge ${cor} ms-2">${tipoTag}</span>
        </div>
        <div class="small text-muted">
          ${despesa.categoria ? despesa.categoria + " • " : ""}
          ${despesa.pagamento ? despesa.pagamento + " • " : ""}
          Venc: ${despesa.vencimento}
        </div>
      </div>

      <div class="text-end">
        <div class="fw-bold text-danger">- ${formatarBRL(despesa.valor)}</div>
        <button class="btn btn-sm btn-outline-success mt-1" data-pagar="${getAssinaturaDespesa(despesa)}">
          Marcar pago
        </button>
      </div>
    `;

    lista.appendChild(item);
  }

  vencendoHoje.forEach(d => addItem(d, "Vence hoje"));
  vencidas.forEach(d => addItem(d, "Vencida"));
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-pagar]");
  if (!btn) return;

  marcarComoPago(btn.dataset.pagar);
  atualizarSino();
  atualizarDashboardMensal();
  renderUltimos();
  renderGraficoResumo();
  renderGraficoLinha();
});

// ========================
// SAIR
// ========================
function configurarSair() {
  const btnSair = document.getElementById("btnSair");
  if (!btnSair) return;

  btnSair.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });
}

// MODO ESCURO (1 ÚNICO BLOCO)

function configurarTema() {
  const btnTema = document.getElementById("btnTema");

  const tema = localStorage.getItem("tema") || "light";
  document.body.classList.toggle("dark", tema === "dark");
  if (btnTema) btnTema.textContent = (tema === "dark") ? "☀" : "🌙";

  if (!btnTema) return;

  btnTema.addEventListener("click", () => {
    const darkAtivo = document.body.classList.toggle("dark");
    localStorage.setItem("tema", darkAtivo ? "dark" : "light");
    btnTema.textContent = darkAtivo ? "☀" : "🌙";
  });
}


document.addEventListener("DOMContentLoaded", () => {
  preencherNomeTopo();
  configurarSair();
  configurarTema();

  atualizarDashboardMensal();
  renderUltimos();
  atualizarSino();

  // abre modal automaticamente se tiver alerta
  const badge = document.getElementById("badgeAlertas");
  if (badge && !badge.classList.contains("d-none")) {
    const modalEl = document.getElementById("modalAlertas");
    if (modalEl && window.bootstrap) {
      new bootstrap.Modal(modalEl).show();
    }
  }
});

// GRÁFICO DE LINHA (Saldo diário - últimos 30 dias)

let chartLinha = null;

function lerLancamentos() {
  try { return JSON.parse(localStorage.getItem("lancamentos")) || []; }
  catch { return []; }
}

function formatarBRL(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

// gera array de datas ISO dos últimos N dias (inclui hoje)
function ultimosDiasISO(qtd) {
  const arr = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = qtd - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    arr.push(d.toISOString().split("T")[0]);
  }
  return arr;
}

function montarSerieSaldoDiario(lancamentos, dias = 30) {
  const datas = ultimosDiasISO(dias);

  // soma (receita/despesa) por dia
  const mapa = new Map();
  datas.forEach(dt => mapa.set(dt, 0));

  lancamentos.forEach(l => {
    const dt = (l.data || "").trim();
    if (!mapa.has(dt)) return;

    const v = Number(l.valor || 0);
    if (!Number.isFinite(v)) return;

    // receita soma, despesa subtrai
    const delta = (l.tipo === "receita") ? v : (l.tipo === "despesa" ? -v : 0);
    mapa.set(dt, mapa.get(dt) + delta);
  });

  // saldo acumulado
  let saldo = 0;
  const valores = datas.map(dt => {
    saldo += mapa.get(dt);
    return Number(saldo.toFixed(2));
  });

  return { labels: datas, valores };
}

function renderGraficoLinha() {
  const canvas = document.getElementById("graficoLinha");
  if (!canvas || !window.Chart) return;

  const lanc = lerLancamentos();
  const datas = ultimosDiasISO(30);

  let saldo = 0;
  const movimentacao = [];
  const saldoAcumulado = [];

  datas.forEach((data) => {
    let totalDia = 0;

    lanc.forEach((l) => {
      if ((l.data || "").trim() !== data) return;

      const valor = Number(l.valor || 0);

      if (l.tipo === "receita") totalDia += valor;
      if (l.tipo === "despesa") totalDia -= valor;
    });

    saldo += totalDia;
    movimentacao.push(Number(totalDia.toFixed(2)));
    saldoAcumulado.push(Number(saldo.toFixed(2)));
  });

  const info = document.getElementById("linhaInfo");
  if (info) {
    const ultimo = saldoAcumulado[saldoAcumulado.length - 1] || 0;
    info.textContent = `Saldo atual no período: ${formatarBRL(ultimo)}`;
  }

  // se já existir, destrói para recriar
  if (chartPizza) chartPizza.destroy();

  chartPizza = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Saldo acumulado",
        data: valores,
        tension: 0.25,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatarBRL(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            // mostra menos datas para não poluir
            maxTicksLimit: 8
          }
        },
        y: {
          position: "left",
          ticks: {
            color: corTexto,
            callback: (v) => formatarBRL(v)
          },
          grid: {
            color: corGrade
          },
          title: {
            display: true,
            text: "Saldo acumulado",
            color: corTexto
          }
        },
        y1: {
          position: "right",
          ticks: {
            color: corTexto,
            callback: (v) => formatarBRL(v)
          }
        }
      }
    }
  });
}

// desenha quando abrir a página
document.addEventListener("DOMContentLoaded", renderGraficoPizza);

// se você salvar receita/despesa e voltar pro dashboard, atualiza:
window.addEventListener("pageshow", renderGraficoPizza);
