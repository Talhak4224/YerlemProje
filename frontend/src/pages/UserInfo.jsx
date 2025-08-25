import React from "react";
import { useTheme } from "../ThemeContext";

export default function UserInfo() {
    const { darkMode } = useTheme();
    const user = JSON.parse(localStorage.getItem("user"));

    return (
    <div className={`max-w-md mx-auto p-8 rounded-2xl mt-16 shadow-lg border transition-colors duration-500
        ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}
        flex flex-col items-center gap-4`}
    >
            <h2 className="text-2xl font-extrabold mb-6 text-center tracking-wide">Kullanıcı Bilgisi</h2>
            {user ? (
                <div className="w-full flex flex-col items-center gap-3">
                    <div className={`w-full rounded-lg px-5 py-3 font-semibold text-lg shadow border
                        ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>
                        <span className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Kullanıcı Adı</span>
                        {user.username}
                    </div>
                    <div className={`w-full rounded-lg px-5 py-3 font-semibold text-lg shadow border
                        ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>
                        <span className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Rol</span>
                        {user.role}
                    </div>
                </div>
            ) : (
                <p>Giriş yapılmamış.</p>
            )}
        </div>
    );
}
