async function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  const err = document.getElementById("error");
  if (!u || !p) {
    err.innerText = "Isi username & password";
    return;
  }
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aries: u, aries: p }),
    });
    const d = await res.json();
    if (d.success) {
      localStorage.setItem("isLoggedIn", "true");
      location.href = "index.html";
    } else err.innerText = "Username / Password salah!";
  } catch (e) {
    err.innerText = "Server error, coba lagi";
  }
}
if (localStorage.getItem("isLoggedIn") === "true") location.href = "index.html";
document.getElementById("username")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});
document.getElementById("password")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});
