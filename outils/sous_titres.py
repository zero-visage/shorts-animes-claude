# Génère captions.ts (sous-titres de 2-3 mots) à partir des temps de mots de la voix.
# Usage : python sous_titres.py words.json ../projet/src/videos/<nom>/captions.ts
# words.json : {"words": [{"text": "La", "start": 0.0, "end": 0.2, "type": "word"}, ...]}
import json, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf-8"))
ws = [w for w in d["words"] if w.get("type", "word") == "word"]
caps, cur = [], []
for w in ws:
    t = w["text"].replace("…", "")
    if t == "?":
        if cur: cur[-1] = (cur[-1][0] + " ?", cur[-1][1], w["end"])
        continue
    cur.append((t, w["start"], w["end"]))
    fin = any(t.endswith(c) for c in ".,?!") or w["text"].endswith("…")
    if len(cur) >= 3 or fin or (len(cur) == 2 and len(" ".join(x[0] for x in cur)) > 14):
        caps.append(cur); cur = []
if cur: caps.append(cur)
res = []
for i, c in enumerate(caps):
    txt = " ".join(x[0] for x in c).rstrip(",.")
    a = c[0][1] - 0.03
    b = (caps[i + 1][0][1] - 0.03) if i + 1 < len(caps) else c[-1][2] + 0.4
    res.append([txt, round(a, 3), round(b, 3)])
open(out, "w", encoding="utf-8").write("export const CAPS: [string, number, number][] = " + json.dumps(res, ensure_ascii=False) + ";\n")
print(len(res), "sous-titres écrits dans", out)
