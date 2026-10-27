"""Dependency-free validation of public HTML, case-sensitive URLs and privacy."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import re, json, sys

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'docs'

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True)
        self.ids=[];self.references=[];self.labs=[];self.parts=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if 'data-a2-lab' in a:self.labs.append(a['data-a2-lab'])
        if 'a2-part' in a.get('class','').split():self.parts.append(a.get('id'))
        for attr in ('href','src'):
            if attr in a:self.references.append((tag,a[attr]))

def main():
    files={p.relative_to(SITE).as_posix():p for p in SITE.rglob('*') if p.is_file()}
    pages={rel:Page(p.read_text(encoding='utf-8')) for rel,p in files.items() if p.suffix=='.html'}
    errors=[];private=re.compile(r'\b\d{8}_A[12]\b|[A-Z]:[\\/]Users[\\/]|file:///|(?:127\.0\.0\.1|localhost):876[67]',re.I)
    for rel,p in files.items():
        if p.stat().st_size>=100*1024*1024:errors.append(f'File exceeds 100 MB: {rel}')
        if p.suffix.lower() in ('.pdf','.docx','.png','.jpg','.jpeg','.zip','.pyc') or '/source/' in '/'+rel:errors.append(f'Excluded private/archive file: {rel}')
        if private.search(p.read_text(encoding='utf-8')):errors.append(f'Private identifier or local preview URL: {rel}')
    for rel,page in pages.items():
        for id,n in Counter(page.ids).items():
            if n>1:errors.append(f'Duplicate ID: {rel} #{id}')
        for tag,value in page.references:
            u=urlsplit(value)
            if u.scheme or not value:continue
            if u.path.startswith('/'):
                errors.append(f'Root-relative URL breaks project hosting: {rel}: {value}');continue
            path=(SITE/rel).parent/unquote(u.path) if u.path else SITE/rel
            path=path.resolve()
            try:dest=path.relative_to(SITE.resolve()).as_posix()
            except ValueError:
                errors.append(f'URL leaves public website: {rel}: {value}');continue
            if dest not in files:
                errors.append(f'Missing or incorrectly cased file: {rel}: {value}');continue
            if u.fragment and dest in pages and unquote(u.fragment) not in pages[dest].ids:
                errors.append(f'Missing anchor: {rel}: {value}')
    special={rel:p for rel,p in pages.items() if rel.startswith('specials/a2/')}
    assert sum(len(p.labs) for p in special.values())==11
    assert sum(len(p.parts) for p in special.values())==24
    assert len(list((SITE/'assignments/a2/sql').glob('*.sql')))==20
    result={'files':len(files),'pages':len(pages),'bytes':sum(p.stat().st_size for p in files.values()),'interactive_labs':11,'a2_parts':24,'anonymous_sql_files':20,'errors':errors}
    print(json.dumps(result,ensure_ascii=False,indent=2))
    return 1 if errors else 0

if __name__=='__main__':sys.exit(main())
