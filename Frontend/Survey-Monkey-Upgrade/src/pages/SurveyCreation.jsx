import React, { useState } from "react";

export default function CreateSurvey() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("tree");
  const [surveyLink, setSurveyLink] = useState("");

  const categories = [
    { value: "tree", label: "Tree" },
    { value: "monkey", label: "Monkey" },
    { value: "house", label: "House" },
    { value: "cacti", label: "Cacti" },
    { value: "charriot", label: "Charriot" },
    { value: "grass", label: "Grass" },
    { value: "oasis", label: "Oasis" },
    { value: "weather", label: "Weather" },
    { value: "wolf", label: "Wolf" },
  ];

  const addQuestion = () => {
    if (currentQuestion.trim()) {
      setQuestions([
        ...questions,
        {
          id: Date.now(),
          text: currentQuestion,
          category: selectedCategory,
        },
      ]);
      setCurrentQuestion("");
    }
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = () => {
    const surveyId = Date.now().toString(36);

    // Format questions to match Home.jsx structure
    const formattedQuestions = questions.map((q, index) => ({
      id: index + 1,
      text: q.text,
      images: [
        `/images/${q.category}_1.png`,
        `/images/${q.category}_2.png`,
        `/images/${q.category}_3.png`,
        `/images/${q.category}_4.png`,
        `/images/${q.category}_5.png`,
      ],
    }));

    // Save to localStorage
    localStorage.setItem(
      `survey_${surveyId}`,
      JSON.stringify(formattedQuestions),
    );

    const link = `${window.location.origin}/survey?id=${surveyId}`;
    setSurveyLink(link);
  };
  const copyLink = () => {
    navigator.clipboard.writeText(surveyLink);
    alert("Link copied to clipboard!");
  };
  return (
    <>
      <style>{`
        .create-survey-page {
          min-height: calc(100vh - 80px);
          max-width: 900px;
          margin: 0 auto;
          padding: 120px 2rem 2rem;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .page-title {
          font-size: 2.5rem;
          font-weight: 600;
          color: rgba(20, 20, 24, 0.92);
          margin-bottom: 0.5rem;
        }
        
        .page-subtitle {
          color: rgba(20, 20, 24, 0.6);
          font-size: 1.125rem;
        }
        
        .add-question-section {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(229, 231, 235, 0.6);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(20, 20, 24, 0.92);
          margin-bottom: 1.5rem;
        }
        
        .input-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .text-input {
          flex: 1;
          min-width: 250px;
          padding: 0.85rem 1.1rem;
          border: 2px solid rgba(209, 213, 219, 0.8);
          border-radius: 0.9rem;
          font-size: 1rem;
          background: white;
          transition: all 0.2s ease;
        }
        
        .text-input:focus {
          outline: none;
          border-color: rgba(25, 25, 30, 0.4);
        }
        
        .select-input {
          padding: 0.85rem 1.1rem;
          border: 2px solid rgba(209, 213, 219, 0.8);
          border-radius: 0.9rem;
          font-size: 1rem;
          background: white;
          cursor: pointer;
          min-width: 150px;
        }
        
        .select-input:focus {
          outline: none;
          border-color: rgba(25, 25, 30, 0.4);
        }
        
        .btn {
          border: none;
          border-radius: 0.9rem;
          padding: 0.85rem 1.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 160ms ease, filter 160ms ease, opacity 160ms ease;
          font-weight: 500;
        }
        
        .btn:active {
          transform: translateY(0.08rem);
        }
        
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        
        .btn.primary {
          background: rgba(25, 25, 30, 0.92);
          color: rgba(255, 255, 255, 0.92);
        }
        
        .btn.secondary {
          background: rgba(255, 255, 255, 0.78);
          color: rgba(20, 20, 24, 0.92);
          border: 2px solid rgba(209, 213, 219, 0.8);
        }
        
        .btn:hover:not(:disabled) {
          filter: brightness(1.06);
        }
        
        .questions-list {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(229, 231, 235, 0.6);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .questions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .question-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border-radius: 0.9rem;
          border: 1px solid rgba(229, 231, 235, 0.8);
          margin-bottom: 0.75rem;
          transition: all 0.2s ease;
        }
        
        .question-item:hover {
          border-color: rgba(25, 25, 30, 0.2);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .question-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .question-text {
          color: rgba(20, 20, 24, 0.92);
          font-size: 1rem;
          font-weight: 500;
        }
        
        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(25, 25, 30, 0.08);
          color: rgba(20, 20, 24, 0.7);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
          width: fit-content;
        }
        
        .btn-remove {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.9rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: filter 160ms ease;
        }
        
        .btn-remove:hover {
          filter: brightness(1.1);
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: rgba(20, 20, 24, 0.5);
          font-size: 1rem;
        }
        
        .submit-section {
          text-align: center;
          margin-top: 2rem;
        }
        
        .submit-section .btn {
          padding: 1rem 3rem;
          font-size: 1.125rem;
        }
        
        .survey-link-section {
          background: rgba(34, 197, 94, 0.1);
          border: 2px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
          text-align: center;
        }
        
        .link-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(20, 20, 24, 0.92);
          margin-bottom: 1rem;
        }
        
        .link-text {
          color: rgba(20, 20, 24, 0.7);
          margin-bottom: 1.5rem;
        }
        
        .link-display {
          background: white;
          padding: 1rem;
          border-radius: 0.9rem;
          border: 2px solid rgba(229, 231, 235, 0.8);
          margin-bottom: 1rem;
          word-break: break-all;
          color: rgba(59, 130, 246, 0.9);
          font-family: monospace;
        }
        
        .link-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>

      <div className="create-survey-page">
        <div className="page-header">
          <h1 className="page-title">Create Survey</h1>
          <p className="page-subtitle">
            Build your custom survey with themed questions
          </p>
        </div>

        <div className="add-question-section">
          <h2 className="section-title">Add Questions</h2>
          <div className="input-group">
            <input
              type="text"
              className="text-input"
              placeholder="Enter your question..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addQuestion()}
            />
            <select
              className="select-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button className="btn primary" onClick={addQuestion}>
              Add Question
            </button>
          </div>
        </div>

        {questions.length > 0 ? (
          <>
            <div className="questions-list">
              <div className="questions-header">
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                  Your Questions ({questions.length})
                </h3>
              </div>

              {questions.map((q) => (
                <div key={q.id} className="question-item">
                  <div className="question-content">
                    <div className="question-text">{q.text}</div>
                    <div className="category-badge">{q.category}</div>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeQuestion(q.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {!surveyLink && (
              <div className="submit-section">
                <button className="btn primary" onClick={handleSubmit}>
                  Create Survey
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="questions-list">
            <div className="empty-state">
              No questions yet. Add your first question above!
            </div>
          </div>
        )}

        {surveyLink && (
          <div className="survey-link-section">
            <h3 className="link-title">Survey Created!</h3>
            <p className="link-text">
              Share this link with participants to take your survey:
            </p>
            <div className="link-display">{surveyLink}</div>
            <div className="link-buttons">
              <button className="btn primary" onClick={copyLink}>
                Copy Link
              </button>
              <a
                href={surveyLink}
                className="btn secondary"
                style={{ textDecoration: "none" }}
              >
                Open Survey
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
