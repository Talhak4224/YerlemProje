import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function generateStudentId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function Spinner() {
    return (
        <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
        </svg>
    );
}

export default function AddStudent() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        ad: "",
        soyad: "",
        konum: "",
        telefon: "",
        okulId: "",
        servisId: "",
        servisAdi: "",
        plaka: "",
        surucu: "",
        sabah: false,
        aksam: false,
        ogrenciId: generateStudentId(),
    });

    const [okullar, setOkullar] = useState([]);
    const [servisler, setServisler] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [okulDropdownOpen, setOkulDropdownOpen] = useState(false);
    const [servisDropdownOpen, setServisDropdownOpen] = useState(false);

    const [okulSearch, setOkulSearch] = useState("");
    const [servisSearch, setServisSearch] = useState("");

    const okulRef = useRef(null);
    const servisRef = useRef(null);

    useEffect(() => {
        const fetchOkullar = async () => {
            try {
                const response = await fetch("http://localhost:5015/api/okullar");
                if (!response.ok) throw new Error(`HTTP hata: ${response.status}`);
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error("Beklenen veri dizisi değil");
                const formattedData = data.map(item => ({
                    id: item.id || item._id,
                    ad: item.ad || item.name || item.okulAdi,
                })).filter(item => item.id && item.ad);
                setOkullar(formattedData);
            } catch (error) {
                console.error("Okullar alınamadı:", error);
                setError("Okullar yüklenemedi. Sayfayı yenileyin veya sonra tekrar deneyin.");
                setOkullar([]);
            }
        };
        fetchOkullar();
    }, []);

    useEffect(() => {
        if (!form.okulId) {
            setServisler([]);
            setForm(prev => ({
                ...prev,
                servisId: "",
                servisAdi: "",
                plaka: "",
                surucu: "",
            }));
            return;
        }
        const fetchServisler = async () => {
            try {
                const response = await fetch(`http://localhost:5015/api/servisler?okulId=${form.okulId}`);
                if (!response.ok) throw new Error(`HTTP hata: ${response.status}`);
                const data = await response.json();
                const formattedData = data.map(item => ({
                    id: item.id || item._id,
                    servisAdi: item.servisAdi || item.adi || item.name,
                    plaka: item.plaka || item.plakaNo,
                    surucu: item.surucu || item.driver,
                })).filter(item => item.id && item.servisAdi);
                setServisler(formattedData);
            } catch (error) {
                console.error("Servisler alınamadı:", error);
                setError("Servisler yüklenemedi. Okul seçimini kontrol edin.");
                setServisler([]);
            }
        };
        fetchServisler();
    }, [form.okulId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (okulRef.current && !okulRef.current.contains(event.target)) {
                setOkulDropdownOpen(false);
                setOkulSearch("");
            }
            if (servisRef.current && !servisRef.current.contains(event.target)) {
                setServisDropdownOpen(false);
                setServisSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOkullar = okullar.filter((okul) =>
        okul.ad.toLowerCase().includes(okulSearch.toLowerCase())
    );

    const filteredServisler = servisler.filter(
        (servis) =>
            servis.servisAdi.toLowerCase().includes(servisSearch.toLowerCase()) ||
            servis.plaka.toLowerCase().includes(servisSearch.toLowerCase()) ||
            servis.surucu.toLowerCase().includes(servisSearch.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === "sabah" || name === "aksam") {
            setForm(prev => ({ ...prev, [name]: checked }));
        } else if (name === "konum") {
            const cleaned = value.replace(/[^0-9.,\- ]/g, "");
            setForm(prev => ({ ...prev, konum: cleaned }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleOkulSelect = (id) => {
        setForm(prev => ({
            ...prev,
            okulId: id,
            servisId: "",
            servisAdi: "",
            plaka: "",
            surucu: "",
        }));
        setOkulDropdownOpen(false);
        setOkulSearch("");
        setServisSearch("");
    };

    const handleServisSelect = (id) => {
        const secilen = servisler.find(s => s.id.toString() === id);
        if (secilen) {
            setForm(prev => ({
                ...prev,
                servisId: id,
                servisAdi: secilen.servisAdi,
                plaka: secilen.plaka,
                surucu: secilen.surucu,
            }));
        }
        setServisDropdownOpen(false);
        setServisSearch("");
    };

    const isValidKonum = (konum) =>
        /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(konum);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (
            !form.ad ||
            !form.soyad ||
            !form.konum ||
            !form.telefon ||
            !form.okulId ||
            !form.servisId
        ) {
            setError("Lütfen tüm alanları doldurun");
            return;
        }

        if (!isValidKonum(form.konum)) {
            setError("Konum geçerli formatta olmalıdır. Örnek: 37.866700, 32.510515");
            return;
        }
        if (!form.sabah && !form.aksam) {
            setError("Lütfen Sabah ve/veya Akşam servislerinden en az birini seçin");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.username) {
            setError("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
            return;
        }

        setLoading(true);

        try {
            // Mevcut öğrencileri çek
            const studentsRes = await fetch("http://localhost:5015/api/students");
            const studentsData = await studentsRes.json();
            // En yüksek id'yi bul
            const maxId = studentsData.length > 0
                ? Math.max(...studentsData.map(s => Number(s.id) || 0))
                : 0;
            const newId = (maxId + 1).toString();

            setTimeout(async () => {
                try {
                    const res = await fetch("http://localhost:5015/api/students", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...form,
                            id: newId, // yeni id burada ekleniyor
                            addedBy: user.username,
                        }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        setError(data.message || "Hata oluştu");
                        setLoading(false);
                        return;
                    }

                    setSuccess(true);
                    setLoading(false);

                    setTimeout(() => setSuccess(false), 3000);

                    setTimeout(() => {
                        navigate("/home");
                    }, 2000);

                    setForm({
                        ad: "",
                        soyad: "",
                        konum: "",
                        telefon: "",
                        okulId: "",
                        servisId: "",
                        servisAdi: "",
                        plaka: "",
                        surucu: "",
                        sabah: false,
                        aksam: false,
                        ogrenciId: generateStudentId(),
                    });
                } catch (err) {
                    setError("Sunucuya bağlanılamadı");
                    setLoading(false);
                }
            }, 1500);
        } catch (err) {
            setError("Sunucuya bağlanılamadı");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-10 mt-12 font-sans relative">
            {success && (
                <div className="absolute top-5 left-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg font-semibold z-50">
                    Öğrenci başarıyla eklendi!
                </div>
            )}

            <h2 className="text-3xl font-extrabold mb-10 text-center text-gray-900 tracking-wide">
                Öğrenci Ekle
            </h2>

            {error && (
                <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-xl mx-auto">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto"
                noValidate
            >
                {["ad", "soyad", "konum", "telefon"].map((name) => (
                    <div key={name} className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="mb-2 text-gray-700 font-medium select-none"
                        >
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                        </label>
                        <input
                            id={name}
                            name={name}
                            type="text"
                            placeholder={`${name.charAt(0).toUpperCase() + name.slice(1)} girin`}
                            value={form[name]}
                            onChange={handleChange}
                            disabled={loading}
                            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-600 transition"
                            autoComplete="off"
                        />
                    </div>
                ))}

                <div ref={okulRef} className="relative col-span-full mt-6">
                    <label
                        htmlFor="okulDropdown"
                        className="mb-2 text-gray-700 font-medium select-none cursor-pointer"
                        onClick={() => setOkulDropdownOpen((open) => !open)}
                    >
                        Okul Seç
                    </label>
                    <div
                        id="okulDropdown"
                        tabIndex={0}
                        className="border border-gray-300 rounded-lg px-4 py-3 cursor-pointer select-none"
                        onClick={() => setOkulDropdownOpen((open) => !open)}
                    >
                        {form.okulId
                            ? okullar.find((o) => o.id.toString() === form.okulId)?.ad
                            : "Okul seçin"}
                    </div>

                    {okulDropdownOpen && (
                        <div className="absolute z-50 bg-white border border-gray-300 rounded-lg w-full max-h-60 overflow-auto mt-1 shadow-lg">
                            <input
                                type="text"
                                placeholder="Okul ara..."
                                className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
                                value={okulSearch}
                                onChange={(e) => setOkulSearch(e.target.value)}
                                autoFocus
                            />
                            {filteredOkullar.length === 0 ? (
                                <div className="p-3 text-gray-500 select-none">
                                    {okulSearch ? "Aranan kriterde okul bulunamadı" : "Okul listesi boş"}
                                </div>
                            ) : (
                                filteredOkullar.map((okul) => (
                                    <div
                                        key={okul.id}
                                        className="px-4 py-2 hover:bg-indigo-600 hover:text-white cursor-pointer select-none"
                                        onClick={() => handleOkulSelect(okul.id.toString())}
                                    >
                                        {okul.ad}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div ref={servisRef} className="relative col-span-full mt-6">
                    <label
                        htmlFor="servisDropdown"
                        className="mb-2 text-gray-700 font-medium select-none cursor-pointer"
                        onClick={() => {
                            if (form.okulId) setServisDropdownOpen((open) => !open);
                        }}
                    >
                        Servis Seç
                    </label>
                    <div
                        id="servisDropdown"
                        tabIndex={0}
                        className={`border border-gray-300 rounded-lg px-4 py-3 cursor-pointer select-none ${!form.okulId ? "bg-gray-100 cursor-not-allowed" : ""
                            }`}
                        onClick={() => {
                            if (form.okulId) setServisDropdownOpen((open) => !open);
                        }}
                    >
                        {form.servisId
                            ? servisler.find((s) => s.id.toString() === form.servisId)?.servisAdi +
                            " - " +
                            servisler.find((s) => s.id.toString() === form.servisId)?.plaka
                            : form.okulId
                                ? "Servis seçin"
                                : "Önce okul seçin"}
                    </div>

                    {servisDropdownOpen && (
                        <div className="absolute z-50 bg-white border border-gray-300 rounded-lg w-full max-h-60 overflow-auto mt-1 shadow-lg">
                            <input
                                type="text"
                                placeholder="Servis ara (isim, plaka, sürücü)..."
                                className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
                                value={servisSearch}
                                onChange={(e) => setServisSearch(e.target.value)}
                                autoFocus
                                disabled={!form.okulId}
                            />
                            {!form.okulId && (
                                <div className="p-3 text-gray-500 select-none">Önce okul seçin</div>
                            )}
                            {form.okulId && filteredServisler.length === 0 && (
                                <div className="p-3 text-gray-500 select-none">Servis bulunamadı</div>
                            )}
                            {form.okulId &&
                                filteredServisler.map((servis) => (
                                    <div
                                        key={servis.id}
                                        className="px-4 py-2 hover:bg-indigo-600 hover:text-white cursor-pointer select-none"
                                        onClick={() => handleServisSelect(servis.id.toString())}
                                    >
                                        {servis.servisAdi} - {servis.plaka} - {servis.surucu}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="col-span-full mt-6 flex gap-6 text-lg font-semibold select-none">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="sabah"
                            checked={form.sabah}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        Sabah Servisi
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="aksam"
                            checked={form.aksam}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        Akşam Servisi
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="col-span-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Spinner />
                            <span> Kaydediliyor...</span>
                        </>
                    ) : (
                        "Öğrenci Ekle"
                    )}
                </button>
            </form>
        </div>
    );
}