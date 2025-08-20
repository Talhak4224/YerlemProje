import React, { useEffect, useState } from "react";

function parseAction(action) {
    if (!action) return "";
    const a = action.toLowerCase();
    if (a.includes("eklendi")) return "Eklendi";
    if (a.includes("düzenlendi")) return "Düzenlendi";
    if (a.includes("silindi")) return "Silindi";
    return "Bilinmiyor";
}

export default function UserReport() {
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
        .filter((log) => (filter === "Tümü" ? true : parseAction(log.action) === filter))
        .filter((log) =>
            (log.addedBy || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    function getStudentInfo(studentId) {
        if (!studentId) return {};
        const stu = students.find(
            s => String(s.id) === String(studentId) || String(s.ogrenciId) === String(studentId)
        );
        return stu || {};
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 font-sans text-xs">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
                Kullanıcı İşlem Raporları
            </h1>

            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Kullanıcı Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-indigo-500"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
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
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">İşlem Yapan Kullanıcı</th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">Tarih & Saat</th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">Adı</th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">Soyadı</th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">Öğrenci ID</th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">Seans</th> {/* Güncellendi */}
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap text-center">Sabah</th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap text-center">Akşam</th>
                                <th className="border border-indigo-500 px-2 py-1 whitespace-nowrap">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center p-3 text-gray-500 italic">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, idx) => {
                                    const dateStr = log.timestamp
                                        ? new Date(log.timestamp).toLocaleString("tr-TR", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })
                                        : "-";
                                    const stu = getStudentInfo(log.studentId);
                                    return (
                                        <tr key={idx} className="hover:bg-indigo-50 cursor-default">
                                            <td className="border px-2 py-1 whitespace-nowrap">{log.addedBy || log.username || "-"}</td>
                                            <td className="border px-2 py-1 whitespace-nowrap">{dateStr}</td>
                                            <td className="border px-2 py-1 whitespace-nowrap">{stu.ad || "-"}</td>
                                            <td className="border px-2 py-1 whitespace-nowrap">{stu.soyad || "-"}</td>
                                            <td className="border px-2 py-1 whitespace-nowrap">{stu.ogrenciId || log.studentId || "-"}</td>
                                            <td className="border px-2 py-1 whitespace-nowrap">{stu.servisAdi || log.servisAdi || "-"}</td>
                                            <td className="border px-2 py-1 text-center">{stu.sabah || log.sabah ? "✓" : ""}</td>
                                            <td className="border px-2 py-1 text-center">{stu.aksam || log.aksam ? "✓" : ""}</td>
                                            <td className="border px-2 py-1 whitespace-nowrap">{parseAction(log.action)}</td>
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
