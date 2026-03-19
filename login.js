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

// verificar campos vazios
if (!login || !senha) {
msg.textContent = "Preencha login e senha.";
return;
}

// validar email
if (!validarEmail(login)) {
msg.textContent = "Digite um e-mail válido.";
return;
}

// senha mínima
if (senha.length < 6) {
msg.textContent = "A senha deve ter pelo menos 6 caracteres.";
return;
}

// senha precisa ter número
if (!/\d/.test(senha)) {
msg.textContent = "A senha deve conter pelo menos 1 número.";
return;
}

// salvar usuário logado
localStorage.setItem("usuarioLogado", login);

// ir para dashboard
window.location.href = "index.html";
});