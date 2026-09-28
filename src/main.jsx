import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
import App from "./app";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Analytics />
  </>
);
