const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
const { URL } = require("url");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Base route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Base de datos temporal (array)
const urlDB = [];
let counter = 1;

// POST /api/shorturl
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Validar formato: debe empezar con http:// o https://
  if (!/^https?:\/\/.+/.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  // Validar que el host existe usando DNS
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Guardar URL y asignar short_url
    const short_url = counter++;
    urlDB.push({ original_url: originalUrl, short_url });
    res.json({ original_url: originalUrl, short_url });
  });
});

// GET /api/shorturl/:short_url
app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = parseInt(req.params.short_url);
  const entry = urlDB.find((item) => item.short_url === short_url);

  if (entry) {
    return res.redirect(entry.original_url);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
