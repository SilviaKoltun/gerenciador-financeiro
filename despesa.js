const form = document.getElementById("formDespesa");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const categoria = document.getElementById("categoria");
const pagamento = document.getElementById("pagamento");
const data = document.getElementById("data");
const vencimento = document.getElementById("vencimento");
const recorrentes = document.getElementById("Recorrente");
const pago = document.getElementById("pago");
const msg = document.getElementById("msg");
const btnLimpar = document.getElementById("btnLimpar");
const btnSalvar = document.getElementById("btnSalvar");
const tituloPagina = document.getElementById("tituloPagina");


const params = new URLSearchParams(window.location.search);
const indiceEdicao = params.get("editar"); // ex: despesa.html?editar=3

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
  vencimento.value = "";
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
  Recorrente.value = lanc.Recorrente
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
  const venc = vencimento.value;
  const rec = recorrente.value;
  const foiPago = pago.checked;

  if (!desc || !dt || !Number.isFinite(v) || v <= 0 || !cat || !pag) {
    msg.textContent = "Preencha descrição, categoria, forma de pagamento, data e um valor maior que 0.";
    msg.className = "small text-center mt-3 mb-0 text-danger";
    return;
     
  }
}
function projetarRecorrentes (dataIni, dataFim)
  const recorrentes = getRecorrentes();

  const projetados [];

  const ini = new Date (dataIni + 'T00:00:00');
  const fim = new Date (dataIni + 'T00:00:00');

  recorrentes.forEach(function(rec)) {
  let cursor = new Date(ini.getFullYear(), ini.getMonth(), 1);

  while (cursor <= fim){
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth();

    if (rec.fimRecorrencia){
      const fimRec = new Date (rec.fimRecorrencia + 'T00:00:00');
      if (cursor > fimRec) {
        cursor = new Date (ano, mes + 1, 1);
        continue;
      }
    }
    const dia = rec.diaVencimento || new Date(rec.data).getDate();
    constultimoDiadoMes = new Date(ano, mes, + 1,0).getDate();
    const diaReal = Math.min(dia, ultimoDiaDoMes);
    const dataVenc = new Date (ano, mes, diaReal);

    if (dataVenc) > = ini && dataVenc <=fim {

      const chaveUnica = rec.id+'_'+mes;
      const lancamentos = getLancamentos();
      const jaExiste = lancamentos.some(L=> L,recorrentesRef ===chaveUnica);
      if (!jaExiste){
        const dataStr = dataVenc.toISOString().slice (0, 10);

        projetados.push({
          ...rec,
          id:         'proj_' + chaveUnica,
          data:        dataStr,
          projetado:   true,
          recorrentesId:  rec.id,
          recorrentesRef: chaveUnica,
        });
      }
    }
    cursor = new Date(ano, mes + 1, 1);
  }
 });

 return projetados;
}

  const lancamentos = lerLancamentos();

  const objetoDespesa = {
    tipo: "despesa",
    descricao: desc,
    valor: v,
    categoria: cat,
    pagamento: pag,
    data: dt,
    vencimento: venc || "",
    pago: foiPago
  };
  
  if (indiceEdicao !== null) {
    const idx = Number(indiceEdicao);

    if (!lancamentos[idx] || lancamentos[idx].tipo !== "despesa") {
      msg.textContent = "Não foi possível atualizar a despesa.";
      msg.className = "small text-center mt-3 mb-0 text-danger";
      return;
  }

    lancamentos[idx] = objetoDespesa;

    salvarLancamentos(lancamentos);

    msg.textContent = "Despesa atualizada com sucesso! ✅";
    msg.className = "small text-center mt-3 mb-0 text-success";

    setTimeout(() => {
      window.location.href = "financeiro.html";
    }, 1000);

    return;
  }

  lancamentos.push(objetoDespesa);
  salvarLancamentos(lancamentos);

  msg.textContent = "Despesa salva com sucesso! ✅";
  msg.className = "small text-center mt-3 mb-0 text-success";

  limparFormulario();
});

btnLimpar.addEventListener("click", () => {
  limparFormulario();
});