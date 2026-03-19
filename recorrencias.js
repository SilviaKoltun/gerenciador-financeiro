const listaRecorrencias = document.getElementById("listaRecorrencias");
const msgRecorrencias = document.getElementById("msgRecorrencias");

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

function formatarBRL(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function renderRecorrencias() {
  const recorrentes = lerRecorrentes();
  listaRecorrencias.innerHTML = "";

  if (recorrentes.length === 0) {
    msgRecorrencias.textContent = "Nenhuma despesa recorrente cadastrada.";
    return;
  }

  msgRecorrencias.textContent = "";

  recorrentes.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "list-group-item";

    el.innerHTML = `
      <div class="rec-item">
        <div class="rec-info">
          <div class="rec-titulo">
            ${item.descricao || "(Sem descrição)"}
            <span class="badge text-bg-info ms-2">Mensal</span>
          </div>
          <div class="rec-subtitulo">
            ${item.categoria || "Sem categoria"} •
            ${item.pagamento || "Sem pagamento"} •
            Vencimento base: ${item.vencimento || item.data || "-"}
          </div>
        </div>

        <div class="rec-acoes">
          <div class="rec-valor">
            ${formatarBRL(item.valor)}
          </div>

          <a class="btn btn-sm btn-outline-primary" href="editar-recorrencia.html?editar=${index}" title="Editar recorrência">
            ✏️
          </a>

          <button class="btn btn-sm btn-outline-danger" data-del="${index}" title="Excluir recorrência">
            🗑
          </button>
        </div>
      </div>
    `;

    listaRecorrencias.appendChild(el);
  });
}

listaRecorrencias.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;

  const idx = Number(btn.dataset.del);
  if (!Number.isInteger(idx)) return;

  const recorrentes = lerRecorrentes();
  const item = recorrentes[idx];
  if (!item) return;

  const ok = confirm(`Deseja excluir a recorrência "${item.descricao}"?`);
  if (!ok) return;

  const recorrentesAtualizados = recorrentes.filter((_, i) => i !== idx);
  salvarRecorrentes(recorrentesAtualizados);

  const lancamentos = lerLancamentos();
  const lancamentosAtualizados = lancamentos.filter(l => l.origemId !== item.id);
  salvarLancamentos(lancamentosAtualizados);

  renderRecorrencias();
});

renderRecorrencias();