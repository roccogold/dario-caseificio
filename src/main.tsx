import { createRoot } from "react-dom/client";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource/eb-garamond/700.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
// Force cache bust 1769267544
