let folders = [];
let opened = null,
  pilih = false,
  selected = [];
if (localStorage.getItem("isLoggedIn") !== "true") location.href = "login.html";

async function load() {
  try {
    const r = await fetch("/api/folders");
    folders = await r.json();
  } catch {
    folders = JSON.parse(localStorage.getItem("myGalleryFolders") || "[]");
  }
  render();
}
function render() {
  const g = document.getElementById("gallery");
  if (!g) return;
  g.innerHTML = "";
  const q = (
    document.getElementById("searchFolder")?.value || ""
  ).toLowerCase();
  let list = folders.filter((f) => !f.parentId);
  if (q) list = list.filter((f) => f.name.toLowerCase().includes(q));
  list.forEach((f) => {
    const d = document.createElement("div");
    d.className = "folder" + (selected.includes(f.id) && pilih ? " sel" : "");
    d.innerHTML = `<div class="ic">📁</div><div class="nm">${f.name}</div><div class="ct">${f.photos.length} foto</div>`;
    d.onclick = () => {
      if (pilih) {
        toggleSel(f.id);
        return;
      }
      openFolder(f.id);
    };
    g.appendChild(d);
  });
}
function openFolder(id) {
  opened = id;
  const center = document.querySelector(".center");
  if (center) center.style.display = "none";
  const inside = document.getElementById("inside");
  if (inside) inside.style.display = "block";
  renderIn();
}
function closeFolder() {
  opened = null;
  pilih = false;
  selected = [];
  const center = document.querySelector(".center");
  if (center) center.style.display = "flex";
  const inside = document.getElementById("inside");
  if (inside) inside.style.display = "none";
  render();
  bar();
}
function renderIn() {
  const f = folders.find((x) => x.id === opened);
  if (!f) return;
  document.getElementById("backBtn").textContent = "← " + f.name;
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  if (!f.photos.length) {
    grid.innerHTML =
      '<p style="color:#fff;text-align:center;grid-column:1/3;margin-top:30px">Belum ada foto</p>';
    return;
  }
  f.photos.forEach((p) => {
    const d = document.createElement("div");
    d.className = "foto" + (selected.includes(p.id) && pilih ? " sel" : "");
    d.innerHTML = `<img src="${p.url || p.data}">${pilih ? `<div class="badge">${selected.includes(p.id) ? "✓" : "○"}</div>` : ""}`;
    d.onclick = () => {
      if (!pilih) return;
      toggleSel(p.id, true);
    };
    grid.appendChild(d);
  });
}
function toggleMenu(e) {
  e.stopPropagation();
  document.getElementById("menu").classList.toggle("show");
}
window.addEventListener("click", () =>
  document.getElementById("menu")?.classList.remove("show"),
);
function modePilih() {
  pilih = !pilih;
  selected = [];
  document.getElementById("menu").classList.remove("show");
  renderIn();
  bar();
}
function pilihSemua() {
  const f = folders.find((x) => x.id === opened);
  const ids = f.photos.map((p) => p.id);
  selected = selected.length < ids.length ? ids : [];
  renderIn();
  bar();
  document.getElementById("menu").classList.remove("show");
}
function tambahFoto() {
  document.getElementById("menu").classList.remove("show");
  document.getElementById("fileInput").click();
}
async function upload(e) {
  const fd = new FormData();
  for (let file of e.target.files) fd.append("photos", file);
  const res = await fetch("/api/upload/" + opened, {
    method: "POST",
    body: fd,
  });
  const updated = await res.json();
  folders = folders.map((f) => (f.id === opened ? updated : f));
  renderIn();
}
async function tambahFolder() {
  const n = prompt("Nama folder:");
  if (!n) return;
  const res = await fetch("/api/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: n }),
  });
  const nf = await res.json();
  folders.push(nf);
  render();
}
function tambahFolderDalam() {
  const n = prompt("Nama folder baru:");
  if (!n) return;
  fetch("/api/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: n, parentId: opened }),
  })
    .then((r) => r.json())
    .then((nf) => {
      folders.push(nf);
      alert("Folder dibuat di halaman utama");
    });
  document.getElementById("menu").classList.remove("show");
}
async function hapusFolder() {
  if (!confirm("Hapus folder ini?")) return;
  await fetch("/api/folders/" + opened, { method: "DELETE" });
  folders = folders.filter((x) => x.id !== opened && x.parentId !== opened);
  closeFolder();
}
function toggleSel(id, isFoto) {
  if (selected.includes(id)) selected = selected.filter((x) => x !== id);
  else selected.push(id);
  if (isFoto) renderIn();
  else render();
  bar();
}
function bar() {
  const b = document.getElementById("bar");
  if (!b) return;
  if (!pilih || selected.length === 0) b.style.display = "none";
  else {
    b.style.display = "flex";
    document.getElementById("count").textContent = selected.length + " dipilih";
  }
}
async function hapusTerpilih() {
  if (!confirm("Hapus " + selected.length + "?")) return;
  if (opened) {
    await fetch("/api/folders/" + opened + "/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    folders.find((x) => x.id === opened).photos = folders
      .find((x) => x.id === opened)
      .photos.filter((p) => !selected.includes(p.id));
  } else {
    for (let id of selected)
      await fetch("/api/folders/" + id, { method: "DELETE" });
    folders = folders.filter((f) => !selected.includes(f.id));
  }
  selected = [];
  pilih = false;
  if (opened) renderIn();
  else render();
  bar();
}
function logout() {
  localStorage.removeItem("isLoggedIn");
  location.href = "login.html";
}
load();
