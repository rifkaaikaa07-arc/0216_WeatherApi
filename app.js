require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
  const kota = req.query.kota || "Bandung City";
  const apiKey = process.env.MAPTILER_API_KEY;
  const baseUrl = process.env.MAPTILER_BASE_URL;

  const url = `${baseUrl}/${encodeURIComponent(kota)}.json?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const fitur = response.data.features[0];

    if (!fitur) {
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    }

    const bagian = {};
    [fitur, ...(fitur.context || [])].forEach((item) => {
      const jenis = String(item.id).split(".")[0];
      if (!bagian[jenis]) bagian[jenis] = item.text;
    });

    res.json({
      kota: fitur.text,
      negara: bagian.country || "-",
      provinsi: bagian.region || "-",
      kecamatan:
        bagian.municipality ||
        bagian.municipal_district ||
        bagian.county ||
        bagian.subregion ||
        "-",
      longitude: fitur.geometry.coordinates[0],
      latitude: fitur.geometry.coordinates[1],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Gagal mengambil data dari MapTiler" });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});