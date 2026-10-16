const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const MY_USER = "aries";
const MY_PASS = "aries";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === MY_USER && password === MY_PASS) res.json({ success: true });
  else res.json({ success: false });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

module.exports = app;
if (require.main === module) app.listen(3000, () => console.log("jalan"));
