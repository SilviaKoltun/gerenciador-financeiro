const form = document.getElementById("formPerfil");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");
const btnEditar = document.getElementById("btnEditar");
const msg = document.getElementById("msg");

function validarEmail(valor) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(valor);
}

function senhaValida(valor) {
  return valor.length >= 6 && /\d/.test(valor);
}

// carregar dados salvos
nome.value = localStorage.getItem("perfil_nome") || "";
email.value = localStorage.getItem("perfil_email") || "";
telefone.value = localStorage.getItem("perfil_telefone") || "";
senha.value = localStorage.getItem("perfil_senha") || "";
confirmarSenha.value = localStorage.getItem("perfil_senha") || "";

// se já existe cadastro, bloqueia;
// se não existe, deixa aberto para primeiro acesso
const temCadastro = !!localStorage.getItem("perfil_email");

nome.disabled = temCadastro;
email.disabled = temCadastro;
telefone.disabled = temCadastro;
senha.disabled = temCadastro;
confirmarSenha.disabled = temCadastro;

btnEditar.addEventListener("click", () => {
  nome.disabled = false;
  email.disabled = false;
  telefone.disabled = false;
  senha.disabled = false;
  confirmarSenha.disabled = false;

  nome.focus();
  msg.textContent = "Edição liberada.";
  msg.className = "text-center small text-primary mt-3 mb-0";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const n = nome.value.trim();
  const em = email.value.trim();
  const tel = telefone.value.trim();
  const s = senha.value.trim();
  const cs = confirmarSenha.value.trim();

  msg.textContent = "";

  if (!n || !em || !tel || !s || !cs) {
    msg.textContent = "Preencha todos os campos.";
    msg.className = "text-center small text-danger mt-3 mb-0";
    return;
  }

  if (!validarEmail(em)) {
    msg.textContent = "Digite um e-mail válido.";
    msg.className = "text-center small text-danger mt-3 mb-0";
    return;
  }

  if (!senhaValida(s)) {
    msg.textContent = "A senha deve ter pelo menos 6 caracteres e 1 número.";
    msg.className = "text-center small text-danger mt-3 mb-0";
    return;
  }

  if (s !== cs) {
    msg.textContent = "A confirmação de senha não confere.";
    msg.className = "text-center small text-danger mt-3 mb-0";
    return;
  }

  localStorage.setItem("perfil_nome", n);
  localStorage.setItem("perfil_email", em);
  localStorage.setItem("perfil_telefone", tel);
  localStorage.setItem("perfil_senha", s);

  // usuário logado passa a ser o email
  localStorage.setItem("usuarioLogado", em);

  nome.disabled = true;
  email.disabled = true;
  telefone.disabled = true;
  senha.disabled = true;
  confirmarSenha.disabled = true;

  msg.textContent = "Cadastro efetuado com sucesso! ✅";
  msg.className = "text-center small text-success mt-3 mb-0";

  // escolha o destino:
  // login.html = obrigar a entrar pela tela de login
  // index.html = entrar direto no dashboard

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
});