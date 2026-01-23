import json

# Read the survey data
with open('public/data/survey-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Process each question
for question in data:
    # Remove Capital Economics from responses
    original_count = len(question['responses'])
    question['responses'] = [r for r in question['responses'] if r['institution'] != 'Capital Economics']
    
    # Recalculate stats
    new_stats = {}
    for response in question['responses']:
        answer = response['answer']
        new_stats[answer] = new_stats.get(answer, 0) + 1
    
    question['stats'] = new_stats

# Write back the updated data
with open('public/data/survey-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✓ Capital Economics removed from all questions")
print(f"✓ Total questions processed: {len(data)}")
