import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home, Timer, Settings } from "./pages";
import Header from "./components/Header.tsx";

function App() {
  return (
    <div className="App">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
