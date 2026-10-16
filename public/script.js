const folderList = document.getElementById("folderList");
const searchInput = document.getElementById("searchInput");
const btnTambah = document.getElementById("btnTambah");

// ambil folder dari browser, bukan dari server
let folders = JSON.parse(localStorage.getItem("myFolders") || "[]");

function save() {
  localStorage.setItem("myFolders", JSON.stringify(folders));
}

function render() {
  if (!folderList) return;
  folderList.innerHTML = "";
  const q = (searchInput?.value || "").toLowerCase();
  folders
    .filter((f) => f.name.toLowerCase().includes(q))
    .forEach((f) => {
      const div = document.createElement("div");
      div.className = "folder-card";
      div.innerHTML = `📁 ${f.name}`;
      div.onclick = () => {
        // masuk ke folder, simpan id folder aktif
        localStorage.setItem("activeFolder", f.id);
        window.location.href = `folder.html?id=${f.id}`;
      };
      folderList.appendChild(div);
    });
}

function tambahFolder() {
  const name = prompt("Nama folder baru:");
  if (!name) return;
  const f = { id: Date.now().toString(), name: name.trim() };
  folders.push(f);
  save();
  render();
}

// biar tombol + Tambah Folder jalan
if (btnTambah) btnTambah.addEventListener("click", tambahFolder);
window.tambahFolder = tambahFolder; // kalau di HTML pakai onclick

if (searchInput) searchInput.addEventListener("input", render);

// tampilkan pertama kali
render();
