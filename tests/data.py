from pathlib import Path
import csv,json,hashlib,collections,re
root=Path(__file__).resolve().parents[1];src=root.parent/'English-Words-Master'
rows=list(csv.DictReader((root/'source/eiken5_words_master_700.csv').open(encoding='utf-8-sig')))
words=[]
for level in range(1,4):
 s=(root/f'data/grade{level}.js').read_text(); words+=json.loads(s[s.index('['):].rstrip().rstrip(';'))
assert len(words)==700
assert len({w['id'] for w in words})==700
assert len({w['en'].casefold() for w in words})==700
assert collections.Counter(w['level'] for w in words)=={1:300,2:300,3:100}
fixes={c['id']:c['after'] for c in json.loads((root/'verification/material-corrections.json').read_text())}
englishFixes={c['id']:c.get('correctedEnglish',c['en']) for c in json.loads((root/'verification/material-corrections.json').read_text())}
for r,w in zip(rows,words):
 assert w['id']==r['ID'] and w['en']==englishFixes.get(r['ID'],r['英語']) and w['jp']==fixes.get(r['ID'],r['日本語訳'])
 assert w['unit']==w['category']==r['カテゴリー'] and w['priority']==r['優先度']
 assert all(str(w[k]).strip() for k in ['id','en','jp','unit','priority'])
 assert re.fullmatch(r"[A-Za-z .'?!-]+",w['en']),w
before=json.loads((root/'verification/source-before.json').read_text())
assert all(hashlib.sha256((src/k).read_bytes()).hexdigest()==v for k,v in before.items())
for name in ['handwriting.js','handwriting.css']:assert (src/name).read_bytes()==(root/name).read_bytes()
assert (root/'source/eiken5_words_master_700.csv').read_bytes()==Path('/Users/morikazuya/Downloads/eiken5_words_master_700.csv').read_bytes()
keys=re.findall(r"localStorage\.(?:getItem|setItem|removeItem)\('([^']+)'",(root/'index.html').read_text())
assert all(k.startswith('words-master-eiken5:v1:') for k in keys)
result={'items':700,'levels':dict(collections.Counter(w['level'] for w in words)),'categories':dict(collections.Counter(w['category'] for w in words)),'phrases':sum(' ' in w['en'] for w in words),'duplicate_ids':0,'duplicate_english':0,'corrected_entries':len(fixes),'translation_corrections':sum(c['before']!=c['after'] for c in json.loads((root/'verification/material-corrections.json').read_text())),'english_corrections':sum(c.get('originalEnglish')!=c.get('correctedEnglish') for c in json.loads((root/'verification/material-corrections.json').read_text())),'source_files_unchanged':True,'handwriting_code_unchanged':True,'original_csv_unchanged':True,'storage_keys':sorted(set(keys))}
(root/'verification/data-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
