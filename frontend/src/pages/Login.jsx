import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Kullanıcı adı ve şifre gerekli");
            return;
        }

        try {
            const res = await fetch("http://localhost:5015/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Giriş başarısız");
                return;
            }

            const data = await res.json();
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/home/assignments");
        } catch (err) {
            setError("Sunucuya bağlanılamadı");
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('/Adsız.png')" }}
        >
            <div className="w-full max-w-md p-10 bg-white/80 rounded-xl shadow-xl backdrop-blur-sm">

                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Logo" className="h-20" />
                </div>


                <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    className="border w-full p-3 mb-4 rounded focus:outline-blue-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                />


                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Şifre"
                        className="border w-full p-3 pr-10 rounded focus:outline-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>


                {error && (
                    <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
                )}


                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
                >
                    Giriş Yap
                </button>
            </div>
        </div>
    );
}
