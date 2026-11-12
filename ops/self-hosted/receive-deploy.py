#!/usr/bin/env python3
"""Forced SSH command: accept one image for one authorized website."""
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

site = sys.argv[1]
command = os.environ.get('SSH_ORIGINAL_COMMAND', '')
if site not in ('motionwisp','liftag') or not re.fullmatch(r'[0-9a-f]{40}', command):
    raise SystemExit('Expected a commit SHA; interactive SSH is unavailable')
root = Path('/opt/liftag-web')
with tempfile.TemporaryFile() as stream:
    size = 0
    while chunk := sys.stdin.buffer.read(1024 * 1024):
        size += len(chunk)
        if size > 1024 * 1024 * 1024: raise SystemExit('Image upload exceeds 1 GiB')
        stream.write(chunk)
    stream.seek(0)
    unzip = subprocess.Popen(['gzip','-d'], stdin=stream, stdout=subprocess.PIPE)
    load = subprocess.run(['docker','load'], stdin=unzip.stdout, check=False)
    unzip.stdout.close()
    if load.returncode or unzip.wait(): raise SystemExit('Image upload failed')
image = f'liftag-web-{site}:{command}'
subprocess.run(['python3', str(root / 'deploy.py'), site, image], check=True)
