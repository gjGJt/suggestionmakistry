// src/main.tsx   (makistry-frontend)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import ReactQueryProvider from "./providers/ReactQueryProvider";  // ⬅ path alias @/* already in tsconfig

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <App />
    </ReactQueryProvider>
  </React.StrictMode>,
);
