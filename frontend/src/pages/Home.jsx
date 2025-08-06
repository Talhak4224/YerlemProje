import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle, FaClipboardList, FaFileAlt } from "react-icons/fa";

export default function Home() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) =>
        location.pathname.endsWith(path)
            ? "bg-blue-900 text-white shadow-lg"
            : "text-gray-700 hover:bg-blue-100 hover:text-blue-900";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <header className="flex items-center justify-between bg-white shadow-md px-6 py-4 sticky top-0 z-50 border-b border-gray-200">
                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className={`relative w-10 h-10 text-blue-900 focus:outline-none transition-transform duration-500 ${menuOpen ? "rotate-90" : "rotate-0"
                        }`}
                    aria-label="Menüyü aç/kapat"
                >
                    <FaBars className="w-full h-full" />
                </button>
                <h1 className="text-2xl font-extrabold text-blue-900 select-none tracking-wide">
                    Firma Yönetim Paneli
                </h1>
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold text-lg select-none">
                    Y
                </div>
            </header>

            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out z-50 ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
                    }`}
                style={{ willChange: "transform, opacity" }}
            >
                <nav className="flex flex-col p-10 h-full">
                    <h2 className="text-3xl font-bold mb-12 text-blue-900 select-none tracking-wide">Menü</h2>

                    <ul className="flex flex-col gap-7 text-lg flex-grow font-medium">
                        <li>
                            <Link
                                to="assignments"
                                className={`flex items-center gap-4 px-5 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${isActive(
                                    "assignments"
                                )}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaClipboardList className="text-2xl" />
                                Öğrenci Bilgisi
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="userinfo"
                                className={`flex items-center gap-4 px-5 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${isActive(
                                    "userinfo"
                                )}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaUserCircle className="text-2xl" />
                                Kullanıcı Bilgisi
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="userreport"
                                className={`flex items-center gap-4 px-5 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${isActive(
                                    "userreport"
                                )}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaFileAlt className="text-2xl" />
                                Kullanıcı Raporu
                            </Link>
                        </li>
                    </ul>

                    <footer className="mt-auto pt-10 text-sm text-gray-500 select-none tracking-wide">
                        &copy; 2025 Firma Adı. Tüm hakları saklıdır.
                    </footer>
                </nav>
            </div>

            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                    style={{ transition: "background-color 0.5s ease" }}
                />
            )}

            <main className="flex-1 p-12 max-w-7xl mx-auto w-full bg-white rounded-md shadow-lg mt-8 transition-all duration-500">
                <Outlet />
            </main>
        </div>
    );
}
