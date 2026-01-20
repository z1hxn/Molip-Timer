import { Routes, Route } from "react-router-dom";
import { Home, Timer, Settings, History, NotFound } from "@pages";
import { Header } from "@widgets";

function App() {
  return (
    <div className="App">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
