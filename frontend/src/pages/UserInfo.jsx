import React from "react";

export default function UserInfo() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10">
            <h2 className="text-xl font-bold mb-6 text-center">Kullanıcı Bilgisi</h2>
            {user ? (
                <div className="text-center">
                    <p>
                        <strong>Kullanıcı Adı:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Rol:</strong> {user.role}
                    </p>
                </div>
            ) : (
                <p>Giriş yapılmamış.</p>
            )}
        </div>
    );
}
