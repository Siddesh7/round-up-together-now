import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { IntMaxProvider } from "./contexts/IntMaxContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IntMaxProvider>
      <App />
      <Toaster />
    </IntMaxProvider>
  </React.StrictMode>
);
