// Home.jsx
import ImageSelectionCard from "../components/ImageSelectionCard";
import QuestionCard from "../components/QuestionCard";
import { useEffect, useMemo, useState } from "react";
import "../css/Home.css";

const SURVEY_QUESTIONS = [
  { id: 1, text: "How was your overall experience?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 2, text: "How likely are you to recommend us?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 3, text: "How was the speed of service?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 4, text: "How was your overall experience?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 5, text: "How likely are you to recommend us?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 6, text: "How was the speed of service?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 7, text: "How was your overall experience?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 8, text: "How likely are you to recommend us?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
  { id: 9, text: "How was the speed of service?", images: ["/images/Tree1.png","/images/Tree2.png","/images/Tree3.png","/images/Tree4.png","/images/Tree5.png"] },
];

const ANIM_MS = 720;

export default function Home() {
  const total = SURVEY_QUESTIONS.length;
  const last = total - 1;

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | leaving | entering
  const [dir, setDir] = useState("next"); // next | prev

  const [saved, setSaved] = useState(() => Array(total).fill(null));
  const [picked, setPicked] = useState(null); // current question selection (not yet saved unless OK/Save)

  const q = SURVEY_QUESTIONS[idx];

  useEffect(() => {
    setPicked(saved[idx] ?? null);
  }, [idx, saved]);

  const busy = phase !== "idle";
  const canPrev = idx > 0 && !busy;
  const canNext = !busy && Boolean(picked);

  //const progress = useMemo(() => `Question ${idx + 1} of ${total}`, [idx, total]);
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
    if (idx === last) return; // Save on last question
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

  return (
    <div className="homePage">
      <div className="homeLayout">
        {/* LEFT: Question stage + buttons (buttons are NOT part of stage height) */}
        <section className="surveyArea">
          <div className="stageViewport" aria-live="polite">
            <div className={`stageMotion ${phase} ${dir}`}>
              <QuestionCard
                key={q.id}
                question={q.text}
                imageSelectionCard={
                  <ImageSelectionCard
                    img1={q.images[0]}
                    img2={q.images[1]}
                    img3={q.images[2]}
                    img4={q.images[3]}
                    img5={q.images[4]}
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
                <button className="btn secondary" type="button" onClick={onPrev} disabled={!canPrev}>
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

        {/* RIGHT: Shelf equals stage height and aligns horizontally */}
        <aside className="shelfPanel" aria-label="Selections shelf">
          <header className="shelfHeader">
            <div className="shelfTitle">Landscape Shelf</div>
            <div className="shelfMeta">
              Saved: <b>{answered}</b> / {total}
            </div>
          </header>

          <div className="shelfGrid" role="list">
            {saved.map((src, i) => (
              <div key={i} className={`shelfItem ${src ? "has" : ""}`} role="listitem">
                <div className="shelfItemTop">
                  <div className="shelfQ">Q{i + 1}</div>
                  <div className={`shelfStatus ${src ? "done" : ""}`}>{src ? "Selected" : "Empty"}</div>
                </div>

                <div className="shelfThumb">
                  {src ? <img src={src} alt={`Selection for question ${i + 1}`} /> : <div className="shelfThumbEmpty">—</div>}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
