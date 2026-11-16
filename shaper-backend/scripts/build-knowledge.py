"""Regenerate src/knowledge/boardModels.json from the two knowledge-base CSVs in the backend folder.
Usage (from shaper-backend/): python3 scripts/build-knowledge.py"""
import csv, json

MODELS_CSV = "Shaper_AI_Board_Models (1).csv"
GLOSSARY_CSV = "Shaper_AI_Board_Models_terms_definition.csv"

def read(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.reader(f))

def num(v):
    v = v.strip()
    try:
        f = float(v)
        return int(f) if f.is_integer() else f
    except ValueError:
        return v

rng = lambda a, b: {"min": num(a), "max": num(b)}
models = []
for r in read(MODELS_CSV)[2:]:  # two header rows: group banner + column names
    if not r or not r[0].strip():
        continue
    models.append({
        "id": r[0], "family": r[1], "model": r[2], "typicalLength": r[3],
        "english": {"whatItIs": r[4], "feel": r[5], "bestWaves": r[6], "surferLevel": r[7]},
        "ranges": {
            "length": rng(r[8], r[9]), "width": rng(r[10], r[11]), "thickness": rng(r[12], r[13]),
            "volumeL": rng(r[14], r[15]), "noseWidth": rng(r[16], r[17]), "tailWidth": rng(r[18], r[19]),
            "noseRocker": rng(r[20], r[21]), "tailRocker": rng(r[22], r[23]),
        },
        "shape": {"widePoint": r[24], "rails": r[25], "bottom": r[26], "tail": r[27], "nose": r[28], "fins": r[29]},
    })
glossary = [
    {"term": g[0], "meaning": g[1], "options": g[2], "why": g[3]}
    for g in read(GLOSSARY_CSV)[1:] if g and g[0].strip()
]
with open("src/knowledge/boardModels.json", "w", encoding="utf-8") as f:
    json.dump({"models": models, "glossary": glossary}, f, indent=1, ensure_ascii=False)
print(len(models), "models,", len(glossary), "glossary terms")
