import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    konum: "",
    telefon: "",
    id: "",
    okulAdi: "",
    servisAdi: "",
    veli: "",
    ogrenciId: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [okullar, setOkullar] = useState([]);
  const [servisler, setServisler] = useState([]);
  const [servisAra, setServisAra] = useState([]);

  // Öğrenci verisini çek
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5015/api/students/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Öğrenci bulunamadı");
        return res.json();
      })
      .then((data) => {
        setForm(data);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  // Okul listesini getir
  useEffect(() => {
    fetch("http://localhost:5015/api/okullar")
      .then((res) => res.json())
      .then((data) => setOkullar(data))
      .catch(() => setError("Okullar yüklenemedi"));
  }, []);

  // Servisleri getir, okul seçimine göre filtrele
  useEffect(() => {
    if (!form.okulAdi) {
      setServisler([]);
      return;
    }
    // Okul adından okulId'yi bul
    const okul = okullar.find((o) => o.ad === form.okulAdi);
    if (!okul) {
      setServisler([]);
      return;
    }

    fetch(`http://localhost:5015/api/servisler?okulId=${okul.id}`)
      .then((res) => res.json())
      .then((data) => setServisler(data))
      .catch(() => setError("Servisler yüklenemedi"));
  }, [form.okulAdi, okullar]);

  // Servis arama için filtre
  const filtrelenmisServisler = servisler
    .filter((s) =>
      s.servisAdi.toLowerCase().includes(servisAra.toLowerCase())
    )
    .map((s) => s.servisAdi);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      // Servis seçimini okul değiştiğinde sıfırla
      ...(e.target.name === "okulAdi" ? { servisAdi: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5015/api/students/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Güncelleme sırasında hata oluştu");
        setLoading(false);
        return;
      }

      navigate("/home/assignments");
    } catch {
      setError("Sunucuya bağlanılamadı");
      setLoading(false);
    }
  };

  // Büyük harfe çevirme fonksiyonu
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto"
        noValidate
      >
        {["ad", "soyad", "konum", "telefon", "veli"].map((name) => (
          <div key={name} className="flex flex-col">
            <label
              htmlFor={name}
              className="mb-2 text-gray-700 font-medium select-none"
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
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-600 transition"
              autoComplete="off"
            />
          </div>
        ))}

        <div className="col-span-full mt-6">
          <label className="mb-2 text-gray-700 font-medium select-none">
            Okul Seç
          </label>
          <select
            name="okulAdi"
            value={form.okulAdi || ""}
            onChange={handleChange}
            disabled={loading}
            className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-600 transition"
          >
            {okullar.map((okul) => (
              <option key={okul.id} value={okul.ad}>
                {okul.ad}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-full mt-6">
          <label className="mb-2 text-gray-700 font-medium select-none">
            Servis Seç
          </label>
          <input
            type="text"
            placeholder="Servis ara..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-3"
            value={servisAra}
            onChange={(e) => setServisAra(e.target.value)}
            disabled={loading || !form.okulAdi}
          />
          <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2 bg-gray-50">
            {filtrelenmisServisler.length > 0 ? (
              filtrelenmisServisler.map((servis, index) => (
                <div
                  key={index}
                  onClick={() => setForm((prev) => ({ ...prev, servisAdi: servis }))}
                  className={`px-4 py-2 rounded cursor-pointer select-none transition ${
                    form.servisAdi === servis
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