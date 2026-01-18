import { useState, useEffect } from "react";

export default function AiPanel({ question, theme }) {
  const [aiText, setAiText] = useState("");

  useEffect(() => {
    if (!question || !theme) return;

    async function fetchAiPun() {
      try {
        const res = await fetch("http://localhost:8000/generate-pun", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, theme }),
        });
        const data = await res.json();
        setAiText(data.pun);
      } catch (err) {
        console.error(err);
        setAiText("");
      }
    }

    fetchAiPun();
  }, [question, theme]);

  return (
    <aside className="aiPanel" aria-label="AI assistant">
      <div className="aiCharacter">
        <img src="/images/ai_bot.png" alt="AI assistant" />
        <div className="aiBubble">{aiText}</div>
      </div>
    </aside>
  );
}