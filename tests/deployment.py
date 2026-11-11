from pathlib import Path
import urllib.request,urllib.error,hashlib,json,concurrent.futures
root=Path(__file__).resolve().parents[1]
base='https://words-master-eiken5.vercel.app/'
names=['index.html','handwriting.js','handwriting.css','data/grade1.js','data/grade2.js','data/grade3.js']
def check(name):
 with urllib.request.urlopen(base+name,timeout=30) as r:
  data=r.read()
  assert r.status==200
  assert data==(root/name).read_bytes(),name
  return {'file':name,'status':200,'sha256':hashlib.sha256(data).hexdigest(),'localMatches':True}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(check,names))
for name in ['REPORT.md','source/eiken5_words_master_700.csv','verification/source-before.json','tests/browser.cjs']:
 try:
  urllib.request.urlopen(base+name,timeout=30)
  raise AssertionError('unwanted file publicly served: '+name)
 except urllib.error.HTTPError as e: assert e.code==404,(name,e.code)
result={'url':base,'target':'production','status':'READY','files':results,'nonAppFilesExcluded':True}
(root/'verification/deployment-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
