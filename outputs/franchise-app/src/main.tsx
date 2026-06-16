import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./styles.css";

const basename = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");
const AdminApp = lazy(() => import("./admin/AdminApp").then((module) => ({ default: module.AdminApp })));
const PortalApp = lazy(() => import("./portal/PortalApp").then((module) => ({ default: module.PortalApp })));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Suspense fallback={<div className="app-loading">Загрузка</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/portal" replace />} />
          <Route path="/portal/*" element={<PortalApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);
