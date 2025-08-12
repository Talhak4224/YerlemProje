import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const studentsRes = await fetch("http://localhost:5015/api/noktalama.json", {
                    headers: { "Content-Type": "application/json" },
                });
                if (!studentsRes.ok) throw new Error("Öğrenciler yüklenemedi");
                const studentsData = await studentsRes.json();
                setStudents(studentsData);
                setFilteredStudents(studentsData);
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);


    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredStudents(students);
        } else {
            const lowercasedQuery = query.toLowerCase();
            const filtered = students.filter((student) => {
                return (
                    student.addedBy.toLowerCase().includes(lowercasedQuery) ||
                    student.ad.toLowerCase().includes(lowercasedQuery) ||
                    student.soyad.toLowerCase().includes(lowercasedQuery) ||
                    student.tc.toLowerCase().includes(lowercasedQuery) ||
                    student.okulAdi.toLowerCase().includes(lowercasedQuery) ||
                    student.ogrenciId.toLowerCase().includes(lowercasedQuery) ||
                    student.veli.toLowerCase().includes(lowercasedQuery) ||
                    student.guzergah.toLowerCase().includes(lowercasedQuery)
                );
            });
            setFilteredStudents(filtered);
        }
    };


    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const displayedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <main className="bg-gray-100 min-h-screen p-8 font-sans">
            <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-900">
                Öğrenci Yönetimi
            </h1>


            <div className="max-w-md mx-auto mb-6">
                <input
                    type="text"
                    placeholder="Arama yap..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <section className="max-w-full mx-auto bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 border-b border-gray-300 pb-2">
                    Öğrenci Listesi
                </h2>

                <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
                    <table className="min-w-full table-fixed border-collapse">
                        <thead className="bg-indigo-600 text-white uppercase text-sm font-semibold tracking-wide">
                            <tr>

                                <th className="p-4 border border-indigo-500 rounded-tl-lg">İşlem Yapan Kullanıcı</th>
                                <th className="p-4 border border-indigo-500">Adı</th>
                                <th className="p-4 border border-indigo-500">Soyadı</th>
                                <th className="p-4 border border-indigo-500">TC</th>
                                <th className="p-4 border border-indigo-500">Okul Adı</th>
                                <th className="p-4 border border-indigo-500">Öğrenci ID</th>
                                <th className="p-4 border border-indigo-500">Veli</th>
                                <th className="p-4 border border-indigo-500">Güzergah</th>
                                <th className="p-4 border border-indigo-500 rounded-tr-lg text-center">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center p-8 text-gray-500 italic font-semibold bg-gray-50">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                displayedStudents.map((s) => (
                                    <tr
                                        key={s.tc}
                                        className="border border-gray-300 hover:shadow-lg hover:bg-indigo-50 cursor-pointer"
                                    >

                                        <td className="p-4 border border-indigo-500">{s.addedBy || 'Bilinmeyen'}</td>
                                        <td className="p-4 border border-indigo-500 font-semibold">{s.ad}</td>
                                        <td className="p-4 border border-indigo-500">{s.soyad}</td>
                                        <td className="p-4 border border-indigo-500">{s.tc}</td>
                                        <td className="p-4 border border-indigo-500 font-mono">{s.okulAdi}</td>
                                        <td className="p-4 border border-indigo-500 font-mono tracking-widest">{s.ogrenciId}</td>
                                        <td className="p-4 border border-indigo-500">{s.veli}</td>
                                        <td className="p-4 border border-indigo-500">{s.guzergah}</td>
                                        <td className="p-4 border border-indigo-500 text-center">

                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {totalPages > 1 && (
                    <nav aria-label="Sayfa numaraları" className="flex justify-center gap-3 mt-8 select-none">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-1 rounded-md bg-indigo-300 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Önceki
                        </button>
                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    aria-current={page === currentPage ? "page" : undefined}
                                    className={`px-4 py-1 rounded-md ${page === currentPage
                                        ? "bg-indigo-800 text-white font-bold shadow"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-1 rounded-md bg-indigo-300 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sonraki
                        </button>
                    </nav>
                )}
            </section>
        </main>
    );
}
