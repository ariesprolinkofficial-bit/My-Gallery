const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

// Vercel cuma boleh tulis di /tmp
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

// Simpan data di memory (karena Vercel gak boleh tulis database.json permanen)
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
// untuk lokal
if (require.main === module) {
  app.listen(3000, () => console.log("jalan di 3000"));
}
// untuk Vercel
module.exports = app;
