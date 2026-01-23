import json
with open('public/data/survey-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Check a few questions to verify
for q in data[:3]:
    print(f"Q{q['id']}: {q['stats']} - {len(q['responses'])} respuestas")
    # Check if Capital Economics is still there
    has_capital = any(r['institution'] == 'Capital Economics' for r in q['responses'])
    print(f"  Capital Economics still present: {has_capital}")
    print()
