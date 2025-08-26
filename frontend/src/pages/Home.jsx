import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle, FaClipboardList, FaFileAlt } from "react-icons/fa";



function Torch({ darkMode }) {
        return (
                <div className="relative w-full h-full flex items-center justify-center cursor-pointer">
                        <div className={`w-5 h-5 rounded-full ${darkMode ? "bg-yellow-400" : "bg-gray-400"} animate-pulse glow`}></div>
                        <div className="absolute top-0 w-12 h-12 rounded-full border-2 border-yellow-300 opacity-50 animate-ping"></div>
                        {[...Array(6)].map((_, i) => (
                                <div
                                        key={i}
                                        className={`absolute w-1 h-1 rounded-full bg-yellow-300 opacity-70 particle`}
                                        style={{ left: `${10 + i * 4}px`, animationDelay: `${i * 0.2}s` }}
                                />
                        ))}
                        <style>
                                {`
                .glow {
                    box-shadow: 0 0 12px 4px rgba(255,255,150,0.9);
                }
                @keyframes pulse {
                    0%,100% { transform: scale(1); opacity: 0.7;}
                    50% { transform: scale(1.3); opacity:1;}
                }
                .animate-pulse { animation: pulse 1s infinite; }
                @keyframes ping {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .animate-ping { animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.6); opacity: 0.7; }
                    50% { transform: translateY(-15px) scale(1); opacity: 1; }
                    100% { transform: translateY(-30px) scale(0.6); opacity: 0; }
                }
                .particle {
                    animation: floatUp 2s infinite;
                }
            `}
                        </style>
                </div>
        );
}

export default function Home() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const { darkMode, setDarkMode } = useTheme();
    const toggleDarkMode = () => setDarkMode(prev => !prev);

    const isActive = (path) =>
        location.pathname.endsWith(path)
            ? "bg-blue-900 text-white shadow-lg"
            : `${darkMode ? 'text-gray-100 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-blue-100 hover:text-blue-900'}`;

    return (
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-500">
            <header className={`flex items-center justify-between px-6 py-4 sticky top-0 z-50 border-b shadow-md ${darkMode ? "bg-gray-900 border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-800"}`}>
                <button onClick={() => setMenuOpen(prev => !prev)} className={`relative w-10 h-10 focus:outline-none transition-transform duration-500 ${menuOpen ? "rotate-90" : "rotate-0"}`}>
                    <FaBars className="w-full h-full" />
                </button>

                <h1 className="text-2xl font-extrabold select-none tracking-wide">Firma Yönetim Paneli</h1>

                <div onClick={toggleDarkMode} className="w-10 h-10">
                    <Torch darkMode={darkMode} />
                </div>
            </header>

            <div className={`fixed top-0 left-0 h-full w-64 shadow-2xl transform transition-transform duration-500 ease-in-out z-50 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <nav className={`flex flex-col p-10 h-full transition-colors duration-500 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}>
                    <h2 className="text-3xl font-bold mb-12 select-none tracking-wide">Menü</h2>
                    <ul className="flex flex-col gap-7 text-lg flex-grow font-medium">
                        <li>
                            <Link to="assignments" className={`flex items-center gap-4 px-5 py-3 rounded-lg transition duration-300 transform hover:scale-105 ${isActive("assignments")}`} onClick={() => { sessionStorage.setItem("allowedNavigation", "1"); setMenuOpen(false); }}>
                                <FaClipboardList className="text-2xl" /> Öğrenci Bilgisi
                            </Link>
                        </li>
                        <li>
                            <Link to="userinfo" className={`flex items-center gap-4 px-5 py-3 rounded-lg transition duration-300 transform hover:scale-105 ${isActive("userinfo")}`} onClick={() => { sessionStorage.setItem("allowedNavigation", "1"); setMenuOpen(false); }}>
                                <FaUserCircle className="text-2xl" /> Kullanıcı Bilgisi
                            </Link>
                        </li>
                        <li>
                            <Link to="userreport" className={`flex items-center gap-4 px-5 py-3 rounded-lg transition duration-300 transform hover:scale-105 ${isActive("userreport")}`} onClick={() => { sessionStorage.setItem("allowedNavigation", "1"); setMenuOpen(false); }}>
                                <FaFileAlt className="text-2xl" /> Kullanıcı Raporu
                            </Link>
                        </li>
                    </ul>
                    <footer className="mt-auto pt-10 text-sm select-none tracking-wide text-gray-500">&copy; 2025 Firma Adı. Tüm hakları saklıdır.</footer>
                </nav>
            </div>

            {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

            <main className={`flex-1 p-12 max-w-7xl mx-auto w-full rounded-md shadow-lg mt-8 transition-colors duration-500 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}>
                <Outlet context={{ darkMode }} />
            </main>
        </div>
    );
}
