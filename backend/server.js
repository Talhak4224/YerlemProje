import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 5015;

app.use(cors());
app.use(express.json());

const studentsPath = path.join(process.cwd(), "students.json");
const userLogsPath = path.join(process.cwd(), "userlogs.json");


if (!fs.existsSync(studentsPath)) fs.writeFileSync(studentsPath, "[]");
if (!fs.existsSync(userLogsPath)) fs.writeFileSync(userLogsPath, "[]");

const users = [
    { username: "Cemal", password: "1453", role: "admin" },
    { username: "Admin", password: "1234", role: "admin" },
    { username: "Emir", password: "4242", role: "user" },
];


app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true, user: { username: user.username, role: user.role } });
    return res.status(401).json({ success: false, message: "Geçersiz kullanıcı adı veya şifre" });
});


app.get("/api/students", (req, res) => {
    const students = JSON.parse(fs.readFileSync(studentsPath, "utf-8"));
    res.json(students);
});

app.post("/api/students", (req, res) => {
    const newStudent = req.body;
    const students = JSON.parse(fs.readFileSync(studentsPath, "utf-8"));
    if (students.some(s => s.tc === newStudent.tc)) {
        return res.status(400).json({ success: false, message: "Bu TC zaten kayıtlı" });
    }
    students.push(newStudent);
    fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2));

    const log = {
        username: newStudent.addedBy || "Bilinmeyen",
        action: `Öğrenci eklendi: ${newStudent.ad} ${newStudent.soyad} (TC: ${newStudent.tc})`,
        timestamp: new Date().toISOString(),
    };
    const logs = JSON.parse(fs.readFileSync(userLogsPath, "utf-8"));
    logs.push(log);
    fs.writeFileSync(userLogsPath, JSON.stringify(logs, null, 2));

    res.json({ success: true, message: "Öğrenci başarıyla eklendi" });
});


app.delete("/api/students/:tc", (req, res) => {
    const tc = req.params.tc;
    const deletedBy = req.body.deletedBy || "Bilinmeyen";
    const students = JSON.parse(fs.readFileSync(studentsPath, "utf-8"));
    const idx = students.findIndex(s => s.tc === tc);
    if (idx === -1) return res.status(404).json({ success: false, message: "Öğrenci bulunamadı" });
    const [deletedStudent] = students.splice(idx, 1);
    fs.writeFileSync(studentsPath, JSON.stringify(students, null, 2));

    const log = {
        username: deletedBy,
        action: `Öğrenci silindi: ${deletedStudent.ad} ${deletedStudent.soyad} (TC: ${deletedStudent.tc})`,
        timestamp: new Date().toISOString(),
    };
    const logs = JSON.parse(fs.readFileSync(userLogsPath, "utf-8"));
    logs.push(log);
    fs.writeFileSync(userLogsPath, JSON.stringify(logs, null, 2));

    res.json({ success: true, message: "Öğrenci başarıyla silindi" });
});

app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
