
import json
import re

# Keywords for sentiment analysis (simplified heuristic for demo)
POSITIVE_WORDS = ["growth", "resilient", "optimistic", "bullish", "recovery", "expansion", "support", "gains", "upgrade", "opportunity", "strong"]
NEGATIVE_WORDS = ["recession", "slowdown", "weak", "downside", "risk", "inflation", "tariff", "uncertainty", "volatility", "concern", "drag", "challenge"]

# Tags to auto-detect
TOPICS = {
    "AI & Tech": ["AI", "artificial intelligence", "tech", "productivity", "nvidia", "capex"],
    "Policy": ["fiscal", "monetary", "fed", "central bank", "rate cut", "stimulus", "deficit"],
    "Geopolitics": ["tariff", "trade war", "china", "geopolitical", "fragmentation", "protectionism"],
    "Markets": ["equities", "stocks", "bonds", "sp500", "yield", "credit", "valuation"]
}

def analyze_sentiment(text):
    text = text.lower()
    score = 0
    for word in POSITIVE_WORDS:
        score += text.count(word)
    for word in NEGATIVE_WORDS:
        score -= text.count(word)
    
    # Normalize roughly between -1 and 1
    normalized = max(min(score / 5, 1), -1)
    
    if normalized > 0.2: return "Bullish", normalized
    if normalized < -0.2: return "Bearish", normalized
    return "Neutral", normalized

def extract_metric(text, pattern):
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

def extract_tags(text):
    text = text.lower()
    found_tags = []
    for tag, keywords in TOPICS.items():
        if any(k in text for k in keywords):
            found_tags.append(tag)
    return found_tags

def process_data(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Handle structure variations (Sheet1 vs direct list)
    items = []
    if isinstance(data, dict):
        for key, val in data.items():
            if isinstance(val, list):
                items.extend(val)
    elif isinstance(data, list):
        items = data

    enriched_items = []
    
    print(f"Processing {len(items)} items...")

    for item in items:
        # Clone item
        new_item = item.copy()
        text = str(item.get("Call_text", ""))
        
        # 1. Sentiment Analysis
        sentiment_label, sentiment_score = analyze_sentiment(text)
        new_item["sentiment_label"] = sentiment_label
        new_item["sentiment_score"] = sentiment_score
        
        # 2. Key Metrics Extraction (GDP, Inflation)
        # Look for patterns like "GDP ... 2.5%"
        gdp_match = extract_metric(text, r"(?:GDP|growth).*?(\d+(?:\.\d+)?%)")
        inflation_match = extract_metric(text, r"(?:inflation|CPI|PCE).*?(\d+(?:\.\d+)?%)")
        
        new_item["extracted_gdp"] = gdp_match
        new_item["extracted_inflation"] = inflation_match
        
        # 3. Topic Tagging
        new_item["tags"] = extract_tags(text)
        
        enriched_items.append(new_item)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enriched_items, f, indent=2)
    
    print(f"Enriched data saved to {output_file}")

if __name__ == "__main__":
    process_data('lib/data/outlook_2026_full.json', 'lib/data/outlook_2026_enriched.json')
