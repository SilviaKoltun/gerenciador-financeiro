const form = document.getElementById("formEsqueciSenha");
const email = document.getElementById("email");
const senha = document.getElementById("novaSenha");
const Confirmacao = document.getElementById("confirmarSenha"); 
const msg = document.getElementById("mensagem");

email.value = localStorage.getItem("esqueciSenha_email") || "";
senha.value = localStorage.getItem("esqueciSenha_senha") || "";
confirmacao.value = localStorage.getItem("esqueciSenha_confirmar_senha") || "";

form.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const valorEmail = email.value.trim();
    const valorSenha = senha.value.trim();
    const valorConfirmacao = confirmacao.value.trim();

  
    if (!valorEmail || !valorSenha || !valorConfirmacao) {
      msg.textContent = "Preencha todos os campos.";
      return;
    }
    if (valorSenha !== valorConfirmacao) {
      msg.textContent = "As Senhas não coincidem.";
      return;
    }
  
    // salva 
    localStorage.setItem("esqueciSenha_email", valorEmail);
    localStorage.setItem("esqueciSenha_senha", valorSenha);
    localStorage.setItem("esqueciSenha_confirmar_senha", valorConfirmacao);
  
    msg.classList.remove("text-danger");
    msg.classList.add("text-success");
    msg.textContent = "Senha redefinida com sucesso!";
  
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
});
  