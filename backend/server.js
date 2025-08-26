import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5015;

app.use(cors());
app.use(express.json());

const okullarPath = path.join(__dirname, "okullar.json");
const userLogsPath = path.join(__dirname, "userlogs.json");
const studentsPath = path.join(__dirname, "students.json");
const sporOkuluServisPath = path.join(__dirname, "SporOkuluServis.json");
const IlimYaymaServisPath = path.join(__dirname, "IlimYaymaServis.json");

function addUserLog(logEntry) {
  try {
    let logs = [];
    if (fs.existsSync(userLogsPath)) {
      const data = fs.readFileSync(userLogsPath, "utf-8");
      logs = JSON.parse(data);
    }
    logs.push(logEntry);
    fs.writeFileSync(userLogsPath, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("Log eklenirken hata:", err);
  }
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const users = [
    { username: "admin", password: "1234", role: "admin" },
    { username: "cemal", password: "1453", role: "stajyer" },
    { username: "talha", password: "3322", role: "stajyer" }
  ];

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    return res.json({
      success: true,
      user: { username: user.username, role: user.role }
    });
  }

  res.status(401).json({ success: false, message: "Geçersiz kullanıcı adı veya şifre" });
});

app.get("/api/okullar", (req, res) => {
  try {
    if (!fs.existsSync(okullarPath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(okullarPath, "utf-8");
    let okullar = [];
    try {
      okullar = JSON.parse(data);
    } catch (parseErr) {
      console.error("okullar.json parse hatası:", parseErr);
      return res.json([]);
    }
    res.json(okullar);
  } catch (err) {
    console.error("Okullar alınırken hata:", err);
    res.status(500).json({ success: false, message: "Okullar alınamadı" });
  }
});

app.get("/api/servisler", (req, res) => {
  try {
    const okulId = parseInt(req.query.okulId, 10);
    if (isNaN(okulId)) {
      return res.json([]);
    }

    let servisler = [];
    if (fs.existsSync(sporOkuluServisPath)) {
      const data = fs.readFileSync(sporOkuluServisPath, "utf-8");
      servisler = servisler.concat(JSON.parse(data).filter(s => Number(s.okulId) === okulId));
    }
    if (okulId === 2 && fs.existsSync(IlimYaymaServisPath)) {
      const data = fs.readFileSync(IlimYaymaServisPath, "utf-8");
      servisler = servisler.concat(JSON.parse(data).filter(s => Number(s.okulId) === 2));
    }
    res.json(servisler);
  } catch (err) {
    console.error("Servisler alınırken hata:", err);
    res.status(500).json({ success: false, message: "Servisler alınamadı" });
  }
});

app.get("/api/students", (req, res) => {
  try {
    if (!fs.existsSync(studentsPath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(studentsPath, "utf-8");
    let students = [];
    try {
      students = JSON.parse(data);
    } catch (parseErr) {
      console.error("students.json parse hatası:", parseErr);
      return res.json([]);
    }
    res.json(students);
  } catch (err) {
    console.error("Öğrenciler alınırken hata:", err);
    res.status(500).json({ success: false, message: "Öğrenciler alınamadı" });
  }
});

app.get("/api/students/:tc", (req, res) => {
  try {
    if (!fs.existsSync(studentsPath)) {
      return res.status(404).json({ message: "Öğrenci verisi bulunamadı" });
    }
    const data = fs.readFileSync(studentsPath, "utf-8");
    const students = JSON.parse(data);
    const student = students.find(s => s.tc === req.params.tc);
    if (!student) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }
    res.json(student);
  } catch (err) {
    console.error("Öğrenci detayı alınırken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.post("/api/students", (req, res) => {
  const newStudent = req.body;

  try {
    let students = [];
    if (fs.existsSync(studentsPath)) {
      const data = fs.readFileSync(studentsPath, "utf-8");
      students = JSON.parse(data);
    }

    if (students.find((s) => s.id === newStudent.id || s.ogrenciId === newStudent.ogrenciId)) {
      return res.status(400).json({ message: "Bu öğrenci ID ile kayıt zaten var" });
    }

    students.push(newStudent);
    fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2), "utf-8");

    addUserLog({
      username: newStudent.addedBy || newStudent.username || "bilinmiyor",
      addedBy: newStudent.addedBy || newStudent.username || "bilinmiyor",
      action: "Yeni öğrenci eklendi",
      actionType: "Eklendi",
      studentId: newStudent.id || newStudent.ogrenciId,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ message: "Öğrenci başarıyla eklendi" });
  } catch (err) {
    console.error("Öğrenci eklenirken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.put("/api/students/:tc", (req, res) => {
  const tc = req.params.tc;
  const updatedData = req.body;

  try {
    if (!fs.existsSync(studentsPath)) {
      return res.status(404).json({ message: "Öğrenci verisi bulunamadı" });
    }

    const data = fs.readFileSync(studentsPath, "utf-8");
    let students = JSON.parse(data);

    const index = students.findIndex((s) => s.tc === tc);

    if (index === -1) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }

    students[index] = { ...students[index], ...updatedData, tc };

    fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2), "utf-8");

    addUserLog({
      username: updatedData.addedBy || updatedData.username || "bilinmiyor",
      addedBy: updatedData.addedBy || updatedData.username || "bilinmiyor",
      action: "Öğrenci bilgisi güncellendi",
      actionType: "Düzenlendi",
      studentTc: tc,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: "Öğrenci başarıyla güncellendi" });
  } catch (err) {
    console.error("Öğrenci güncellenirken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.get("/api/studentbyid/:id", (req, res) => {
  try {
    if (!fs.existsSync(studentsPath)) {
      return res.status(404).json({ message: "Öğrenci verisi bulunamadı" });
    }
    const data = fs.readFileSync(studentsPath, "utf-8");
    const students = JSON.parse(data);
    const student = students.find(
      s => String(s.id) === req.params.id || String(s.ogrenciId) === req.params.id
    );
    if (!student) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }
    res.json(student);
  } catch (err) {
    console.error("Öğrenci detayı alınırken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.put("/api/studentbyid/:id", (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  try {
    if (!fs.existsSync(studentsPath)) {
      return res.status(404).json({ message: "Öğrenci verisi bulunamadı" });
    }

    const data = fs.readFileSync(studentsPath, "utf-8");
    let students = JSON.parse(data);

    const index = students.findIndex(
      (s) => String(s.id) === id || String(s.ogrenciId) === id
    );

    if (index === -1) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }

    students[index] = { ...students[index], ...updatedData, id: students[index].id };

    fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2), "utf-8");

    addUserLog({
      username: updatedData.addedBy || updatedData.username || req.body.username || req.body.addedBy || "bilinmiyor",
      addedBy: updatedData.addedBy || updatedData.username || req.body.username || req.body.addedBy || "bilinmiyor",
      action: "Öğrenci bilgisi güncellendi (id ile)",
      actionType: "Düzenlendi",
      studentId: id,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: "Öğrenci başarıyla güncellendi" });
  } catch (err) {
    console.error("Öğrenci güncellenirken hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.get("/api/logs", (req, res) => {
  try {
    if (!fs.existsSync(userLogsPath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(userLogsPath, "utf-8");
    let logs = [];
    try {
      logs = JSON.parse(data);
    } catch (e) {
      console.error("userlogs.json parse hatası:", e);
      return res.json([]);
    }
    res.json(logs);
  } catch (err) {
    console.error("Loglar alınırken hata:", err);
    res.status(500).json({ success: false, message: "Loglar alınamadı" });
  }
});

app.get("/api/sporokulu-servisler", (req, res) => {
  try {
    if (!fs.existsSync(sporOkuluServisPath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(sporOkuluServisPath, "utf-8");
    let servisler = [];
    try {
      servisler = JSON.parse(data);
    } catch (parseErr) {
      console.error("SporOkuluServis.json parse hatası:", parseErr);
      return res.json([]);
    }
    const filtered = servisler.filter(s => Number(s.okulId) === 1);
    res.json(filtered);
  } catch (err) {
    console.error("Spor Okulu servisleri alınırken hata:", err);
    res.status(500).json({ success: false, message: "Spor Okulu servisleri alınamadı" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server çalışıyor: http://localhost:${PORT}`);
});

export default app;
