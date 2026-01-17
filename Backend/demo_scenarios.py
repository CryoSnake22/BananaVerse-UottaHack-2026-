"""
Demo scenarios for the survey landscape generator.
Run these to see different types of emotional contrasts.
"""

from survey_landscape import generate_survey_landscape
import json

# Scenario presets
SCENARIOS = {
    "extreme_contrast": {
        "description": "Maximum emotional contrast - despair meets perfection",
        "data": [
            {"category": "dog", "score": 1},
            {"category": "sky", "score": 5},
        ],
    },
    "gradient": {
        "description": "Smooth progression from desolate to perfect",
        "data": [
            {"category": "foreground rocks", "score": 1},
            {"category": "mid grass", "score": 2},
            {"category": "trees", "score": 3},
            {"category": "clouds", "score": 4},
            {"category": "sun", "score": 5},
        ],
    },
    "chaotic": {
        "description": "Random scattered scores - dreamlike chaos",
        "data": [
            {"category": "house", "score": 1},
            {"category": "garden", "score": 5},
            {"category": "path", "score": 2},
            {"category": "sky", "score": 5},
            {"category": "fence", "score": 1},
            {"category": "tree", "score": 3},
        ],
    },
    "depression_vs_hope": {
        "description": "Inner turmoil - dark self, bright surroundings",
        "data": [
            {"category": "person sitting", "score": 1},
            {"category": "flowers around them", "score": 5},
            {"category": "butterflies", "score": 5},
            {"category": "sunshine", "score": 5},
        ],
    },
    "dying_world": {
        "description": "Apocalyptic - everything declining",
        "data": [
            {"category": "trees", "score": 1},
            {"category": "grass", "score": 1},
            {"category": "sky", "score": 2},
            {"category": "sun", "score": 1},
            {"category": "animals", "score": 1},
        ],
    },
    "paradise": {
        "description": "Everything perfect and thriving",
        "data": [
            {"category": "mountains", "score": 5},
            {"category": "waterfall", "score": 5},
            {"category": "meadow", "score": 5},
            {"category": "sky", "score": 5},
            {"category": "rainbow", "score": 5},
        ],
    },
    "mixed_health": {
        "description": "Some things thrive, others struggle - like real life",
        "data": [
            {"category": "old oak tree", "score": 2},
            {"category": "young saplings", "score": 4},
            {"category": "wildflowers", "score": 5},
            {"category": "pond", "score": 3},
            {"category": "shed", "score": 1},
        ],
    },
}


def run_scenario(scenario_name: str):
    """Run a specific scenario by name"""
    if scenario_name not in SCENARIOS:
        print(f"❌ Unknown scenario: {scenario_name}")
        print(f"Available: {', '.join(SCENARIOS.keys())}")
        return

    scenario = SCENARIOS[scenario_name]
    print(f"\n{'=' * 60}")
    print(f"🎬 SCENARIO: {scenario_name}")
    print(f"📝 {scenario['description']}")
    print(f"{'=' * 60}\n")

    print("Survey items:")
    for item in scenario["data"]:
        print(f"  • {item['category']}: {item['score']}/5")
    print()

    result = generate_survey_landscape(scenario["data"])

    if result["error"]:
        print(f"\n❌ Scenario failed: {result['error']}")
    else:
        print(f"\n✅ Scenario complete!")
        print(f"View the result at: {result['final_image_path']}")


def list_scenarios():
    """Display all available scenarios"""
    print("\n📋 Available Scenarios:\n")
    for name, scenario in SCENARIOS.items():
        print(f"  {name:20} - {scenario['description']}")
        print(f"                       ({len(scenario['data'])} elements)")
        print()


def save_scenario_to_json(scenario_name: str, filename: str):
    """Save a scenario to a JSON file"""
    if scenario_name not in SCENARIOS:
        print(f"❌ Unknown scenario: {scenario_name}")
        return

    with open(filename, "w") as f:
        json.dump(SCENARIOS[scenario_name]["data"], f, indent=2)
    print(f"✅ Saved scenario '{scenario_name}' to {filename}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python demo_scenarios.py list                    # List all scenarios")
        print("  python demo_scenarios.py run <scenario_name>     # Run a scenario")
        print(
            "  python demo_scenarios.py save <scenario_name> <file.json>  # Save to file"
        )
        print("\nExample:")
        print("  python demo_scenarios.py run extreme_contrast")
        sys.exit(0)

    command = sys.argv[1]

    if command == "list":
        list_scenarios()

    elif command == "run":
        if len(sys.argv) < 3:
            print("❌ Please specify a scenario name")
            list_scenarios()
            sys.exit(1)
        run_scenario(sys.argv[2])

    elif command == "save":
        if len(sys.argv) < 4:
            print("❌ Please specify scenario name and output file")
            sys.exit(1)
        save_scenario_to_json(sys.argv[2], sys.argv[3])

    else:
        print(f"❌ Unknown command: {command}")
        print("Use 'list', 'run', or 'save'")
        sys.exit(1)
