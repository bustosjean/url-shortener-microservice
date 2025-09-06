require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const { URL } = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de datos en memoria
let urlDB = [];
let counter = 1;

// Rutas
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// POST para acortar la URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Validar que comience con http:// o https://
  if (!/^https?:\/\/.+/.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  // Verificar que el dominio exista
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const short_url = counter++;
    urlDB.push({ original_url: originalUrl, short_url });

    // Respuesta EXACTA como espera freeCodeCamp
    res.json({ original_url: originalUrl, short_url });
  });
});

// GET para redirigir
app.get("/api/shorturl/:short_url", (req, res) => {
  const { short_url } = req.params;
  const entry = urlDB.find((item) => item.short_url == short_url);

  if (entry) {
    return res.redirect(entry.original_url); // Redirección real
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
