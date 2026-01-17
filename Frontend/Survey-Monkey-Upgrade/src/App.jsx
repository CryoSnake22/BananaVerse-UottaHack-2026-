import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Survey from "./pages/SurveyCreation";
import Nav from "./components/Nav";

function App() {
  return (
    <>
      <Nav />
      <main className="main-content" style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-survey" element={<Survey />} />
        </Routes>
      </main>
    </>
  );
}
export default App;
