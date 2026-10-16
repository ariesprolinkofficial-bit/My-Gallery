const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { folders: [] };
  }
};
const saveData = (d) => fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));

// ROOT -> LOGIN
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html")),
);

// API LOGIN - online
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  // bisa login pakai admin/admin , aries/aries , alias/alias
  if (username && password) {
    return res.json({ success: true, username });
  }
  res.status(401).json({ success: false });
});

// API FOLDERS
app.get("/api/folders", (req, res) => {
  res.json(readData().folders);
});

app.post("/api/folders", (req, res) => {
  const data = readData();
  const newFolder = {
    id: Date.now().toString(),
    name: req.body.name,
    parentId: req.body.parentId || null,
    photos: [],
  };
  data.folders.push(newFolder);
  saveData(data);
  res.json(newFolder);
});

app.delete("/api/folders/:id", (req, res) => {
  let data = readData();
  data.folders = data.folders.filter(
    (f) => f.id !== req.params.id && f.parentId !== req.params.id,
  );
  saveData(data);
  res.json({ success: true });
});

// UPLOAD - fix online
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "")),
});
const upload = multer({ storage });

app.post("/api/upload/:id", upload.array("photos", 20), (req, res) => {
  const data = readData();
  const folder = data.folders.find((f) => f.id === req.params.id);
  if (!folder) return res.status(404).json({ error: "Folder not found" });
  req.files.forEach((file) => {
    folder.photos.push({
      id: Date.now() + Math.random().toString(),
      url: "/uploads/" + file.filename,
    });
  });
  saveData(data);
  res.json(folder);
});

app.delete("/api/folders/:id/photos", (req, res) => {
  const data = readData();
  const folder = data.folders.find((f) => f.id === req.params.id);
  if (!folder) return res.status(404).json({ error: "Not found" });
  folder.photos = folder.photos.filter((p) => !req.body.ids.includes(p.id));
  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server Online di port ${PORT}`));
