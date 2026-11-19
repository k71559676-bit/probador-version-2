require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten archivos de imagen."));
    }
    cb(null, true);
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.TRYON_API_URL && process.env.TRYON_API_KEY) });
});

app.post(
  "/api/try-on",
  upload.fields([
    { name: "person", maxCount: 1 },
    { name: "garment", maxCount: 1 }
  ]),
  async (req, res) => {
    const person = req.files?.person?.[0];
    const garment = req.files?.garment?.[0];

    if (!person || !garment) {
      return res.status(400).json({ error: "Debes proporcionar tu foto y seleccionar una imagen de prenda." });
    }

    if (!process.env.TRYON_API_URL || !process.env.TRYON_API_KEY) {
      return res.status(501).json({
        error: "El sitio está listo, pero falta conectar un proveedor de IA Virtual Try-On.",
        detail: "Configura TRYON_API_URL y TRYON_API_KEY en el archivo .env. El formato de envío debe adaptarse a la documentación del proveedor elegido."
      });
    }

    try {
      const form = new FormData();
      const personBuffer = fs.readFileSync(person.path);
      const garmentBuffer = fs.readFileSync(garment.path);

      form.append("person_image", new Blob([personBuffer], { type: person.mimetype }), person.originalname);
      form.append("garment_image", new Blob([garmentBuffer], { type: garment.mimetype }), garment.originalname);

      const response = await fetch(process.env.TRYON_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.TRYON_API_KEY}` },
        body: form
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return res.status(502).json({
          error: "El proveedor de IA rechazó la solicitud.",
          detail: data.error || data.message || `HTTP ${response.status}`
        });
      }

      const resultUrl = data.output_url || data.result_url || data.image_url;
      if (!resultUrl) {
        return res.status(502).json({
          error: "La respuesta del proveedor no contiene una URL de resultado.",
          detail: "Adapta server.js al formato de respuesta indicado por tu proveedor."
        });
      }

      res.json({ resultUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "No se pudo completar la prueba virtual." });
    } finally {
      if (person?.path && fs.existsSync(person.path)) fs.unlinkSync(person.path);
      if (garment?.path && fs.existsSync(garment.path)) fs.unlinkSync(garment.path);
    }
  }
);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "La imagen supera el límite de 8 MB." });
  }
  if (err) return res.status(400).json({ error: err.message || "Error al subir la imagen." });
  next();
});

app.listen(PORT, () => {
  console.log(`VestiIA funcionando en http://localhost:${PORT}`);
});
