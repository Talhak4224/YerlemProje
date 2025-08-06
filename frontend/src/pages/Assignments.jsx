import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Assignments() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    async function fetchStudents() {
        try {
            const res = await fetch("http://localhost:5015/api/students");
            const data = await res.json();
            setStudents(data);
        } catch (error) {
            console.error("Öğrenci verisi alınamadı", error);
        }
    }


    const filteredStudents = students
        .filter(
            (s) =>
                !(
                    s.ad.toLowerCase() === "adı" &&
                    s.soyad.toLowerCase() === "soyadı" &&
                    s.konum.toLowerCase() === "konum" &&
                    s.telefon.toLowerCase() === "telefon" &&
                    s.tc.toLowerCase().includes("tc")
                )
        )
        .filter(
            (s) =>
                s.ad.toLowerCase().includes(search.toLowerCase()) ||
                s.soyad.toLowerCase().includes(search.toLowerCase()) ||
                s.tc.includes(search)
        );

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const displayedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div>

            <div className="flex justify-between mb-6 items-center">
                <input
                    type="text"
                    placeholder="Ara..."
                    className="border p-2 rounded w-1/3"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <button
                    onClick={() => navigate("/home/addstudent")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Öğrenci Ekle
                </button>
            </div>


            <table className="w-full border-collapse border border-gray-300 rounded shadow">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="border border-gray-300 p-2">Adı</th>
                        <th className="border border-gray-300 p-2">Soyadı</th>
                        <th className="border border-gray-300 p-2">Konum</th>
                        <th className="border border-gray-300 p-2">Telefon</th>
                        <th className="border border-gray-300 p-2">TC</th>
                        <th className="border border-gray-300 p-2">İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedStudents.length > 0 ? (
                        displayedStudents.map((student) => (
                            <tr key={student.tc} className="hover:bg-blue-100">
                                <td className="border border-gray-300 p-2">{student.ad}</td>
                                <td className="border border-gray-300 p-2">{student.soyad}</td>
                                <td className="border border-gray-300 p-2">{student.konum}</td>
                                <td className="border border-gray-300 p-2">{student.telefon}</td>
                                <td className="border border-gray-300 p-2">{student.tc}</td>
                                <td className="border border-gray-300 p-2 flex gap-2 justify-center">
                                    <button
                                        onClick={() => navigate(`/home/editstudent/${student.tc}`)}
                                        className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                                        title="Düzenle"
                                    >
                                        📝
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (
                                                window.confirm(
                                                    `${student.ad} ${student.soyad} silinsin mi?`
                                                )
                                            ) {
                                                await fetch(
                                                    `http://localhost:5015/api/students/${student.tc}`,
                                                    {
                                                        method: "DELETE",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            deletedBy: JSON.parse(localStorage.getItem("user"))
                                                                .username,
                                                        }),
                                                    }
                                                );
                                                fetchStudents();
                                            }
                                        }}
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                        title="Sil"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center p-4 italic text-gray-600">
                                Kayıt bulunamadı
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>


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
