const form = document.getElementById("formPerfil");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");
const senha = document.getElementById("Criar Senha");
const Confirmacao = document.getElementById("Confirmar Senha")
const btnEditar = document.getElementById("btnEditar");
const msg = document.getElementById("msg");

// carregar dados
nome.value = localStorage.getItem("perfil_nome") || "";
email.value = localStorage.getItem("perfil_email") || "";
telefone.value = localStorage.getItem("perfil_telefone") || "";
senha.value = localStorage.getItem("perfil_senha") ||"";
Confirmacao.value = localStorage.getItem("perfil_confirmar_senha") ||"";


// travado por padrão
nome.disabled = true;
email.disabled = true;
telefone.disabled = true;

btnEditar.addEventListener("click", () => {
  nome.disabled = false;
  email.disabled = false;
  telefone.disabled = false;

  nome.focus();
  msg.textContent = "Edição liberada.";
  msg.className = "text-center small text-primary mt-3 mb-0";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const n = nome.value.trim();
  const em = email.value.trim();
  const tel = telefone.value.trim();

  if (!n || !em || !tel) {
    msg.textContent = "Preencha Nome, E-mail e Telefone.";
    msg.className = "text-center small text-danger mt-3 mb-0";
    return;
  }

  localStorage.setItem("perfil_nome", n);
  localStorage.setItem("perfil_email", em);
  localStorage.setItem("perfil_telefone", tel);

  // marca usuário logado
  localStorage.setItem("usuarioLogado", n);

  nome.disabled = true;
  email.disabled = true;
  telefone.disabled = true;

  msg.textContent = "Perfil salvo com sucesso! ✅";
  msg.className = "text-center small text-success mt-3 mb-0";

  // vai para o dashboard
  window.location.href = "index.html";
});
