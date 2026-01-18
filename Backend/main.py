import os
import sys
from pathlib import Path
from typing import TypedDict
from langgraph.graph import StateGraph, END
from google import genai
from PIL import Image
from dotenv import load_dotenv

# ---------------------------------------
# Gemini setup
# ---------------------------------------
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)


# ---------------------------------------
# State definition
# ---------------------------------------
class AssetState(TypedDict):
    thing: str
    current_stage: int
    prompts: list[str]
    image_paths: list[str]
    output_dir: str
    error: str | None


# ---------------------------------------
# Prompt templates
# ---------------------------------------
STAGE_PROMPTS = {
    1: """Square image (1:1)
flat 2D digital illustration
storybook fantasy style
soft painterly brush texture
muted, cold, or neutral palette appropriate for the {thing}
no photorealism
no outlines

Depict the {thing} in its weakest, most desolate, damaged, inactive, or deteriorated possible form.
This is Stage 1, the absolute lowest point.

Strict rules:
• Atmosphere must feel bleak: cold light, fog, dull colors, dryness, stillness, or exhaustion
• Damage, decay, or lifelessness must be at their maximum level appropriate to the {thing}
• No signs of vitality, stability, warmth, or strength
• No positive lighting, no warm tones, no saturation
• Composition, silhouette, camera angle, and framing must be clean, simple, and readable
• This image becomes the locked visual reference for all future stages
""",
    2: """Use the previous image as the direct visual reference.
Preserve the exact silhouette, shapes, proportions, camera angle, framing, layout, and art style.
No structural changes whatsoever.

Apply a **clear but still moderate improvement (20–25 percent)**:
• noticeably softer lighting that reduces the bleakness of Stage 1
• visible reduction of decay, damage, or dryness (NOT fully healed, but clearly less broken)
• add gentle warmth to the palette (5–10 percent saturation)
• shadows become less harsh and less cold
• textures look slightly smoother and more stable
• subtle hints of returning life or energy appropriate to the {thing}

This must still feel early in the recovery, but **visibly better** than Stage 1 on first glance.
Absolutely monotonic progression — no new elements, no geometric changes.
""",
    3: """Use the previous image as the direct visual reference.
Preserve the exact silhouette, shapes, proportions, camera angle, framing, layout, and art style.

Apply moderate improvement (20–25 percent):
• colors become noticeably richer but still soft
• surface damage is clearly reduced but not fully gone
• lighting becomes warmer and more balanced
• textures appear smoother, healthier, or more stable
• early signs of vitality or regrowth appropriate to the {thing}

This stage represents “recovering but not yet thriving”.
All changes must extend Stage 2 and remain monotonic, with no new elements added.
""",
    4: """Use the previous image as the direct visual reference.
Preserve the exact silhouette, shapes, proportions, camera angle, framing, layout, and art style.

Apply major improvement (25–30 percent):
• colors become lively but remain consistent with palette
• lighting becomes distinctly warm, bright, and uplifting
• textures appear clean, healthy, renewed, or fully repaired
• the {thing} should look strong, healthy, balanced, and visually appealing

This is the near-final restored form of the {thing}:
fully functional, beautiful, and alive, but still missing its final signature flourish.
Progress must be strictly monotonic — an amplification of Stage 3, never a redesign.
""",
    5: """Use the previous image as the direct visual reference.
Preserve the exact silhouette, shapes, proportions, camera angle, framing, layout, and art style.

Apply the final improvement (the last 20–25 percent):
• most saturated, vibrant, and harmonious natural colors
• warmest and cleanest lighting
• zero damage or decay remaining — everything fully healed or restored
• maximum vitality, energy, clarity, and expressiveness

Introduce exactly ONE subtle spark element appropriate to the {thing}:
• small bird or butterfly (nature)
• glowing fruit, flower cluster, or fresh leaves (plants)
• soft magical shimmer or highlight (objects or artifacts)
• a gentle beam of sunlight or miniature rainbow (landscapes)
• a clean, bright specular highlight (inanimate objects)

The spark must be subtle, painterly, and feel like a natural culmination of Stage 4.
This is the fully repaired, healthiest, final peak version of the {thing}.
""",
}
# STAGE_PROMPTS = {
#     1: """Square image (1:1)
# flat 2D digital illustration
# storybook fantasy style
# soft painterly brush texture
# muted, cold, or neutral palette appropriate for the {thing}
# no photorealism
# no outlines
#
# Depict the {thing} in its weakest, most desolate, damaged, inactive, or deteriorated possible form.
# This is Stage 1, the *lowest point*.
#
# Strict rules:
# • Bleak atmosphere: cold light, fog, dull color, dryness, or exhaustion appropriate to the {thing}
# • No signs of vitality or strength
# • No positive lighting or saturation
# • Composition, silhouette, camera angle, and framing must be simple and clear
# • This becomes the exact visual reference for all future stages
# """,
#     2: """Use the previous image as the direct reference.
# Preserve the exact composition, silhouette, camera angle, proportions, framing, and art style.
# Make no structural changes. Do not alter shapes, layout, or perspective.
#
# Apply only micro improvements (about 20 percent change):
# • slightly softer lighting
# • slightly reduced harshness or decay
# • extremely subtle hints of color or warmth (2–5 percent saturation)
# • barely noticeable smoothing of textures
#
# Atmosphere remains mostly bleak, but with the faintest suggestion of improvement.
# All changes must be gradual, minimal, and monotonic — no sudden jumps.
# """,
#     3: """Use the previous image as the direct reference.
# Preserve the exact composition, silhouette, camera angle, proportions, framing, and art style.
# Make no structural or geometric changes.
#
# Apply moderate improvement (around 20 percent change):
# • noticeably richer color, but still soft and natural
# • smoother, more harmonious textures
# • warmer, balanced lighting
# • early signs of healing, growth, or stability appropriate to the {thing}
#
# The scene should feel calm and clearly healthier than Stage 2, but still gentle.
# All changes must be strictly monotonic and extend Stage 2 without introducing new elements.
# """,
#     4: """Use the previous image as the direct reference.
# Preserve the exact composition, silhouette, camera angle, proportions, framing, and art style.
# No structural changes of any kind.
#
# Apply large improvement (20 percent change):
# • bright, lively, healthy, restored, or joyful appearance
# • painterly, vibrant colors that remain consistent with the established palette
# • strong warm natural lighting
# • textures feel clean, strong, and harmonious
#
# This is the near-final version of the {thing}:
# very alive and expressive but still missing its final spark.
# Changes must remain monotonic — an amplification of Stage 3, not a reset.
# """,
#     5: """Use the previous image as the direct reference.
# Preserve the exact composition, silhouette, camera angle, proportions, framing, and art style.
# Do not change shapes, layout, or geometry.
#
# Apply final improvement (remaining 20 percent):
# • richest, most vibrant natural colors
# • warmest lighting
# • fully alive, restored, joyful, or powerful version of the {thing}
#
# Introduce exactly one subtle spark element appropriate to the {thing}:
# • a small bird or butterfly (nature scenes)
# • a glowing fruit or cluster of flowers (plants)
# • a soft magical shimmer (artifacts or crystals)
# • a pastel rainbow or gentle sunbeam (landscape or sky)
# • a single bright specular highlight (objects)
#
# The spark must be subtle, painterly, and feel like a natural culmination of Stage 4.
# This is the absolute peak state — the final, most expressive version of the {thing}.
# """,
# }


# ---------------------------------------
# Workflow nodes
# ---------------------------------------
def initialize_state(state: AssetState) -> AssetState:
    print(f"🌱 Initializing asset generation for: {state['thing']}")

    output_dir = Path("assets") / state["thing"]
    output_dir.mkdir(parents=True, exist_ok=True)

    state["output_dir"] = str(output_dir)
    state["current_stage"] = 1
    state["prompts"] = []
    state["image_paths"] = []
    state["error"] = None
    return state


def generate_image(state: AssetState) -> AssetState:
    stage = state["current_stage"]
    print(f"🎨 Generating stage {stage}/5")

    try:
        prompt = STAGE_PROMPTS[stage].format(thing=state["thing"])
        state["prompts"].append(prompt)

        contents = [prompt]

        if stage > 1:
            prev_img = Image.open(state["image_paths"][-1])
            contents.append(prev_img)

        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=contents,
        )

        output_path = Path(state["output_dir"]) / f"{state['thing']}_{stage}.png"

        for part in response.candidates[0].content.parts:
            if part.inline_data:
                img = part.as_image()
                img.save(output_path)
                state["image_paths"].append(str(output_path))
                print(f"✅ Saved {output_path}")
                return state

        raise RuntimeError("No image returned")

    except Exception as e:
        state["error"] = f"Stage {stage} failed: {e}"
        print(f"❌ {state['error']}")
        return state


def increment_stage(state: AssetState) -> AssetState:
    state["current_stage"] += 1
    return state


def check_completion(state: AssetState) -> str:
    if state["error"] or state["current_stage"] > 5:
        return "end"
    return "continue"


def finalize(state: AssetState) -> AssetState:
    if state["error"]:
        print(f"\n❌ Failed: {state['error']}")
    else:
        print("\n✨ All 5 stages complete!")
        print(f"📁 Output: {state['output_dir']}")
    return state


# ---------------------------------------
# Workflow construction
# ---------------------------------------
def create_workflow():
    g = StateGraph(AssetState)

    g.add_node("initialize", initialize_state)
    g.add_node("generate", generate_image)
    g.add_node("increment", increment_stage)
    g.add_node("finalize", finalize)

    g.set_entry_point("initialize")
    g.add_edge("initialize", "generate")
    g.add_edge("generate", "increment")

    g.add_conditional_edges(
        "increment",
        check_completion,
        {"continue": "generate", "end": "finalize"},
    )

    g.add_edge("finalize", END)
    return g.compile()


# ---------------------------------------
# Entry point
# ---------------------------------------
def generate_asset_progression(thing: str):
    initial_state: AssetState = {
        "thing": thing,
        "current_stage": 1,
        "prompts": [],
        "image_paths": [],
        "output_dir": "",
        "error": None,
    }

    app = create_workflow()
    return app.invoke(initial_state)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python main.py "tree"')
        sys.exit(1)

    thing = sys.argv[1]
    result = generate_asset_progression(thing)

    if not result["error"]:
        print(f"\n🎉 Generated {len(result['image_paths'])} images")
