const form = document.getElementById("formRecorrencia");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const categoria = document.getElementById("categoria");
const pagamento = document.getElementById("pagamento");
const vencimento = document.getElementById("vencimento");
const msg = document.getElementById("msg");

const params = new URLSearchParams(window.location.search);
const indiceEdicao = params.get("editar");

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

function preencherFormulario() {
  const recorrentes = lerRecorrentes();
  const item = recorrentes[Number(indiceEdicao)];

  if (!item) {
    msg.textContent = "Recorrência não encontrada.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  descricao.value = item.descricao || "";
  valor.value = item.valor || "";
  categoria.value = item.categoria || "";
  pagamento.value = item.pagamento || "";
  vencimento.value = item.vencimento || item.data || "";
}

function atualizarLancamentosGerados(recorrenciaAtualizada) {
  const lancamentos = lerLancamentos();

  const atualizados = lancamentos.map((item) => {
    if (item.origemId === recorrenciaAtualizada.id) {
      return {
        ...item,
        descricao: recorrenciaAtualizada.descricao,
        valor: recorrenciaAtualizada.valor,
        categoria: recorrenciaAtualizada.categoria,
        pagamento: recorrenciaAtualizada.pagamento
      };
    }
    return item;
  });

  salvarLancamentos(atualizados);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const recorrentes = lerRecorrentes();
  const idx = Number(indiceEdicao);
  const item = recorrentes[idx];

  if (!item) {
    msg.textContent = "Recorrência não encontrada.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  const novoValor = Number(String(valor.value).replace(",", "."));

  if (
    !descricao.value.trim() ||
    !Number.isFinite(novoValor) ||
    novoValor <= 0 ||
    !categoria.value.trim() ||
    !pagamento.value.trim() ||
    !vencimento.value
  ) {
    msg.textContent = "Preencha todos os campos corretamente.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
  }

  const atualizado = {
    ...item,
    descricao: descricao.value.trim(),
    valor: novoValor,
    categoria: categoria.value.trim(),
    pagamento: pagamento.value.trim(),
    vencimento: vencimento.value,
    data: vencimento.value
  };

  recorrentes[idx] = atualizado;
  salvarRecorrentes(recorrentes);
  atualizarLancamentosGerados(atualizado);

  msg.textContent = "Recorrência atualizada com sucesso! ✅";
  msg.className = "small text-center mt-3 mb-0 text-success";

  setTimeout(() => {
    window.location.href = "recorrencias.html";
  }, 1000);
});

preencherFormulario();