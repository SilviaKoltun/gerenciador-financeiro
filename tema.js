const toggle = document.getElementById("temaToggle");

function aplicarTema() {
  const tema = localStorage.getItem("tema") || "light";
  const dark = tema === "dark";
  document.body.classList.toggle("dark", dark);
  if (toggle) toggle.checked = dark;
}

aplicarTema();

if (toggle) {
  toggle.addEventListener("change", () => {
    const darkAtivo = toggle.checked;
    document.body.classList.toggle("dark", darkAtivo);
    localStorage.setItem("tema", darkAtivo ? "dark" : "light");
  });
}