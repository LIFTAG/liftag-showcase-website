#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path
state = json.loads(Path('/opt/liftag-web/motionwisp.json').read_text())
subprocess.run(['docker','exec',state['container'],'node','ops/health-check.mjs'],check=True)
