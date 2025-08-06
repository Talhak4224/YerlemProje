import React, { useState, useEffect } from "react";

export default function UserReport() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetch("http://localhost:5015/api/userlogs")
            .then((res) => res.json())
            .then((data) => setLogs(data))
            .catch(() => setLogs([]));
    }, []);

    function parseLogAction(action) {
        let işlem = "";
        if (action.includes("eklendi")) işlem = "Ekledi";
        else if (action.includes("silindi")) işlem = "Sildi";
        else if (action.includes("güncellendi")) işlem = "Düzenledi";
        else işlem = "İşlem";

        const isimSoyadMatch = action.match(/Öğrenci (?:eklendi|silindi|güncellendi): ([^\(]+)/);
        const isimSoyad = isimSoyadMatch ? isimSoyadMatch[1].trim() : "";

        const tcMatch = action.match(/\(TC: ([^\)]+)\)/);
        const tc = tcMatch ? tcMatch[1] : "";

        return { işlem, isimSoyad, tc };
    }

    const filteredLogs = logs.filter((log) => {
        const { işlem, isimSoyad, tc } = parseLogAction(log.action);
        const searchLower = search.toLowerCase();

        return (
            log.username.toLowerCase().includes(searchLower) ||
            isimSoyad.toLowerCase().includes(searchLower) ||
            tc.toLowerCase().includes(searchLower) ||
            işlem.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const displayedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Kullanıcı Raporu</h2>

            <input
                type="text"
                placeholder="Ara (İsim, Soyad, TC, Kullanıcı)..."
                className="border p-2 rounded w-full mb-4"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                }}
            />

            {displayedLogs.length === 0 ? (
                <p className="text-center italic text-gray-600">Rapor bulunamadı.</p>
            ) : (
                <table className="w-full border-collapse border border-gray-300 rounded shadow">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="border border-gray-300 p-2">Kullanıcı</th>
                            <th className="border border-gray-300 p-2">İşlem</th>
                            <th className="border border-gray-300 p-2">Öğrenci Bilgisi</th>
                            <th className="border border-gray-300 p-2">Zaman</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedLogs.map((log, i) => {
                            const { işlem, isimSoyad, tc } = parseLogAction(log.action);
                            return (
                                <tr key={i} className="hover:bg-blue-100">
                                    <td className="border border-gray-300 p-2">{log.username}</td>
                                    <td className="border border-gray-300 p-2">{işlem}</td>
                                    <td className="border border-gray-300 p-2">
                                        {isimSoyad} (TC: {tc})
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2 select-none">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        Önceki
                    </button>

                    {[...Array(totalPages)].map((_, idx) => {
                        const page = idx + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded ${currentPage === page
                                        ? "bg-blue-900 text-white"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${currentPage === totalPages
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
}
