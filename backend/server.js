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
const servislerPath = path.join(__dirname, "servisler.json");
const userLogsPath = path.join(__dirname, "userlogs.json");
const studentsPath = path.join(__dirname, "students.json");

// === LOGIN ENDPOINT ===
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
        return res.json({
            success: true,
            user: { username: "admin", role: "admin" }
        });
    }

    res.status(401).json({ success: false, message: "Geçersiz kullanıcı adı veya şifre" });
});

// === OKULLAR ENDPOINT ===
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

// === SERVİSLER ENDPOINT ===
app.get("/api/servisler", (req, res) => {
    try {
        const okulId = parseInt(req.query.okulId, 10);
        if (isNaN(okulId)) {
            return res.json([]);
        }

        if (!fs.existsSync(servislerPath)) {
            return res.json([]);
        }

        const data = fs.readFileSync(servislerPath, "utf-8");
        let servisler = [];
        try {
            servisler = JSON.parse(data);
        } catch (parseErr) {
            console.error("servisler.json parse hatası:", parseErr);
            return res.json([]);
        }

        const filteredServisler = servisler.filter(
            (s) => Number(s.okulId) === okulId
        );

        res.json(filteredServisler);
    } catch (err) {
        console.error("Servisler alınırken hata:", err);
        res.status(500).json({ success: false, message: "Servisler alınamadı" });
    }
});

// === STUDENTS ENDPOINT ===
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

// === STUDENT DETAIL ENDPOINT ===
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

// === UPDATE STUDENT ENDPOINT (PUT) ===
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

        // Güncelleme yapılıyor, TC değişmez
        students[index] = { ...students[index], ...updatedData, tc };

        fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2), "utf-8");

        res.json({ message: "Öğrenci başarıyla güncellendi" });
    } catch (err) {
        console.error("Öğrenci güncellenirken hata:", err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

// === USER LOGS ENDPOINT ===
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

app.listen(PORT, () => {
    console.log(`✅ Server çalışıyor: http://localhost:${PORT}`);
});

export default app;
