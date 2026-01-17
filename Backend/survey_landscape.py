import os
import sys
import json
from pathlib import Path
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from google import genai
from PIL import Image
from dotenv import load_dotenv

# ---------------------------------------
# Gemini setup
# ---------------------------------------
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY)


# ---------------------------------------
# State definition
# ---------------------------------------
class SurveyItem(TypedDict):
    category: str
    score: int


class LandscapeState(TypedDict):
    survey_answers: List[SurveyItem]
    current_index: int
    element_prompts: list[str]
    element_images: list[str]
    final_prompt: str
    final_image_path: str
    output_dir: str
    error: str | None


# ---------------------------------------
# Scoring templates for individual elements
# ---------------------------------------
def generate_element_prompt(category: str, score: int) -> str:
    """
    Generate a prompt for a single element based on its score (1-5).
    Score 1 = weakest/most deteriorated
    Score 5 = strongest/most vibrant
    """

    # Base visual style that's consistent across all elements
    base_style = """Flat 2D digital illustration
storybook fantasy style
soft painterly brush texture
no photorealism
no harsh outlines
clean isolated element suitable for compositing
"""

    # Score-specific modifiers
    score_modifiers = {
        1: {
            "atmosphere": "bleak, desolate, deteriorated, damaged, weakest possible form",
            "lighting": "cold harsh light, fog, shadows, darkness",
            "color": "muted, dull, desaturated, gray, cold tones, almost monochrome",
            "condition": "withered, broken, dying, exhausted, depleted, rotting",
            "mood": "hopeless, abandoned, lifeless, empty",
        },
        2: {
            "atmosphere": "struggling, barely surviving, still quite weak",
            "lighting": "dim light, heavy overcast, faint glow",
            "color": "mostly muted with tiny hints of color (5-10% saturation)",
            "condition": "damaged but stabilizing, scarred, barely functioning",
            "mood": "somber, quiet despair, faint glimmer of survival",
        },
        3: {
            "atmosphere": "neutral, stable, average, balanced",
            "lighting": "soft even lighting, gentle clouds, moderate brightness",
            "color": "natural colors at 40-50% saturation, balanced palette",
            "condition": "healthy but unremarkable, functional, ordinary",
            "mood": "calm, peaceful, steady, neither joyful nor sad",
        },
        4: {
            "atmosphere": "vibrant, lively, thriving, strong",
            "lighting": "warm sunlight, golden hour glow, bright natural light",
            "color": "rich saturated colors (70-80%), warm harmonious palette",
            "condition": "flourishing, energetic, robust, healthy",
            "mood": "joyful, alive, energetic, welcoming",
        },
        5: {
            "atmosphere": "peak perfection, radiant, absolutely thriving, most powerful form",
            "lighting": "brilliant warm light, magic hour, glowing, luminous",
            "color": "fully saturated vibrant colors (90-100%), rich warm palette",
            "condition": "pristine, perfect, glowing with life and energy, transcendent",
            "mood": "ecstatic, radiant joy, magical, sublime",
            "special": "subtle magical elements: soft sparkles, gentle light rays, small butterflies or birds (if appropriate), ethereal glow",
        },
    }

    mods = score_modifiers[score]

    prompt = f"""{base_style}

Category: {category}
Score: {score}/5

Visual Requirements:
• Atmosphere: {mods["atmosphere"]}
• Lighting: {mods["lighting"]}
• Color palette: {mods["color"]}
• Condition: {mods["condition"]}
• Emotional mood: {mods["mood"]}
"""

    if score == 5 and "special" in mods:
        prompt += f"• Special touches: {mods['special']}\n"

    prompt += f"""
Depict the {category} with these exact qualities.
Keep the {category} as the clear focal point.
Use simple, clear composition that will work in a larger landscape.
The {category} should be immediately recognizable and emotionally expressive.
"""

    return prompt


# ---------------------------------------
# Workflow nodes
# ---------------------------------------
def initialize_state(state: LandscapeState) -> LandscapeState:
    print(
        f"🌍 Initializing landscape generation from {len(state['survey_answers'])} survey items"
    )

    output_dir = Path("landscapes") / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    state["output_dir"] = str(output_dir)
    state["current_index"] = 0
    state["element_prompts"] = []
    state["element_images"] = []
    state["final_prompt"] = ""
    state["final_image_path"] = ""
    state["error"] = None
    return state


def generate_element_image(state: LandscapeState) -> LandscapeState:
    """Generate an individual element based on its survey score"""
    idx = state["current_index"]
    item = state["survey_answers"][idx]

    print(
        f"\n🎨 Generating element {idx + 1}/{len(state['survey_answers'])}: {item['category']} (score: {item['score']})"
    )

    try:
        prompt = generate_element_prompt(item["category"], item["score"])
        state["element_prompts"].append(prompt)

        print(f"   Prompt: {prompt[:100]}...")

        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt],
        )

        output_path = (
            Path(state["output_dir"])
            / f"element_{idx}_{item['category']}_score{item['score']}.png"
        )

        for part in response.candidates[0].content.parts:
            if part.inline_data:
                img = part.as_image()
                img.save(output_path)
                state["element_images"].append(str(output_path))
                print(f"   ✅ Saved {output_path.name}")
                return state

        raise RuntimeError("No image returned")

    except Exception as e:
        state["error"] = f"Element {idx} ({item['category']}) failed: {e}"
        print(f"   ❌ {state['error']}")
        return state


def increment_index(state: LandscapeState) -> LandscapeState:
    state["current_index"] += 1
    return state


def check_elements_complete(state: LandscapeState) -> str:
    if state["error"]:
        return "error"
    if state["current_index"] >= len(state["survey_answers"]):
        return "done_with_elements"
    return "continue"


def create_composite_prompt(state: LandscapeState) -> LandscapeState:
    """Create the final prompt that combines all elements into one landscape"""
    print("\n🎭 Creating composite landscape prompt...")

    # Build descriptions of each element
    element_descriptions = []
    for i, item in enumerate(state["survey_answers"]):
        score = item["score"]
        category = item["category"]

        # Create vivid description based on score
        if score == 1:
            desc = f"a {category} that is utterly desolate, withered, broken, barely visible in harsh cold light with dull gray colors"
        elif score == 2:
            desc = f"a {category} that is struggling and damaged but surviving, with dim lighting and mostly muted colors"
        elif score == 3:
            desc = f"a {category} that is healthy and stable but unremarkable, with natural balanced colors and soft even lighting"
        elif score == 4:
            desc = f"a {category} that is vibrant and thriving, with warm golden sunlight and rich saturated colors"
        else:  # score == 5
            desc = f"a {category} that is absolutely radiant and perfect, glowing with brilliant warm light, fully saturated vibrant colors, and subtle magical touches"

        element_descriptions.append(desc)

    composite_prompt = f"""Create a cohesive landscape illustration that incorporates all of these elements:

{chr(10).join(f"{i + 1}. {desc}" for i, desc in enumerate(element_descriptions))}

Visual Style:
• Wide landscape format (16:9)
• Flat 2D digital illustration
• Storybook fantasy painterly style
• Soft brush textures, no photorealism
• Consistent art style throughout

CRITICAL COMPOSITION RULES:
• Each element MUST maintain its individual score-based appearance exactly as described
• A score-1 element stays bleak and deteriorated even next to score-5 elements
• A score-5 element stays radiant and perfect even next to score-1 elements
• CREATE CONTRAST - let harsh differences between elements be visible and striking
• DO NOT blend or homogenize the emotional tones
• Arrange elements naturally in a landscape but preserve their individual qualities

The goal is a surreal, emotionally varied landscape where:
- Vibrant elements shine brilliantly
- Deteriorated elements remain dark and withered
- The viewer can feel the emotional contrast between different parts
- Each element tells its own story while existing in the same world

Embrace the weirdness and contrast. Make it dreamlike and emotionally complex.
"""

    state["final_prompt"] = composite_prompt
    print("✅ Composite prompt created")
    return state


def generate_final_landscape(state: LandscapeState) -> LandscapeState:
    """Generate the final composite landscape using all reference images"""
    print("\n🖼️  Generating final composite landscape...")

    try:
        # Prepare contents: prompt + all element images as references
        contents = [state["final_prompt"]]

        print(f"   Using {len(state['element_images'])} reference images")
        for img_path in state["element_images"]:
            img = Image.open(img_path)
            contents.append(img)

        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=contents,
        )

        output_path = Path(state["output_dir"]) / "final_composite_landscape.png"

        for part in response.candidates[0].content.parts:
            if part.inline_data:
                img = part.as_image()
                img.save(output_path)
                state["final_image_path"] = str(output_path)
                print(f"   ✅ Saved final landscape: {output_path.name}")
                return state

        raise RuntimeError("No final image returned")

    except Exception as e:
        state["error"] = f"Final landscape generation failed: {e}"
        print(f"   ❌ {state['error']}")
        return state


def finalize(state: LandscapeState) -> LandscapeState:
    if state["error"]:
        print(f"\n❌ Failed: {state['error']}")
    else:
        print("\n✨ Landscape generation complete!")
        print(f"📁 Output directory: {state['output_dir']}")
        print(f"🎨 Generated {len(state['element_images'])} individual elements")
        print(f"🖼️  Final landscape: {state['final_image_path']}")
    return state


# ---------------------------------------
# Workflow construction
# ---------------------------------------
def create_workflow():
    g = StateGraph(LandscapeState)

    g.add_node("initialize", initialize_state)
    g.add_node("generate_element", generate_element_image)
    g.add_node("increment", increment_index)
    g.add_node("create_composite_prompt", create_composite_prompt)
    g.add_node("generate_final", generate_final_landscape)
    g.add_node("finalize", finalize)

    g.set_entry_point("initialize")
    g.add_edge("initialize", "generate_element")
    g.add_edge("generate_element", "increment")

    g.add_conditional_edges(
        "increment",
        check_elements_complete,
        {
            "continue": "generate_element",
            "done_with_elements": "create_composite_prompt",
            "error": "finalize",
        },
    )

    g.add_edge("create_composite_prompt", "generate_final")
    g.add_edge("generate_final", "finalize")
    g.add_edge("finalize", END)

    return g.compile()


# ---------------------------------------
# Entry point
# ---------------------------------------
def generate_survey_landscape(survey_answers: List[SurveyItem]):
    """
    Main function to generate a composite landscape from survey answers.

    Args:
        survey_answers: List of dicts with 'category' and 'score' (1-5)

    Example:
        survey_answers = [
            {"category": "dog", "score": 1},
            {"category": "sky", "score": 5},
            {"category": "tree", "score": 3}
        ]
    """
    initial_state: LandscapeState = {
        "survey_answers": survey_answers,
        "current_index": 0,
        "element_prompts": [],
        "element_images": [],
        "final_prompt": "",
        "final_image_path": "",
        "output_dir": "",
        "error": None,
    }

    app = create_workflow()
    return app.invoke(initial_state)


if __name__ == "__main__":
    # Example usage with command line JSON input
    if len(sys.argv) < 2:
        print(
            'Usage: python survey_landscape.py \'[{"category":"dog","score":1},{"category":"sky","score":5}]\''
        )
        print("Or: python survey_landscape.py survey_answers.json")
        sys.exit(1)

    # Try to parse as JSON directly or load from file
    input_arg = sys.argv[1]

    try:
        if input_arg.endswith(".json"):
            with open(input_arg, "r") as f:
                survey_answers = json.load(f)
        else:
            survey_answers = json.loads(input_arg)

        # Validate input
        for item in survey_answers:
            if "category" not in item or "score" not in item:
                raise ValueError("Each survey item must have 'category' and 'score'")
            if not 1 <= item["score"] <= 5:
                raise ValueError(f"Score must be 1-5, got {item['score']}")

        result = generate_survey_landscape(survey_answers)

        if not result["error"]:
            print(f"\n🎉 Successfully generated composite landscape!")
            print(f"   Elements: {len(result['element_images'])}")
            print(f"   Final image: {result['final_image_path']}")

    except json.JSONDecodeError:
        print("❌ Invalid JSON format")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
