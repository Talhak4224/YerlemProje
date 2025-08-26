

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";

function parseAction(action) {
    if (!action) return "";
    const a = action.toLowerCase();
    if (a.includes("eklendi")) return "Eklendi";
    if (a.includes("düzenlendi") || a.includes("güncellendi")) return "Düzenlendi";
    if (a.includes("silindi")) return "Silindi";
    return "";
}


export default function UserReport() {
    const navigate = useNavigate();
    useEffect(() => {
        if (!sessionStorage.getItem("allowedNavigation")) {
            if (window.location.pathname !== "/home/userreport") {
                window.history.replaceState(null, "", "/home/userreport");
            }
            return;
        }
        sessionStorage.removeItem("allowedNavigation");
    }, [navigate]);
    const { darkMode } = useTheme();
    const [logs, setLogs] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
        const [filter, setFilter] = useState("Tümü");

    useEffect(() => {
        fetch("http://localhost:5015/api/logs")
            .then((res) => res.json())
            .then((data) => setLogs(data))
            .catch((e) => console.error(e));

        fetch("http://localhost:5015/api/students")
            .then((res) => res.json())
            .then((data) => setStudents(data))
            .catch((e) => console.error(e));
    }, []);

    const filteredLogs = logs
            .filter((log) =>
                filter === "Tümü" ? true : parseAction(log.action) === filter
        )
        .filter((log) =>
            (log.addedBy || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    function getStudentInfo(studentId) {
        if (!studentId) return {};
        const stu = students.find(
            (s) =>
                String(s.id) === String(studentId) ||
                String(s.ogrenciId) === String(studentId)
        );
        return stu || {};
    }

    return (
        <main className={`min-h-screen p-6 font-sans text-xs transition-colors duration-500 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"}`}>
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
                Kullanıcı İşlem Raporları
            </h1>

            <div className={`max-w-7xl mx-auto rounded-lg shadow p-4 transition-colors duration-500 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Kullanıcı Ara..."
                        value={searchTerm}
                                                onChange={(e) => {
                                                    const val = e.target.value.trimStart();
                                                    if (val === "" || val.replace(/\s/g, "") !== "") {
                                                        setSearchTerm(val);
                                                    }
                                                }}
                        className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-indigo-500 text-black font-normal"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={`border border-gray-300 rounded px-3 py-2 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
                    >
                            <option value="Tümü">Tümü</option>
                        <option value="Eklendi">Eklendi</option>
                        <option value="Düzenlendi">Düzenlendi</option>
                        <option value="Silindi">Silindi</option>
                    </select>
                </div>

                <div className="overflow-auto max-h-[600px]">
                    <table className="min-w-full table-auto border-collapse border border-gray-300 text-xs">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    İşlem Yapan Kullanıcı
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    Tarih & Saat
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    Adı
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    Soyadı
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    Öğrenci ID
                                </th>

                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    Okul
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    Seans
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap text-center">
                                    Sabah
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap text-center">
                                    Akşam
                                </th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">
                                    İşlem
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="10"
                                        className="text-center p-3 text-gray-500 italic"
                                    >
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, idx) => {
                                    const dateStr = log.timestamp
                                        ? new Date(log.timestamp).toLocaleString(
                                            "tr-TR",
                                            {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            }
                                        )
                                        : "-";
                                    const stu = getStudentInfo(log.studentId);

                                    return (
                                        <tr
                                            key={idx}
                                            className={`cursor-default transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'}`}
                                        >
                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {log.addedBy ||
                                                    log.username ||
                                                    "-"}
                                            </td>
                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {dateStr}
                                            </td>
                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {log.ad || stu.ad || "-"}
                                            </td>
                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {log.soyad || stu.soyad || "-"}
                                            </td>
                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {log.ogrenciId || log.studentId || stu.ogrenciId || stu.id || "-"}
                                            </td>

                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {log.okulAdi || stu.okulAdi || "-"}
                                            </td>
                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {log.servisAdi || stu.servisAdi || "-"}
                                            </td>
                                            <td className="border px-2 py-1 text-center">
                                                {log.sabah !== undefined ? (log.sabah ? "✓" : "") : (stu.sabah ? "✓" : "")}
                                            </td>
                                            <td className="border px-2 py-1 text-center">
                                                {log.aksam !== undefined ? (log.aksam ? "✓" : "") : (stu.aksam ? "✓" : "")}
                                            </td>
                                            <td className="border px-2 py-1 whitespace-nowrap">
                                                {parseAction(log.action)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
