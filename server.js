const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

// === GANTI USER & PASS DISINI ===
const MY_USER = "aries";
const MY_PASS = "aries";

const uploadDir = "/tmp/uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/tmp/uploads", express.static(uploadDir));

// LOGIN API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === MY_USER && password === MY_PASS) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

let photos = [];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/upload", upload.single("photo"), (req, res) => {
  if (req.file) {
    photos.push({
      id: Date.now(),
      filename: req.file.filename,
      path: `/tmp/uploads/${req.file.filename}`,
    });
  }
  res.redirect("/");
});

app.get("/photos", (req, res) => {
  res.json(photos);
});

if (require.main === module) {
  app.listen(3000, () => console.log("jalan"));
}

module.exports = app;
