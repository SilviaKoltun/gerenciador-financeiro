const form = document.getElementById("formReceita");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const categoria = document.getElementById("categoria");
const recebimento = document.getElementById("recebimento");
const data = document.getElementById("data");
const dataRecebimento = document.getElementById("dataRecebimento");
const recebido = document.getElementById("recebido");
const msg = document.getElementById("msg");
const btnLimpar = document.getElementById("btnLimpar");
const btnSalvar = document.getElementById("btnSalvar");
const tituloPagina = document.getElementById("tituloPagina");

const params = new URLSearchParams(window.location.search);
const indiceEdicao = params.get("editar"); // ex: receita.html?editar=2

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
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

function limparFormulario() {
  form.reset();
  data.value = hojeISO();
  dataRecebimento.value = "";
  msg.textContent = "";
  descricao.focus();
}

function preencherModoEdicao() {
  if (indiceEdicao === null) return;

  const lancamentos = lerLancamentos();
  const lanc = lancamentos[Number(indiceEdicao)];

  if (!lanc || lanc.tipo !== "receita") {
    msg.textContent = "Receita para edição não encontrada.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  tituloPagina.textContent = "EDITAR RECEITA";
  btnSalvar.textContent = "Atualizar";

  descricao.value = lanc.descricao || "";
  valor.value = lanc.valor || "";
  categoria.value = lanc.categoria || "";
  recebimento.value = lanc.recebimento || "";
  data.value = lanc.data || hojeISO();
  dataRecebimento.value = lanc.dataRecebimento || "";
  recebido.checked = !!lanc.recebido;
}

data.value = hojeISO();
preencherModoEdicao();

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = descricao.value.trim();
  const v = Number(String(valor.value).replace(",", "."));
  const dt = data.value;
  const dtReceb = dataRecebimento.value;
  const cat = categoria.value.trim();
  const rec = recebimento.value.trim();
  const foiRecebido = recebido.checked;

  if (!desc || !dt || !Number.isFinite(v) || v <= 0 || !cat || !rec) {
    msg.textContent = "Preencha descrição, categoria, forma de recebimento, data e um valor maior que 0.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  if (foiRecebido && !dtReceb) {
    msg.textContent = "Informe a data do recebimento.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  const lancamentos = lerLancamentos();

  const objetoReceita = {
    tipo: "receita",
    descricao: desc,
    valor: v,
    categoria: cat,
    recebimento: rec,
    data: dt,
    dataRecebimento: dtReceb || "",
    recebido: foiRecebido
  };

  if (indiceEdicao !== null) {
    const idx = Number(indiceEdicao);

    if (!lancamentos[idx] || lancamentos[idx].tipo !== "receita") {
      msg.textContent = "Não foi possível atualizar a receita.";
      msg.className = "small text-center mt-3 mb-0 text-danger";
      return;
    }

    lancamentos[idx] = objetoReceita;

    salvarLancamentos(lancamentos);

    msg.textContent = "Receita atualizada com sucesso! ✅";
    msg.className = "small text-center mt-3 mb-0 text-success";

    setTimeout(() => {
      window.location.href = "financeiro.html";
    }, 1000);

    return;
  }

  lancamentos.push(objetoReceita);
  salvarLancamentos(lancamentos);

  msg.textContent = "Receita salva com sucesso! ✅";
  msg.className = "small text-center mt-3 mb-0 text-success";

  limparFormulario();
});

btnLimpar.addEventListener("click", () => {
  limparFormulario();
});