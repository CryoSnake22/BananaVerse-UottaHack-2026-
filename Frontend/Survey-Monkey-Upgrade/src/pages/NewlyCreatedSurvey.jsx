import ImageSelectionCard from "../components/ImageSelectionCard";
import QuestionCard from "../components/QuestionCard";
import PersonalInfoCard from "../components/PersonalInfoCard";
import { useEffect, useMemo, useState } from "react";
import "../css/PrototypeSurvey.css";
import { useSearchParams } from "react-router-dom";

const ANIM_MS = 720;
const API_BASE_URL = "http://localhost:8000";

function NewlyCreatedSurvey() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("id");

  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [error, setError] = useState("");

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [dir, setDir] = useState("next");
  const [saved, setSaved] = useState([]);
  const [picked, setPicked] = useState(null);

  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // New states for API and image display
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!surveyId) {
      setError("Missing survey id in the link.");
      return;
    }
    const storageKey = `survey_${surveyId}`;
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      setError("Survey not found in local storage.");
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        setSurveyQuestions(parsed);
        setSurveyTitle("Untitled Survey");
        setSaved(Array(parsed.length).fill(null));
      } else {
        setSurveyTitle(parsed.title || "Untitled Survey");
        setSurveyQuestions(parsed.questions || []);
        setSaved(Array((parsed.questions || []).length).fill(null));
      }

      setError("");
    } catch (err) {
      setError("Survey data is corrupted");
      console.log(err);
    }
  }, [surveyId]);

  const total = surveyQuestions.length;
  const last = total - 1;
  const q = surveyQuestions[idx];

  useEffect(() => {
    if (saved.length > 0) {
      setPicked(saved[idx] ?? null);
    }
  }, [idx, saved]);

  useEffect(() => {
    if (!hasAcknowledged) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [hasAcknowledged]);

  const busy = phase !== "idle";
  const canPrev = idx > 0 && !busy;
  const canNext = !busy && Boolean(picked);

  const answered = useMemo(() => saved.filter(Boolean).length, [saved]);

  const commit = () => {
    if (!picked) return;
    setSaved((prev) => {
      const next = prev.slice();
      next[idx] = picked;
      return next;
    });
  };

  const go = (nextIdx, nextDir) => {
    if (busy) return;
    setDir(nextDir);
    setPhase("leaving");

    window.setTimeout(() => {
      setIdx(nextIdx);
      setPhase("entering");
      window.setTimeout(() => setPhase("idle"), ANIM_MS);
    }, ANIM_MS);
  };

  const getScoreFromImagePath = (imagePath) => {
    if (!imagePath) return null;
    const match = imagePath.match(/(\d+)\.png$/);
    return match ? parseInt(match[1]) : null;
  };

  const handleSubmitWithData = async (savedData) => {
    console.log("handleSubmitWithData called!");
    setIsLoading(true);

    try {
      const surveyData = surveyQuestions.map((question, index) => {
        const selectedImage = savedData[index];
        const score = getScoreFromImagePath(selectedImage);
        return {
          category: question.category,
          score: score || 1,
        };
      });

      console.log("Sending survey data:", surveyData);

      const response = await fetch(`${API_BASE_URL}/generate-landscape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate landscape";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("API response:", result);

      const imageUrl = `${API_BASE_URL}/${result.final_image_path}`;
      console.log("Generated image URL:", imageUrl);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error("Error generating landscape:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onNext = () => {
    console.log("onNext called, idx:", idx, "last:", last, "canNext:", canNext);

    if (!canNext) return;

    if (idx === last) {
      console.log("On last question, preparing to submit");
      const updatedSaved = saved.slice();
      updatedSaved[idx] = picked;
      setSaved(updatedSaved);

      console.log("Calling handleSubmitWithData with:", updatedSaved);
      handleSubmitWithData(updatedSaved);
      return;
    }

    commit();
    go(idx + 1, "next");
  };

  const onPrev = () => {
    if (!canPrev) return;
    go(idx - 1, "prev");
  };

  const onClear = () => {
    setIdx(0);
    setPhase("idle");
    setDir("next");
    setSaved(Array(total).fill(null));
    setPicked(null);
    setGeneratedImageUrl(null);
  };

  if (error) return <div className="">{error}</div>;

  if (!q) return <div>Loading...</div>;

  if (generatedImageUrl) {
    return <PersonalInfoCard backgroundImage={generatedImageUrl} />;
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <h2>Generating your landscape...</h2>
        <p>This may take a moment</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`homePage ${!hasAcknowledged ? "is-locked" : ""}`}>
      {!hasAcknowledged && (
        <div
          className="gateOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gateTitle"
        >
          <div className="gateModal">
            <div className="gateBadge">Before you start</div>

            <h2 id="gateTitle" className="gateTitle">
              Welcome to a survey in the BananaVerse!🍌
            </h2>

            <p className="gateText">
              Give us a PICTURE of your experience by choosing elements that
              shape your very own AI-generated BananaScape Landscape.
            </p>

            <ul className="gateList">
              <li>Pick the image the feels right per question</li>
              <li>Go back and change your landscape elements</li>
              <li>Your “Landscape Shelf” fills as you go</li>
            </ul>

            <div className="gateActions">
              <button
                className="btn primary gateBtn"
                type="button"
                onClick={() => setHasAcknowledged(true)}
                autoFocus
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pageContent">
        <div className="survey-title-header">
          <h1 className="survey-title">{surveyTitle}</h1>
        </div>

        <div className="homeLayout">
          <section className="surveyArea">
            <div className="stageViewport" aria-live="polite">
              <div className={`stageMotion ${phase} ${dir}`}>
                <QuestionCard
                  key={q.id}
                  question={q.text}
                  imageSelectionCard={
                    <ImageSelectionCard
                      img1={q.images?.[0]}
                      img2={q.images?.[1]}
                      img3={q.images?.[2]}
                      img4={q.images?.[3]}
                      img5={q.images?.[4]}
                      value={picked}
                      onSelectionChange={setPicked}
                    />
                  }
                />
              </div>
            </div>

            <div className="actions">
              <div className="actionsRow">
                <button
                  className="btn secondary"
                  type="button"
                  onClick={onClear}
                >
                  Clear Form
                </button>

                <div className="navGroup">
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={onPrev}
                    disabled={!canPrev}
                  >
                    Previous
                  </button>

                  <button
                    className="btn primary"
                    type="button"
                    onClick={onNext}
                    disabled={!canNext}
                    title={!picked ? "Pick an image first" : ""}
                  >
                    {idx === last ? "Submit" : "OK"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="shelfPanel" aria-label="Selections shelf">
            <header className="shelfHeader">
              <div className="shelfTitle">Landscape Shelf</div>
              <div className="shelfMeta">
                Saved: <b>{answered}</b> / {total}
              </div>
            </header>

            <div className="shelfGrid" role="list">
              {saved.map((src, i) => (
                <div
                  key={i}
                  className={`shelfItem ${src ? "has" : ""}`}
                  role="listitem"
                >
                  <div className="shelfItemTop">
                    <div className="shelfQ">Q{i + 1}</div>
                    <div className={`shelfStatus ${src ? "done" : ""}`}>
                      {src ? "Selected" : "Empty"}
                    </div>
                  </div>

                  <div className="shelfThumb">
                    {src ? (
                      <img src={src} alt={`Selection for question ${i + 1}`} />
                    ) : (
                      <div className="shelfThumbEmpty">—</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default NewlyCreatedSurvey;
