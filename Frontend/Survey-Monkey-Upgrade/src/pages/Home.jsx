import ImageSelectionCard from "../components/ImageSelectionCard";
import QuestionCard from "../components/QuestionCard";
import { useState } from "react";
import "../css/Home.css";

const SURVEY_QUESTIONS = [
  {
    id: 1,
    text: "How was your overall experience?",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 2,
    text: "How likely are you to recommend us?",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 3,
    text: "How was the speed of service?",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
];

const ANIM_MS = 720;

function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("idle"); // can be idle, leaving, entering

  const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex];

  const [dir, setDir] = useState("next");

  function goNext() {
    if (phase !== "idle") return;
    if (currentQuestionIndex >= SURVEY_QUESTIONS.length - 1) return;

    setDir("next");
    setPhase("leaving");

    setTimeout(() => {
      setCurrentQuestionIndex((i) => i + 1);
      setPhase("entering");
      setTimeout(() => setPhase("idle"), ANIM_MS);
    }, ANIM_MS);
  }

  function goPrev() {
    if (phase !== "idle") return;
    if (currentQuestionIndex <= 0) return;

    setDir("prev");
    setPhase("leaving");

    setTimeout(() => {
      setCurrentQuestionIndex((i) => i - 1);
      setPhase("entering");
      setTimeout(() => setPhase("idle"), ANIM_MS);
    }, ANIM_MS);
  }

  function onClear() {
    setCurrentQuestionIndex(0);
    setPhase("idle");
  }

  return (
    <div className="home">
      <div className="survey">
        <div className={`survey-stage ${phase} ${dir}`}>
          <QuestionCard
            key={currentQuestion.id} // important: forces fresh enter animation
            question={currentQuestion.text}
            imageSelectionCard={
              <ImageSelectionCard
                img1={currentQuestion.images[0]}
                img2={currentQuestion.images[1]}
                img3={currentQuestion.images[2]}
                img4={currentQuestion.images[3]}
                img5={currentQuestion.images[4]}
              />
            }
          />
        </div>
        <div className="survey-actions">
          <button className="btn secondary" type="button" onClick={onClear}>
            Clear Form
          </button>

          <div className="nav-buttons">
            <button
              className="btn secondary"
              type="button"
              onClick={goPrev}
              disabled={currentQuestionIndex === 0 || phase !== "idle"}
            >
              Previous
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={goNext}
              disabled={
                currentQuestionIndex === SURVEY_QUESTIONS.length - 1 ||
                phase !== "idle"
              }
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

