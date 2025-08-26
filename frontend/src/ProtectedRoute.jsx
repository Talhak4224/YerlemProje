
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
    const user = sessionStorage.getItem("user");
    const allowed = sessionStorage.getItem("allowedNavigation");
    const location = useLocation();
    if (!user) {
        if (location.pathname === "/") {
            return <Outlet />;
        }
        return null;
    }
    const firstAllowedPaths = ["/home", "/home/assignments"];
    if (!allowed) {
        if (firstAllowedPaths.includes(location.pathname)) {
            return <Outlet />;
        }
        return null;
    }
    sessionStorage.removeItem("allowedNavigation");
    return <Outlet />;
}
