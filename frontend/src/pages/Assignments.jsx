import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function generateRandomOgrenciId() {
  return Math.floor(0 + Math.random() * 10000).toString();
}

function matchesWithSpecialYFilter(dataStr, filterStr) {
  if (!filterStr) return true;
  for (let i = 0; i <= dataStr.length - filterStr.length; i++) {
    let match = true;
    for (let j = 0; j < filterStr.length; j++) {
      const filterChar = filterStr[j];
      const dataChar = dataStr[i + j];
      if (filterChar === "") {
        if (dataChar !== "") {
          match = false;
          break;
        }
      } else {
        if (filterChar !== dataChar) {
          match = false;
          break;
        }
      }
    }
    if (match) return true;
  }
  return false;
}

export default function Assignments() {
  const [students, setStudents] = useState([]);
  const [okullar, setOkullar] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const [filterAd, setFilterAd] = useState("");
  const [filterSoyad, setFilterSoyad] = useState("");
  const [filterOkul, setFilterOkul] = useState("");
  const [filterOgrenciId, setFilterOgrenciId] = useState("");
  const [filterVeli, setFilterVeli] = useState("");
  const [filterGuzergah, setFilterGuzergah] = useState("");

  useEffect(() => {
    fetch("http://localhost:5015/api/okullar")
      .then((res) => res.json())
      .then((data) => setOkullar(data))
      .catch(() => setError("Okullar yüklenemedi"));
  }, []);

  useEffect(() => {
    if (okullar.length === 0) return;

    setLoading(true);
    fetch("http://localhost:5015/api/students")
      .then((res) => res.json())
      .then((data) => {
        const withOkulAd = data.map((s) => {
          const okul = okullar.find((o) => o.id.toString() === s.okulId?.toString());
          return {
            ...s,
            ogrenciId: s.ogrenciId || generateRandomOgrenciId(),
            okulAdi: okul ? okul.ad : "Okul Bilgisi Yok",
            veli: s.veli || "Veli Bilgisi Yok",
            guzergah: s.guzergah || "Güzergah Yok",
            servisAdi: s.servisAdi || "Servis Yok",
            servisSaati: s.servisSaati || "",
          };
        });
        setStudents(withOkulAd);
        setLoading(false);
      })
      .catch(() => {
        setError("Öğrenciler yüklenemedi");
        setLoading(false);
      });
  }, [okullar]);

  const filteredStudents = students.filter((s) => {
    const matchesAd = matchesWithSpecialYFilter(s.ad || "", filterAd);
    const matchesSoyad = matchesWithSpecialYFilter(s.soyad || "", filterSoyad);
    const matchesOkul = matchesWithSpecialYFilter(s.okulAdi || "", filterOkul);
    const matchesOgrenciId = matchesWithSpecialYFilter(s.ogrenciId || "", filterOgrenciId);
    const matchesVeli = matchesWithSpecialYFilter(s.veli || "", filterVeli);

    const guzergahServisSaat = `[${s.guzergah} - ${s.servisAdi} ${s.servisSaati}]`;
    const matchesGuzergah = matchesWithSpecialYFilter(guzergahServisSaat, filterGuzergah);

    return matchesAd && matchesSoyad && matchesOkul && matchesOgrenciId && matchesVeli && matchesGuzergah;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const displayedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease forwards;
        }
        table {
          font-size: 0.85rem;
          table-layout: fixed;
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          vertical-align: middle;
        }
        .table-container {
          width: 100%;
          max-width: 1280px;
          overflow-x: hidden;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
        }
      `}</style>

      <div className="bg-gray-50 min-h-screen font-sans flex flex-col items-center py-6 px-4 md:px-12 lg:px-24">
        <div className="w-full max-w-[1280px] mb-6 flex justify-end">
          <button
            onClick={() => navigate("/home/addstudent")}
            className="bg-gray-400 text-gray-900 px-5 py-2 rounded-md shadow-sm hover:bg-gray-500 transition-transform transform hover:scale-105 active:scale-95 font-semibold tracking-wide flex items-center space-x-2 select-none"
            title="Yeni öğrenci ekle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-base">Öğrenci Ekle</span>
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr className="bg-gray-200 text-gray-800 uppercase font-semibold tracking-wide">
                {["Adı", "Soyadı", "Okul Adı", "Öğrenci ID", "Veli", "Güzergah", "İşlem"].map(
                  (header, idx) => (
                    <th key={idx} title={header}>
                      {header}
                    </th>
                  )
                )}
              </tr>
              <tr className="bg-gray-100 text-gray-600">
                {[filterAd, filterSoyad, filterOkul, filterOgrenciId, filterVeli, filterGuzergah].map(
                  (filterValue, idx) => (
                    <th key={idx}>
                      <input
                        className="w-full px-2 py-1 rounded-sm border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition"
                        placeholder="Ara..."
                        value={filterValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          switch (idx) {
                            case 0:
                              setFilterAd(val);
                              break;
                            case 1:
                              setFilterSoyad(val);
                              break;
                            case 2:
                              setFilterOkul(val);
                              break;
                            case 3:
                              setFilterOgrenciId(val);
                              break;
                            case 4:
                              setFilterVeli(val);
                              break;
                            case 5:
                              setFilterGuzergah(val);
                              break;
                            default:
                              break;
                          }
                          setCurrentPage(1);
                        }}
                      />
                    </th>
                  )
                )}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.length > 0 ? (
                displayedStudents.map((s, i) => (
                  <tr
                    key={s.ogrenciId}
                    className={`hover:shadow-lg hover:bg-gray-50 cursor-pointer animate-fadeInUp ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td title={s.ad}>{s.ad}</td>
                    <td title={s.soyad}>{s.soyad}</td>
                    <td title={s.okulAdi} className="font-mono text-gray-600">
                      {s.okulAdi}
                    </td>
                    <td title={s.ogrenciId} className="font-mono text-gray-700">
                      {s.ogrenciId}
                    </td>
                    <td title={s.veli}>{s.veli}</td>
                    <td title={`[${s.guzergah} - ${s.servisAdi} ${s.servisSaati}]`} className="text-center font-mono">
                      [{s.guzergah} - {s.servisAdi} {s.servisSaati}]
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => navigate(`/home/editstudent/${s.tc}`)}
                        className="inline-flex items-center justify-center px-5 py-2 bg-gray-400 text-gray-900 rounded-sm shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-transform transform hover:scale-105 active:scale-95 select-none"
                        title={`Düzenle ${s.ad} ${s.soyad}`}
                        aria-label={`Düzenle ${s.ad} ${s.soyad}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5h6M6 12l2 2m0 0l8-8 4 4-8 8-4-4z" />
                        </svg>
                        <span className="text-sm font-semibold">Düzenle</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="animate-fadeInUp">
                  <td colSpan="7" className="text-center py-16 text-gray-400 italic font-semibold">
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center mt-8 gap-4 select-none max-w-[1280px] w-full px-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-md font-semibold tracking-wide transition ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-gray-100 hover:bg-gray-700 transform hover:scale-105 active:scale-95"
              }`}
            >
              Önceki
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-6 py-2 rounded-md font-semibold tracking-wide transition ${
                    currentPage === page
                      ? "bg-gray-700 text-gray-100 shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-400 hover:text-gray-100"
                  }`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-6 py-2 rounded-md font-semibold tracking-wide transition ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-gray-100 hover:bg-gray-700 transform hover:scale-105 active:scale-95"
              }`}
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </>
  );
}
