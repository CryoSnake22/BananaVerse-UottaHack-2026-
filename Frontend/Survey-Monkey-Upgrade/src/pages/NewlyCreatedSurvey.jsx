import ImageSelectionCard from "../components/ImageSelectionCard";
import QuestionCard from "../components/QuestionCard";
import { useEffect, useMemo, useState } from "react";
import "../css/PrototypeSurvey.css";
import { useSearchParams } from "react-router-dom";

const ANIM_MS = 720;

function NewlyCreatedSurvey() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("id");
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [error, setError] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [dir, setDir] = useState("next");
  const [saved, setSaved] = useState([]);
  const [picked, setPicked] = useState(null);

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
      setSurveyQuestions(parsed);
      setSaved(Array(parsed.length).fill(null));
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

  const onNext = () => {
    if (!canNext) return;
    commit();
    if (idx === last) return;
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
  };

  if (error) return <div className="">{error}</div>;
  
  // Don't render until we have survey data
  if (!q) return <div>Loading...</div>;

  return (
    <div className="homePage">
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
              <button className="btn secondary" type="button" onClick={onClear}>
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
                  {idx === last ? "Save" : "OK"}
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
  );
}

export default NewlyCreatedSurvey;