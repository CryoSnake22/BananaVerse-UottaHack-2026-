import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Nav from "./components/Nav";

function App() {
  return (
    <>
      <Nav />
      <main className="main-content" style={{ paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/survey" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}
export default App;
