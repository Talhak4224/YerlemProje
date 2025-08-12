import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function generateStudentId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function AddStudent() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        ad: "",
        soyad: "",
        konum: "",
        telefon: "",
        tc: "",
        okulAdi: "",
        servisAdi: "",
        veli: "",
        ogrenciId: generateStudentId(),
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [servisler, setServisler] = useState([]);
    const [servisAra, setServisAra] = useState("");

    useEffect(() => {
        fetch("http://localhost:5015/api/servisler")
            .then(res => res.json())
            .then(data => setServisler(data))
            .catch(() => setError("Servisler yüklenemedi"));
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (
            !form.ad || !form.soyad || !form.konum || !form.telefon || !form.tc ||
            !form.okulAdi || !form.servisAdi || !form.veli
        ) {
            setError("Lütfen tüm alanları doldurun");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.username) {
            setError("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5015/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    addedBy: user.username,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Hata oluştu");
                setLoading(false);
                return;
            }

            setTimeout(() => {
                navigate("/home/assignments");
            }, 1500);
        } catch (err) {
            console.error(err);
            setError("Sunucuya bağlanılamadı");
            setLoading(false);
        }
    };

    const filtrelenmisServisler = servisler.filter(s =>
        s.toLowerCase().includes(servisAra.toLowerCase())
    );


    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-10 mt-12 font-sans">
            <h2 className="text-3xl font-extrabold mb-10 text-center text-gray-900 tracking-wide">
                Öğrenci Düzenleme
            </h2>

            {error && (
                <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-xl mx-auto">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto" noValidate>
                {["ad", "soyad", "konum", "telefon", "tc", "veli"].map((name) => (
                    <div key={name} className="flex flex-col">
                        <label htmlFor={name} className="mb-2 text-gray-700 font-medium select-none">
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


                <div className="col-span-full mt-6">
                    <label className="mb-2 text-gray-700 font-medium select-none">Okul Seç</label>
                    <select
                        name="okulAdi"
                        value={form.okulAdi}
                        onChange={handleChange}
                        disabled={loading}
                        className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-600 transition"
                    >
                        <option value="">Okul seçin</option>

                        <option value="SELÇUKLU SPOR OKULLARI">SELÇUKLU SPOR OKULLARI</option>
                        <option value="İLİM YAYMA OKULU">İLİM YAYMA OKULU</option>
                    </select>
                </div>


                <div className="col-span-full mt-6">
                    <label className="mb-2 text-gray-700 font-medium select-none">Servis Seç</label>
                    <input
                        type="text"
                        placeholder="Servis ara..."
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-3"
                        value={servisAra}
                        onChange={(e) => setServisAra(e.target.value)}
                        disabled={loading}
                    />
                    <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2 bg-gray-50">
                        {filtrelenmisServisler.length > 0 ? (
                            filtrelenmisServisler.map((servis, index) => (
                                <div
                                    key={index}
                                    onClick={() => setForm(prev => ({ ...prev, servisAdi: servis }))}
                                    className={`px-4 py-2 rounded cursor-pointer select-none transition ${form.servisAdi === servis
                                        ? "bg-indigo-600 text-white font-semibold"
                                        : "hover:bg-indigo-100 text-gray-800"
                                        }`}
                                >
                                    {servis}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-center py-2">Servis bulunamadı.</div>
                        )}
                    </div>
                    <div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '18px' }}>
                            <div className="topping">
                                <input type="checkbox" id="sabah" name="topping" value="sabah" />
                                <label htmlFor="sabah" style={{ marginLeft: '6px' }}>Sabah</label>
                            </div>
                            <div className="topping">
                                <input type="checkbox" id="aksam" name="topping" value="aksam" />
                                <label htmlFor="aksam" style={{ marginLeft: '6px' }}>Akşam</label>
                            </div>
                        </div>

                    </div>
                    <div>


                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="col-span-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? <span>Kaydediliyor...</span> : "Öğrenci Ekle"}
                </button>
            </form >
        </div >
    );
}
