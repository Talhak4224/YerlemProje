import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditStudent() {
    const { tc } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        ad: "",
        soyad: "",
        konum: "",
        telefon: "",
        tc: "",
    });

    const [error, setError] = useState("");


    useEffect(() => {
        async function fetchStudent() {
            try {
                const res = await fetch(`http://localhost:5015/api/students/${tc}`);
                if (!res.ok) throw new Error("Öğrenci bulunamadı");
                const data = await res.json();
                setForm({
                    ad: data.ad,
                    soyad: data.soyad,
                    konum: data.konum,
                    telefon: data.telefon,
                    tc: data.tc,
                });
            } catch (err) {
                setError(err.message);
            }
        }
        fetchStudent();
    }, [tc]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!form.ad || !form.soyad || !form.konum || !form.telefon || !form.tc) {
            setError("Lütfen tüm alanları doldurun");
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const res = await fetch(`http://localhost:5015/api/students/${tc}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, updatedBy: user.username }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Güncelleme başarısız");
                return;
            }
            navigate("/home/assignments");
        } catch {
            setError("Sunucuya bağlanılamadı");
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10">
            <h2 className="text-xl font-bold mb-6 text-center">Öğrenci Düzenle</h2>
            {error && <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>}

            <input
                name="ad"
                value={form.ad}
                onChange={handleChange}
                placeholder="Adı"
                className="border p-2 mb-4 w-full rounded"
            />
            <input
                name="soyad"
                value={form.soyad}
                onChange={handleChange}
                placeholder="Soyadı"
                className="border p-2 mb-4 w-full rounded"
            />
            <input
                name="konum"
                value={form.konum}
                onChange={handleChange}
                placeholder="Konum"
                className="border p-2 mb-4 w-full rounded"
            />
            <input
                name="telefon"
                value={form.telefon}
                onChange={handleChange}
                placeholder="Telefon"
                className="border p-2 mb-4 w-full rounded"
            />
            <input
                name="tc"
                value={form.tc}
                onChange={handleChange}
                placeholder="TC Kimlik No"
                className="border p-2 mb-6 w-full rounded"
            />

            <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700 transition"
            >
                Güncelle
            </button>
        </div>
    );
}
