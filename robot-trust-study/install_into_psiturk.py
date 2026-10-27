#!/usr/bin/env python3
"""Install into a fresh psiTurk example; preserve installed vendor dependencies."""
import argparse, configparser, re, shutil
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('project',type=Path,help='Fresh project created by psiturk-setup-example')
a=p.parse_args(); target=a.project.resolve(); source=Path(__file__).resolve().parent
exp=target/'templates/exp.html'; cfg=target/'config.txt'
if not exp.is_file() or not cfg.is_file():
 p.error('Target must contain templates/exp.html and config.txt. Create a fresh psiTurk example first.')
text=exp.read_text()
if 'ROBOT_STUDY_ENV' not in text:
 # Remove the sample task only, retaining the psiTurk JS and its dependencies.
 text,n=re.subn(r'<script\b[^>]*\bsrc\s*=\s*[\"\'][^\"\']*(?:/|^)task\.js[^\"\']*[\"\'][^>]*>\s*</script>', '', text, flags=re.I)
 if n!=1:
  p.error('Could not identify exactly one sample task.js script. No files changed. Use the manual installation in README.md.')
 if '</body>' not in text.lower() and '{% block body %}' not in text:p.error('No body or Jinja body block found. No files changed.')
 insertion='''
<link rel="stylesheet" href="/static/css/study.css">
<script>window.ROBOT_STUDY_ENV={preview:false,mediaBase:'/static/media/'};</script>
<script src="/static/js/content.js"></script>
<script src="/static/js/study.js"></script>
'''
 if '{% block body %}' in text:
  text=re.sub(r'({% block body %})(.*?)({% endblock %})',lambda m:m[1]+m[2]+'<div id="app"></div>'+insertion+m[3],text,flags=re.S)
  text=text.replace('{{ super() }}','<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Robot decisions</title>')
 else:
  text=re.sub(r'</body>',insertion+'</body>',text,flags=re.I)
 # Add the app mount; preserve native noscript and any platform wrapper.
 text=re.sub(r'<link\b[^>]*href\s*=\s*[\"\'][^\"\']*(?:bootstrap\.min|style)\.css[^\"\']*[\"\'][^>]*>', '', text, flags=re.I)
 text=text.replace('<body>', '<body><div id="app"></div>')
 if not exp.with_suffix('.html.original').exists():shutil.copy2(exp,exp.with_suffix('.html.original'))
 exp.write_text(text)
for group in ['js','css','media']:
 dst=target/'static'/group; dst.mkdir(parents=True,exist_ok=True)
 for f in (source/'static'/group).iterdir():
  if f.is_file():shutil.copy2(f,dst/f.name)
for f in (source/'templates').glob('*.html'):
 dst=target/'templates'/f.name
 if dst.exists() and not dst.with_suffix('.html.original').exists():shutil.copy2(dst,dst.with_suffix('.html.original'))
 shutil.copy2(f,dst)
if not cfg.with_suffix('.txt.original').exists():shutil.copy2(cfg,cfg.with_suffix('.txt.original'))
config=configparser.ConfigParser(interpolation=None);config.read(cfg)
if not config.has_section('Task Parameters'):config.add_section('Task Parameters')
for k,v in {'num_conds':'2','num_counters':'2','experiment_code_version':'robot-trust-1.0.0'}.items():config.set('Task Parameters',k,v)
with cfg.open('w') as f:config.write(f)
print('Installed. Original exp.html and config.txt are backed up alongside them.')
print('Study introduction templates installed. Run psiTurk server on and debug.')
print('Add robot videos and contact details in static/js/content.js.')
