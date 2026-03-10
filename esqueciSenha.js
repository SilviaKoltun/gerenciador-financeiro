const form = document.getElementById("formEsqueciSenha");
const email = document.getElementById("email");
const senha = document.getElementById("Criar Nova Senha");
const Confirmacao = document.getElementById("Confirmar Senha");


email.value = localStorage.getItem("esqueciSenha_email") || "";
senha.value = localStorage.getItem("esqueciSenha_senha") ||"";
Confirmacao.value = localStorage.getItem("esqueciSenha_confirmar_senha") ||"";

form.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const email = inputEmail.value.trim();
    const senha = inputSenha.value.trim();
    const Confirmacao = inputSenha.value.trim();
  
    if (!email || !senha) {
      msg.textContent = "Preencha login e senha.";
      return;
    }
  
    // salva usuário logado
    localStorage.setItem("usuarioLogado", login);
  
    // vai para o dashboard
    window.location.href = "index.html";
  });
  