import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HomeBanana from "./pages/HomeBanana";
import Nav from "./components/Nav";

function App() {
  return (
    <>
      <Nav />
      <main className="main-content" style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<HomeBanana />} />
          <Route path="/survey" element={<HomeBanana />} />
        </Routes>
      </main>
    </>
  );
}
export default App;
