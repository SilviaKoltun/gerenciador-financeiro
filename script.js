const MODO_TESTE = true;

let graficoResumo = null;
let graficoLinha = null;
let mesSelecionado = getMesAnoAtual();

// HELPERS

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

function diasDoMesSelecionado(mesAno) {
  const [ano, mes] = mesAno.split("-").map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();

  const datas = [];
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const data = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    datas.push(data);
  }

  return datas;
}

// LOGIN

const usuario = localStorage.getItem("usuarioLogado");
if (!MODO_TESTE && !usuario) {
  window.location.href = "login.html";
}

function preencherNomeTopo() {
  const el = document.getElementById("perfilNomeTopo");
  if (el) el.textContent = usuario || "Visitante";
}

// DASHBOARD MENSAL
function atualizarDashboardMensal() {
  const lanc = lerLancamentos();
  const mesAno = mesSelecionado;

  const totalR = somarMes(lanc, "receita", mesAno);
  const totalD = somarMes(lanc, "despesa", mesAno);
  const saldoMes = totalR - totalD;

  const mesAtualLabel = document.getElementById("mesAtualLabel");
  if (mesAtualLabel) {
    const [ano, mes] = mesAno.split("-");
    mesAtualLabel.textContent = `Mês selecionado: ${nomeMesPt(Number(mes) - 1)} / ${ano}`;
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
}

// ALERTAS
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
  renderGraficoResumo();
  renderGraficoLinha();
});

// SAIR
function configurarSair() {
  const btnSair = document.getElementById("btnSair");
  if (!btnSair) return;

  btnSair.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });
}

// GRÁFICO PRINCIPAL
function renderGraficoResumo() {
  const canvas = document.getElementById("graficoResumo");
  const seletor = document.getElementById("tipoGrafico");
  if (!canvas || !seletor || !window.Chart) return;

  const tipo = seletor.value;
  const lanc = lerLancamentos();
  const mesAno = mesSelecionado;

  const totalR = somarMes(lanc, "receita", mesAno);
  const totalD = somarMes(lanc, "despesa", mesAno);

  const temaEscuro = document.body.classList.contains("dark");
  const corTexto = temaEscuro ? "#f1f1f1" : "#1b1b1b";
  const corGrade = temaEscuro ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";

  if (graficoResumo) graficoResumo.destroy();

  graficoResumo = new Chart(canvas, {
    type: tipo,
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        label: "Valores",
        data: [totalR, totalD],
        backgroundColor: ["#4f7cff", "#e53935"],
        borderColor: ["#4f7cff", "#e53935"],
        borderWidth: 1,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: corTexto }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${formatarBRL(context.raw)}`
          }
        }
      },
      scales: (tipo === "bar" || tipo === "line") ? {
        y: {
          beginAtZero: true,
          ticks: {
            color: corTexto,
            callback: (value) => formatarBRL(value)
          },
          grid: { color: corGrade }
        },
        x: {
          ticks: { color: corTexto },
          grid: { color: corGrade }
        }
      } : {}
    }
  });
}

// GRÁFICO MISTO DO MÊS
function renderGraficoLinha() {
  const canvas = document.getElementById("graficoLinha");
  if (!canvas || !window.Chart) return;

  const lanc = lerLancamentos();
  const datas = diasDoMesSelecionado(mesSelecionado);

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
    const [ano, mes] = mesSelecionado.split("-");
    const ultimo = saldoAcumulado[saldoAcumulado.length - 1] || 0;
    info.textContent = `${nomeMesPt(Number(mes) - 1)} / ${ano} • Saldo do período: ${formatarBRL(ultimo)}`;
  }

  const temaEscuro = document.body.classList.contains("dark");
  const corTexto = temaEscuro ? "#f1f1f1" : "#1b1b1b";
  const corGrade = temaEscuro ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";

  if (graficoLinha) graficoLinha.destroy();

  graficoLinha = new Chart(canvas, {
    data: {
      labels: datas.map(d => d.slice(8)),
      datasets: [
        {
          type: "bar",
          label: "Movimentação diária",
          data: movimentacao,
          backgroundColor: movimentacao.map(v => v >= 0 ? "#4f7cff" : "#e53935"),
          yAxisID: "y1"
        },
        {
          type: "line",
          label: "Saldo acumulado",
          data: saldoAcumulado,
          borderColor: "#6f42c1",
          backgroundColor: "rgba(111,66,193,0.12)",
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: "#6f42c1",
          yAxisID: "y"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          labels: { color: corTexto }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatarBRL(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: corTexto,
            maxTicksLimit: 10
          },
          grid: { color: corGrade }
        },
        y: {
          position: "left",
          ticks: {
            color: corTexto,
            callback: (v) => formatarBRL(v)
          },
          grid: { color: corGrade },
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
          },
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: "Movimentação diária",
            color: corTexto
          }
        }
      }
    }
  });
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  preencherNomeTopo();
  configurarSair();

  atualizarDashboardMensal();
  atualizarSino();
  renderGraficoResumo();
  renderGraficoLinha();

  const seletor = document.getElementById("tipoGrafico");
  if (seletor) {
    seletor.addEventListener("change", renderGraficoResumo);
  }

  const filtroMes = document.getElementById("filtroMes");
  if (filtroMes) {
    filtroMes.value = mesSelecionado;

    filtroMes.addEventListener("change", () => {
      mesSelecionado = filtroMes.value;
      atualizarDashboardMensal();
      renderGraficoResumo();
      renderGraficoLinha();
    });
  }

  const badge = document.getElementById("badgeAlertas");
  if (badge && !badge.classList.contains("d-none")) {
    const modalEl = document.getElementById("modalAlertas");
    if (modalEl && window.bootstrap) {
      new bootstrap.Modal(modalEl).show();
    }
  }
});

window.addEventListener("pageshow", () => {
  atualizarDashboardMensal();
  atualizarSino();
  renderGraficoResumo();
  renderGraficoLinha();
});