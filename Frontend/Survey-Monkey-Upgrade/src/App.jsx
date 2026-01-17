import "./App.css";
import { Routes, Route } from "react-router-dom";
import PrototypeServey from "./pages/PrototypeServey";
import SurveyCreation from "./pages/SurveyCreation";
import Home from "./pages/Home";
import Nav from "./components/Nav";

function App() {
  return (
    <>
      <Nav />
      <main className="main-content" style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prototypeSurvey" element={<PrototypeServey />} />
          <Route path="/createSurvey" element={<SurveyCreation />} />
        </Routes>
      </main>
    </>
  );
}
export default App;
