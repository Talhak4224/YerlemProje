import React from "react";
import { ThemeProvider } from "./ThemeContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Assignments from "./pages/Assignments.jsx";
import AddStudent from "./pages/AddStudent.jsx";
import EditStudent from "./pages/EditStudent.jsx";
import UserInfo from "./pages/UserInfo.jsx";
import UserReport from "./pages/UserReport.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/home" element={<Home />}>
                            <Route index element={<Navigate to="assignments" />} />
                            <Route path="assignments" element={<Assignments />} />
                            <Route path="addstudent" element={<AddStudent />} />
                            <Route path="editstudent/:id" element={<EditStudent />} />
                            <Route path="userinfo" element={<UserInfo />} />
                            <Route path="userreport" element={<UserReport />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}