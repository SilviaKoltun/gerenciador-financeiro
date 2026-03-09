const form = document.getElementById("formLogin");
const inputLogin = document.getElementById("login");
const inputSenha = document.getElementById("senha");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const login = inputLogin.value.trim();
  const senha = inputSenha.value.trim();

  if (!login || !senha) {
    msg.textContent = "Preencha login e senha.";
    return;
  }

  // salva usuário logado
  localStorage.setItem("usuarioLogado", login);

  // vai para o dashboard
  window.location.href = "index.html";
});
