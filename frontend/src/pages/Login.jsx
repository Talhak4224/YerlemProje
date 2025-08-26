import { useState } from "react";
import { useTheme } from "../ThemeContext";
function Torch({ darkMode }) {
    return (
        <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer">
            <div className={`w-4 h-4 rounded-full ${darkMode ? "bg-yellow-400" : "bg-gray-400"} animate-pulse glow`}></div>
            <div className="absolute top-0 w-8 h-8 rounded-full border-2 border-yellow-300 opacity-50 animate-ping"></div>
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full bg-yellow-300 opacity-70 particle`}
                    style={{ left: `${4 + i * 2}px`, animationDelay: `${i * 0.2}s` }}
                />
            ))}
            <style>{`
                .glow { box-shadow: 0 0 12px 4px rgba(255,255,150,0.9); }
                @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.7;} 50% { transform: scale(1.3); opacity:1;} }
                .animate-pulse { animation: pulse 1s infinite; }
                @keyframes ping { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.3; } 100% { transform: scale(1.5); opacity: 0; } }
                .animate-ping { animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }
                @keyframes floatUp { 0% { transform: translateY(0) scale(0.6); opacity: 0.7; } 50% { transform: translateY(-8px) scale(1); opacity: 1; } 100% { transform: translateY(-16px) scale(0.6); opacity: 0; } }
                .particle { animation: floatUp 2s infinite; }
            `}</style>
        </div>
    );
}
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const { darkMode, setDarkMode } = useTheme();
    const toggleDarkMode = () => setDarkMode(prev => !prev);
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
            sessionStorage.setItem("user", JSON.stringify(data.user));
            if (data.user && data.user.username) {
                sessionStorage.setItem("username", data.user.username);
            }
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
            <div className={`w-full max-w-md p-10 rounded-xl shadow-xl backdrop-blur-sm relative transition-colors duration-500 ${darkMode ? 'bg-gray-900/90 text-white' : 'bg-white/80 text-gray-900'}`}> 
                <button onClick={toggleDarkMode} className="absolute top-4 right-4 z-10" title="Tema Değiştir">
                    <Torch darkMode={darkMode} />
                </button>

                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Logo" className="h-20" />
                </div>


                <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    className={`border w-full p-3 mb-4 rounded focus:outline-blue-500 placeholder-gray-500 ${darkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                />


                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Şifre"
                        className={`border w-full p-3 pr-10 rounded focus:outline-blue-500 placeholder-gray-500 ${darkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`}
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
