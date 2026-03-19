const formLogin = document.getElementById("formLogin");
const campoEmail = document.getElementById("login");
const campoSenha = document.getElementById("senha");
const msg = document.getElementById("msg");

function mostrarMensagem(texto, tipo = "danger") {
  msg.textContent = texto;
  msg.className = `small text-center text-${tipo}`;
}

function limparMensagem() {
  msg.textContent = "";
  msg.className = "small text-center";
}

function emailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function senhaValida(senha) {
  // Regra:
  // mínimo 6 caracteres
  // pelo menos 1 letra
  // pelo menos 1 número
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  return regex.test(senha);
}

function obterUsuarios() {
  try {
    return JSON.parse(localStorage.getItem("usuarios")) || [];
  } catch (erro) {
    return [];
  }
}

function salvarSessao(usuario) {
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

formLogin.addEventListener("submit", function (e) {
  e.preventDefault();

  limparMensagem();

  const email = campoEmail.value.trim().toLowerCase();
  const senha = campoSenha.value.trim();

  if (!email || !senha) {
    mostrarMensagem("Preencha e-mail e senha.");
    return;
  }

  if (!emailValido(email)) {
    mostrarMensagem("Digite um e-mail válido.");
    campoEmail.focus();
    return;
  }

  if (!senhaValida(senha)) {
    mostrarMensagem("A senha deve ter pelo menos 6 caracteres, com letra e número.");
    campoSenha.focus();
    return;
  }

  const usuarios = obterUsuarios();

  // procura usuário cadastrado
  const usuarioEncontrado = usuarios.find(
    (usuario) =>
      String(usuario.email || "").toLowerCase() === email &&
      String(usuario.senha || "") === senha
  );

  if (!usuarioEncontrado) {
    mostrarMensagem("E-mail ou senha incorretos.");
    return;
  }

  salvarSessao({
    nome: usuarioEncontrado.nome || "",
    email: usuarioEncontrado.email
  });

  mostrarMensagem("Login realizado com sucesso! ✅", "success");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});