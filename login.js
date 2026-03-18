const form = document.getElementById("formLogin");
const inputLogin = document.getElementById("login");
const inputSenha = document.getElementById("senha");
const msg = document.getElementById("msg");

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const login = inputLogin.value.trim();
  const senha = inputSenha.value.trim();

  msg.textContent = "";

  if (!login || !senha) {
    msg.textContent = "Preencha login e senha.";
    return;
  }

  if (!validarEmail(login)) {
    msg.textContent = "Digite um e-mail válido.";
    return;
  }

  const emailSalvo = localStorage.getItem("perfil_email");
  const senhaSalva = localStorage.getItem("perfil_senha");

  if (!emailSalvo || !senhaSalva) {
    msg.textContent = "Nenhum cadastro encontrado. Faça seu cadastro primeiro.";
    return;
  }

  if (login !== emailSalvo || senha !== senhaSalva) {
    msg.textContent = "E-mail ou senha inválidos.";
    return;
  }

  localStorage.setItem("usuarioLogado", login);
  window.location.href = "index.html";
});