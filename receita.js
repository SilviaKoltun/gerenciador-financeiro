const form = document.getElementById("formReceita");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const categoria = document.getElementById("categoria");
const recebimento = document.getElementById("recebimento");
const data = document.getElementById("data");
const recebido = document.getElementById("recebido");
const msg = document.getElementById("msg");
const btnLimpar = document.getElementById("btnLimpar");

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

data.value = hojeISO();

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

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = descricao.value.trim();
  const v = Number(String(valor.value).replace(",", "."));
  const dt = data.value;
  const cat = categoria.value.trim();
  const rec = recebimento.value.trim();
  const foiRecebido = recebido.checked;

  if (!desc || !dt || !Number.isFinite(v) || v <= 0 || !cat || !rec) {
    msg.textContent = "Preencha descrição, categoria, forma de recebimento, data e um valor maior que 0.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  const lancamentos = lerLancamentos();

  lancamentos.push({
    tipo: "receita",
    descricao: desc,
    valor: v,
    categoria: cat,
    recebimento: rec,
    data: dt,
    recebido: foiRecebido
  });

  salvarLancamentos(lancamentos);

  msg.textContent = "Receita salva com sucesso! ✅";
  msg.className = "small text-center mt-3 mb-0 text-success";

  form.reset();
  data.value = hojeISO();
  descricao.focus();
});

btnLimpar.addEventListener("click", () => {
  form.reset();
  data.value = hojeISO();
  msg.textContent = "";
  descricao.focus();
});
