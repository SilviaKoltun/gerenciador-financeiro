const form = document.getElementById("formDespesa");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const categoria = document.getElementById("categoria");
const pagamento = document.getElementById("pagamento");
const data = document.getElementById("data");
const vencimento = document.getElementById("vencimento");
const recorrente = document.getElementById("recorrente");
const pago = document.getElementById("pago");
const msg = document.getElementById("msg");
const btnLimpar = document.getElementById("btnLimpar");
const btnSalvar = document.getElementById("btnSalvar");
const tituloPagina = document.getElementById("tituloPagina");

const params = new URLSearchParams(window.location.search);
const indiceEdicao = params.get("editar");

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

function gerarId() {
  return "id_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

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

function salvarRecorrentes(lista) {
  localStorage.setItem("recorrentes", JSON.stringify(lista));
}

function limparFormulario() {
  form.reset();
  data.value = hojeISO();
  vencimento.value = "";
  recorrente.value = "";
  msg.textContent = "";
  descricao.focus();
}

function preencherModoEdicao() {
  if (indiceEdicao === null) return;

  const lancamentos = lerLancamentos();
  const lanc = lancamentos[Number(indiceEdicao)];

  if (!lanc || lanc.tipo !== "despesa") {
    msg.textContent = "Despesa para edição não encontrada.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  tituloPagina.textContent = "EDITAR DESPESA";
  btnSalvar.textContent = "Atualizar";

  descricao.value = lanc.descricao || "";
  valor.value = lanc.valor || "";
  categoria.value = lanc.categoria || "";
  pagamento.value = lanc.pagamento || "";
  data.value = lanc.data || hojeISO();
  vencimento.value = lanc.vencimento || "";
  recorrente.value = lanc.recorrente || "nao";
  pago.checked = !!lanc.pago;
}

data.value = hojeISO();
preencherModoEdicao();

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = descricao.value.trim();
  const v = Number(String(valor.value).replace(",", "."));
  const dt = data.value;
  const cat = categoria.value.trim();
  const pag = pagamento.value.trim();
  const venc = vencimento.value || dt;
  const rec = (recorrente.value || "").toLowerCase();
  const foiPago = pago.checked;

  if (!desc || !dt || !Number.isFinite(v) || v <= 0 || !cat || !pag || !rec) {
    msg.textContent = "Preencha todos os campos obrigatórios.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  const objetoDespesa = {
    id: gerarId(),
    tipo: "despesa",
    descricao: desc,
    valor: v,
    categoria: cat,
    pagamento: pag,
    data: dt,
    vencimento: venc,
    recorrente: rec,
    pago: foiPago
  };

  if (rec === "sim") {
    const recorrentes = lerRecorrentes();

    recorrentes.push({
      id: objetoDespesa.id,
      tipo: "despesa",
      descricao: objetoDespesa.descricao,
      valor: objetoDespesa.valor,
      categoria: objetoDespesa.categoria,
      pagamento: objetoDespesa.pagamento,
      data: objetoDespesa.data,
      vencimento: objetoDespesa.vencimento,
      recorrente: "sim"
    });

    salvarRecorrentes(recorrentes);

    msg.textContent = "Despesa recorrente cadastrada com sucesso! ✅";
    msg.className = "small text-center mt-3 mb-0 text-success";
    limparFormulario();
    return;
  }

  const lancamentos = lerLancamentos();
  lancamentos.push(objetoDespesa);
  salvarLancamentos(lancamentos);

  msg.textContent = "Despesa salva com sucesso! ✅";
  msg.className = "small text-center mt-3 mb-0 text-success";

  limparFormulario();
});

btnLimpar.addEventListener("click", () => {
  limparFormulario();
});