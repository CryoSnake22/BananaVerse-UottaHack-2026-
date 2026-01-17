import React, { useState, useEffect, useRef } from "react";

export default function CreateSurvey() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("tree");
  const [surveyLink, setSurveyLink] = useState("");
  const [generating, setGenerating] = useState({});
  const [generatedCounts, setGeneratedCounts] = useState({});
  const pollIntervalsRef = useRef({});

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

  const BACKEND_URL = "http://localhost:8000";

  const getImagePaths = (category, isGenerated) => {
    if (isGenerated) {
      return Array.from(
        { length: 5 },
        (_, i) =>
          `${BACKEND_URL}/assets/${category}/${category}_${i + 1}.png?t=${Date.now()}`,
      );
    } else {
      return Array.from(
        { length: 5 },
        (_, i) => `/images/${category}_${i + 1}.png`,
      );
    }
  };

  useEffect(() => {
    return () => {
      Object.values(pollIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const checkGeneratedImages = (questionId, category, startTime) => {
    if (pollIntervalsRef.current[questionId]) {
      clearInterval(pollIntervalsRef.current[questionId]);
    }

    let lastCount = 0;
    const checkInterval = setInterval(async () => {
      let currentCount = 0;

      for (let i = 1; i <= 5; i++) {
        // Use start time to only count images created after generation started
        const path = `${BACKEND_URL}/assets/${category}/${category}_${i}.png`;
        try {
          const response = await fetch(path, {
            method: "HEAD",
            cache: "no-store",
          });
          if (response.ok) {
            // Check if image was modified after we started generating
            const lastModified = response.headers.get("Last-Modified");
            if (lastModified) {
              const modifiedTime = new Date(lastModified).getTime();
              if (modifiedTime >= startTime) {
                currentCount = i;
              } else {
                // Old image, stop counting
                break;
              }
            } else {
              // Can't determine age, count it anyway
              currentCount = i;
            }
          } else {
            break;
          }
        } catch (e) {
          break;
        }
      }

      // Only update if count increased
      if (currentCount > lastCount) {
        lastCount = currentCount;
        setGeneratedCounts((prev) => {
          const newCounts = { ...prev, [questionId]: currentCount };
          return newCounts;
        });
      }

      if (currentCount >= 5) {
        clearInterval(checkInterval);
        delete pollIntervalsRef.current[questionId];

        // Force re-render of images
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId ? { ...q, timestamp: Date.now() } : q,
          ),
        );
      }
    }, 500);

    pollIntervalsRef.current[questionId] = checkInterval;

    setTimeout(() => {
      if (pollIntervalsRef.current[questionId]) {
        clearInterval(pollIntervalsRef.current[questionId]);
        delete pollIntervalsRef.current[questionId];
      }
    }, 180000);
  };

  const generateAssets = async (questionId, category, prompt) => {
    const startTime = Date.now();
    const thingToGenerate = prompt || category;

    console.log(`🎯 Generate clicked for question ${questionId}`);
    console.log(`   Original category: ${category}`);
    console.log(`   Thing to generate: ${thingToGenerate}`);

    // First mark as generating and set to use generated images
    setGenerating((prev) => ({ ...prev, [questionId]: true }));
    setGeneratedCounts((prev) => ({ ...prev, [questionId]: 0 }));

    // Update the question's category to match what we're generating
    // AND switch to isGenerated mode
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          console.log(`   Updating question category to "${thingToGenerate}"`);
          return {
            ...q,
            category: thingToGenerate, // Update category to match what we're generating
            isGenerated: true,
            timestamp: startTime,
          };
        }
        return q;
      }),
    );

    // Start checking for images using the NEW category
    console.log(
      `   Starting to check for images in: /assets/${thingToGenerate}/`,
    );
    checkGeneratedImages(questionId, thingToGenerate, startTime);

    try {
      const res = await fetch(
        `${BACKEND_URL}/generate?thing=${encodeURIComponent(thingToGenerate)}`,
      );
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      console.log(`✅ Generation complete for ${thingToGenerate}`);

      // Update timestamp to force image refresh
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, timestamp: Date.now() } : q,
        ),
      );

      setTimeout(() => {
        setGenerating((prev) => ({ ...prev, [questionId]: false }));
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Failed to generate assets: " + err.message);
      // Revert back to premade if generation failed
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, isGenerated: false, category } : q,
        ),
      );
      setGenerating((prev) => ({ ...prev, [questionId]: false }));
      if (pollIntervalsRef.current[questionId]) {
        clearInterval(pollIntervalsRef.current[questionId]);
        delete pollIntervalsRef.current[questionId];
      }
    }
  };

  const addQuestion = () => {
    if (currentQuestion.trim()) {
      setQuestions([
        ...questions,
        {
          id: Date.now(),
          text: currentQuestion,
          category: selectedCategory,
          isGenerated: false,
          generatePrompt: selectedCategory,
          timestamp: Date.now(),
        },
      ]);
      setCurrentQuestion("");
    }
  };

  const removeQuestion = (id) => {
    if (pollIntervalsRef.current[id]) {
      clearInterval(pollIntervalsRef.current[id]);
      delete pollIntervalsRef.current[id];
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateGeneratePrompt = (questionId, prompt) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, generatePrompt: prompt } : q,
      ),
    );
  };

  const updateCategory = (questionId, newCategory) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, category: newCategory, generatePrompt: newCategory }
          : q,
      ),
    );
  };

  const handleSubmit = () => {
    const surveyId = Date.now().toString(36);

    const formattedQuestions = questions.map((q, index) => ({
      id: index + 1,
      text: q.text,
      images: getImagePaths(q.category, q.isGenerated),
    }));

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

        .text-input-small {
          padding: 0.6rem 0.9rem;
          border: 2px solid rgba(209, 213, 219, 0.8);
          border-radius: 0.9rem;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s ease;
          min-width: 150px;
        }
        
        .text-input-small:focus {
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

        .btn-small {
          border: none;
          border-radius: 0.9rem;
          padding: 0.6rem 1.2rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: transform 160ms ease, filter 160ms ease, opacity 160ms ease;
          font-weight: 500;
        }
        
        .btn:active, .btn-small:active {
          transform: translateY(0.08rem);
        }
        
        .btn:disabled, .btn-small:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        
        .btn.primary, .btn-small.primary {
          background: rgba(25, 25, 30, 0.92);
          color: rgba(255, 255, 255, 0.92);
        }
        
        .btn.secondary, .btn-small.secondary {
          background: rgba(255, 255, 255, 0.78);
          color: rgba(20, 20, 24, 0.92);
          border: 2px solid rgba(209, 213, 219, 0.8);
        }
        
        .btn:hover:not(:disabled), .btn-small:hover:not(:disabled) {
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
          padding: 1.5rem;
          background: white;
          border-radius: 0.9rem;
          border: 1px solid rgba(229, 231, 235, 0.8);
          margin-bottom: 1rem;
          transition: all 0.2s ease;
        }
        
        .question-item:hover {
          border-color: rgba(25, 25, 30, 0.2);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .question-content {
          flex: 1;
        }
        
        .question-text {
          color: rgba(20, 20, 24, 0.92);
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(25, 25, 30, 0.08);
          color: rgba(20, 20, 24, 0.7);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .category-select {
          padding: 0.25rem 0.5rem;
          background: transparent;
          border: 1px solid rgba(209, 213, 219, 0.6);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(20, 20, 24, 0.7);
          cursor: pointer;
          text-transform: capitalize;
          transition: all 0.2s ease;
        }

        .category-select:hover {
          background: rgba(25, 25, 30, 0.05);
          border-color: rgba(25, 25, 30, 0.3);
        }

        .category-select:focus {
          outline: none;
          border-color: rgba(25, 25, 30, 0.4);
          background: rgba(25, 25, 30, 0.08);
        }
        
        .question-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .generate-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
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
        
        .asset-preview {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(229, 231, 235, 0.6);
        }
        
        .preview-label {
          font-size: 0.875rem;
          color: rgba(20, 20, 24, 0.6);
          margin-bottom: 0.75rem;
          font-weight: 500;
        }
        
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }
        
        .preview-image-wrapper {
          width: 100%;
          aspect-ratio: 1;
          position: relative;
          background: rgba(243, 244, 246, 0.5);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 1px solid rgba(229, 231, 235, 0.8);
          display: block;
        }

        .preview-image.loading {
          opacity: 0;
        }
        
        .image-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 24px;
          height: 24px;
          margin-top: -12px;
          margin-left: -12px;
          border: 3px solid rgba(229, 231, 235, 0.3);
          border-top-color: rgba(25, 25, 30, 0.92);
          border-radius: 50%;
          animation: spin-loader 0.6s linear infinite;
        }
        
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(229, 231, 235, 0.3);
          border-top-color: rgba(25, 25, 30, 0.92);
          border-radius: 50%;
          animation: spin-loader 0.8s linear infinite;
        }
        
        @keyframes spin-loader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          margin-left: 1rem;
          color: rgba(20, 20, 24, 0.6);
          font-size: 0.875rem;
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

        .progress-text {
          font-size: 0.75rem;
          color: rgba(59, 130, 246, 0.8);
          margin-left: 0.5rem;
          font-weight: 600;
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
          <h2 className="section-title">Add Question</h2>
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
                  <div className="question-header">
                    <div className="question-content">
                      <div className="question-text">{q.text}</div>
                      <div className="category-badge">
                        <span>Category:</span>
                        <select
                          className="category-select"
                          value={q.category}
                          onChange={(e) => updateCategory(q.id, e.target.value)}
                          disabled={generating[q.id] || q.isGenerated}
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="question-actions">
                      <div className="generate-controls">
                        <input
                          type="text"
                          className="text-input-small"
                          placeholder="Generate prompt..."
                          value={q.generatePrompt || ""}
                          onChange={(e) =>
                            updateGeneratePrompt(q.id, e.target.value)
                          }
                          disabled={generating[q.id] || q.isGenerated}
                        />
                        <button
                          className="btn-small secondary"
                          onClick={() =>
                            generateAssets(q.id, q.category, q.generatePrompt)
                          }
                          disabled={generating[q.id] || q.isGenerated}
                        >
                          {q.isGenerated
                            ? "Generated ✓"
                            : generating[q.id]
                              ? "Generating..."
                              : "Generate"}
                        </button>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => removeQuestion(q.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="asset-preview">
                    <div className="preview-label">
                      {q.isGenerated ? "Generated Assets:" : "Premade Assets:"}
                      {generating[q.id] && (
                        <span className="progress-text">
                          {generatedCounts[q.id] || 0}/5 generated
                        </span>
                      )}
                    </div>
                    <div className="preview-grid">
                      {Array.from({ length: 5 }, (_, i) => {
                        const imageIndex = i + 1;
                        const isLoading =
                          generating[q.id] &&
                          (!generatedCounts[q.id] ||
                            imageIndex > generatedCounts[q.id]);

                        // Determine which category to use for the path
                        const displayCategory = q.isGenerated
                          ? q.category
                          : q.category;
                        const imagePath = q.isGenerated
                          ? `${BACKEND_URL}/assets/${displayCategory}/${displayCategory}_${imageIndex}.png?t=${q.timestamp || Date.now()}`
                          : `/images/${displayCategory}_${imageIndex}.png`;

                        return (
                          <div
                            key={`${q.id}-${i}-${q.timestamp}`}
                            className="preview-image-wrapper"
                          >
                            {!isLoading && (
                              <img
                                src={imagePath}
                                alt={`${displayCategory} ${imageIndex}`}
                                className="preview-image"
                                onLoad={() => {
                                  console.log(`✓ Loaded: ${imagePath}`);
                                }}
                                onError={(e) => {
                                  console.error(
                                    `✗ Failed to load: ${imagePath}`,
                                  );
                                }}
                              />
                            )}
                            {isLoading && <div className="image-loading"></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
