#!/usr/bin/env python3
"""Deploy one website, health-gate it, then gracefully switch Nginx."""
import fcntl
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import urlopen

site, image = sys.argv[1:]
if site not in ('motionwisp', 'liftag') or not re.fullmatch(r'liftag-web-' + site + r':[a-zA-Z0-9_.-]+', image):
    raise SystemExit('Invalid site or image')
root = Path('/opt/liftag-web')
if site == 'motionwisp':
    settings = dict(line.split('=',1) for line in (root/'private/motionwisp.env').read_text().splitlines() if '=' in line)
    # Vercel redacts sensitive settings in exports. A non-empty placeholder is
    # not a usable credential and must never pass a deployment's health gate.
    for key, minimum in [('LEAD_INBOX_TOKEN',32),('CRON_SECRET',16),('RESEND_API_KEY',30)]:
        value = settings.get(key,'')
        if len(value) < minimum or (key == 'RESEND_API_KEY' and not value.startswith('re_')):
            raise SystemExit('Missing or invalid production setting: ' + key)
state_file = root / (site + '.json')
upstream = Path('/etc/nginx/conf.d/liftag-web-' + site + '.conf')
current = root / 'static' / site / 'current'

def run(*args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)

def write_json(path, value):
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(value, indent=2) + '\n')
    os.replace(temp, path)

def symlink(target):
    temp = current.with_name('next')
    temp.unlink(missing_ok=True)
    temp.symlink_to(target)
    os.replace(temp, current)

with (root / (site + '.lock')).open('w') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    run('docker', 'image', 'inspect', image, stdout=subprocess.DEVNULL)
    old = json.loads(state_file.read_text()) if state_file.exists() else None
    slot = 'green' if old and old['slot'] == 'blue' else 'blue'
    port = (3101 if site == 'motionwisp' else 3102) + (100 if slot == 'green' else 0)
    container = 'liftag-web-' + site + '-' + slot
    # Only the inactive website slot is replaceable; never touch shared services.
    subprocess.run(['docker','rm','-f',container], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    run('docker','run','-d','--name',container,'--restart','unless-stopped','--init',
        '--memory','768m','--cpus','1.5','--pids-limit','128','--cap-drop','ALL',
        '--security-opt','no-new-privileges:true',
        '--health-cmd',"node -e \"fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\"",
        '--health-interval','30s','--health-timeout','10s','--health-retries','3',
        '--log-opt','max-size=10m','--log-opt','max-file=3',
        '--env-file',str(root / 'private' / (site + '.env')),
        '--env','NODE_OPTIONS=--max-old-space-size=512',
        '--env','INDEXNOW_ENABLED=' + ('true' if site == 'liftag' else 'false'),
        '-p',f'127.0.0.1:{port}:3000',image)
    try:
        deadline = time.monotonic() + 120
        while True:
            try:
                with urlopen(f'http://127.0.0.1:{port}/', timeout=10) as response:
                    if response.status == 200: break
            except Exception:
                if time.monotonic() >= deadline: raise RuntimeError('Website failed its health gate')
                time.sleep(2)
        release = root / 'static' / site / (str(int(time.time())) + '-' + image.split(':')[1])
        release.mkdir(parents=True)
        source = '/app/public/.' if site == 'motionwisp' else '/app/.output/public/.'
        run('docker','cp',container + ':' + source,str(release))
        if site == 'motionwisp':
            (release / '_next/static').mkdir(parents=True, exist_ok=True)
            run('docker','cp',container + ':/app/.next/static/.',str(release / '_next/static'))
        # Open tabs from the previous release must still find their hashed JS.
        hashed = '_next/static' if site == 'motionwisp' else '_nuxt'
        if current.exists() and (current / hashed).exists():
            for item in (current / hashed).rglob('*'):
                target = release / hashed / item.relative_to(current / hashed)
                if item.is_file() and not target.exists():
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(item, target)
        previous_link = current.resolve() if current.exists() else None
        previous_config = upstream.read_text() if upstream.exists() else None
        upstream.write_text(f'upstream {site}_web {{ server 127.0.0.1:{port}; keepalive 16; }}\n')
        symlink(release)
        try:
            run('nginx','-t')
            run('systemctl','reload','nginx')
        except Exception:
            if previous_config is not None: upstream.write_text(previous_config)
            else: upstream.unlink(missing_ok=True)
            if previous_link: symlink(previous_link)
            raise
        state = {'site':site,'image':image,'slot':slot,'port':port,'container':container,'static':str(release)}
        if old: write_json(root / (site + '.previous.json'), old)
        write_json(state_file, state)
        if old and old['container'] != container:
            run('docker','stop','--time','45',old['container'],stdout=subprocess.DEVNULL)
        print(site + ': healthy deployment promoted on port ' + str(port))
    except Exception:
        subprocess.run(['docker','stop',container],stdout=subprocess.DEVNULL)
        raise
