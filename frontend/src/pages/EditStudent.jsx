import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { useNavigate, useParams } from "react-router-dom";

export default function EditStudent() {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    konum: "",
    telefon: "",
    id: "",
    okulId: "",
    okulAdi: "",
    servisAdi: "",
    ogrenciId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [okullar, setOkullar] = useState([]);
  const [servisler, setServisler] = useState([]);
  const [servisAra, setServisAra] = useState("");

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    Promise.all([
      fetch(`http://localhost:5015/api/studentbyid/${id}`).then(res => res.ok ? res.json() : null),
      fetch("http://localhost:5015/api/okullar").then(res => res.ok ? res.json() : [])
    ]).then(([student, okullarData]) => {
      if (!isMounted) return;
      if (!student) {
        setError("Öğrenci bulunamadı veya silinmiş olabilir.");
        return;
      }
      let okulId = student.okulId;
      if ((!okulId || okulId === "") && student.okulAdi && okullarData.length) {
        const okul = okullarData.find(
          (o) => o.ad.trim().toLowerCase() === student.okulAdi.trim().toLowerCase()
        );
        if (okul) okulId = okul.id;
      }
      setForm({ ...student, okulId: okulId || "" });
      setOkullar(okullarData);
    });
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (!form.okulId || !okullar.length) {
      setServisler([]);
      return;
    }
    console.log('Servis fetch için okulId:', form.okulId);
    fetch(`http://localhost:5015/api/servisler?okulId=${form.okulId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Servis fetch sonucu:', data);
        setServisler(data);
      })
      .catch(() => setError("Servisler yüklenemedi"));
  }, [form.okulId, okullar]);

  const filtrelenmisServisler = servisler
    .filter((s) =>
      s.servisAdi && s.servisAdi.toLowerCase().includes(servisAra.toLowerCase())
    )
    .map((s) => s.servisAdi);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      ...(e.target.name === "okulAdi" ? { servisAdi: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const currentUser = localStorage.getItem("username") || "admin";
      const updatedForm = { ...form, addedBy: currentUser };

      const res = await fetch(
        `http://localhost:5015/api/studentbyid/${form.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedForm),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Güncelleme sırasında hata oluştu");
        setLoading(false);
        return;
      }

      await fetch("http://localhost:5015/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser,
          addedBy: currentUser,
          action: "Öğrenci düzenlendi",
          studentId: form.id,
          timestamp: new Date().toISOString(),
        }),
      });

      navigate("/home/assignments");
    } catch {
      setError("Sunucuya bağlanılamadı");
      setLoading(false);
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
  <div className={`max-w-4xl mx-auto rounded-xl shadow-md p-10 mt-12 font-sans transition-colors duration-500 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
  <h2 className={`text-3xl font-extrabold mb-10 text-center tracking-wide ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Öğrenci Düzenleme
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
              className={`mb-2 font-medium select-none ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}
            >
              {capitalize(name)}
            </label>
            <input
              id={name}
              name={name}
              type="text"
              placeholder={`${capitalize(name)} girin`}
              value={form[name] || ""}
              onChange={handleChange}
              disabled={loading}
              className={`border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-600 transition ${darkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`}
              autoComplete="off"
            />
          </div>
        ))}

        <div className="col-span-full mt-6">
          <label className={`mb-2 font-medium select-none ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
            Okul Seç
          </label>
          <select
            name="okulId"
            value={form.okulId || ""}
            onChange={e => {
              const okulId = e.target.value;
              const okul = okullar.find(o => String(o.id) === String(okulId));
              setForm(prev => ({
                ...prev,
                okulId,
                okulAdi: okul ? okul.ad : "",
                servisAdi: ""
              }));
            }}
            disabled={loading}
            className={`border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-600 transition ${darkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`}
          >
            {okullar.slice(0,2).map((okul) => (
              <option key={okul.id} value={okul.id}>
                {okul.ad}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-full mt-6">
          <label className={`mb-2 font-medium select-none ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
            Servis Seç
          </label>
          <input
            type="text"
            placeholder="Servis ara..."
            className={`border border-gray-300 rounded-lg px-4 py-2 w-full mb-3 ${darkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`}
            value={servisAra}
            onChange={(e) => setServisAra(e.target.value)}
            disabled={loading || !form.okulId}
          />
          <div className={`max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {filtrelenmisServisler.length > 0 ? (
              filtrelenmisServisler.map((servis, index) => (
                <div
                  key={index}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, servisAdi: servis }))
                  }
                  className={`px-4 py-2 rounded cursor-pointer select-none transition ${form.servisAdi === servis
                    ? "bg-indigo-600 text-white font-semibold"
                    : "hover:bg-indigo-100 text-gray-800"
                    }`}
                >
                  {servis}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-2">
                Servis bulunamadı.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-full mt-6 flex gap-6 text-lg font-semibold select-none">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="sabah"
              checked={!!form.sabah}
              onChange={e => setForm(prev => ({ ...prev, sabah: e.target.checked }))}
              disabled={loading}
            />
            Sabah Servisi
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="aksam"
              checked={!!form.aksam}
              onChange={e => setForm(prev => ({ ...prev, aksam: e.target.checked }))}
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
          {loading ? <span>Kaydediliyor...</span> : "Kaydet"}
        </button>
      </form>
    </div>
  );
}