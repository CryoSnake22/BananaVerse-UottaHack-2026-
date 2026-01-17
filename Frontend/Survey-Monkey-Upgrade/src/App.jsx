import "./App.css";
import { Routes, Route } from "react-router-dom";
import PrototypeSurvey from "./pages/PrototypeSurvey";
import SurveyCreation from "./pages/SurveyCreation";
import Home from "./pages/Home";
import Nav from "./components/Nav";
import NewlyCreatedSurvey from "./pages/NewlyCreatedSurvey";

function App() {
  return (
    <>
      <Nav />
      <main className="main-content" style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prototypeSurvey" element={<PrototypeSurvey />} />
          <Route path="/createSurvey" element={<SurveyCreation />} />
          <Route path="/newlyCreatedSurvey" element={<NewlyCreatedSurvey />} />

        </Routes>
      </main>
    </>
  );
}
export default App;
