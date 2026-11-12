#!/usr/bin/env python3
"""Encrypt website configuration and the isolated analytics DB with the existing
owner-held recovery key; upload via the existing write-only backup credential."""
import base64
import datetime
import fcntl
import hashlib
import json
import os
import subprocess
import sys
import tarfile
import tempfile
import uuid
from pathlib import Path

os.umask(0o077)
root = Path('/opt/liftag-web')
state_root = Path('/var/lib/liftag-web-backup')
state_root.mkdir(mode=0o700, exist_ok=True)
db = 'liftag-web-analytics-db-1'

def run(*args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)

def sql(query, database='umami'):
    return subprocess.check_output(['docker','exec',db,'psql','-U','umami','-d',database,'-Atc',query],text=True).strip()

with (state_root / 'backup.lock').open('w') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    labels = subprocess.check_output(['docker','inspect',db,'--format',
        '{{ index .Config.Labels "com.docker.compose.project" }} {{ index .Config.Labels "com.docker.compose.service" }}'],text=True).strip()
    if labels != 'liftag-web analytics-db' or sql('SHOW server_version_num')[:2] != '16':
        raise RuntimeError('Analytics database identity check failed')
    # Only the isolated website-analytics database is modified. The established
    # first-party funnel retains its existing Redis TTL and history.
    sql("""BEGIN; SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s';
      DELETE FROM event_data WHERE created_at < now() - interval '90 days';
      DELETE FROM website_event WHERE created_at < now() - interval '90 days';
      DELETE FROM session_data WHERE created_at < now() - interval '90 days';
      DELETE FROM session s WHERE created_at < now() - interval '90 days'
        AND NOT EXISTS (SELECT 1 FROM website_event e WHERE e.session_id=s.session_id)
        AND NOT EXISTS (SELECT 1 FROM session_data d WHERE d.session_id=s.session_id);
      COMMIT;""")
    with tempfile.TemporaryDirectory(dir=state_root) as temp:
        temp = Path(temp)
        dump = temp / 'analytics.pgdump'
        with dump.open('wb') as output:
            run('docker','exec',db,'pg_dump','-U','umami','-d','umami','--format=custom','--no-owner','--no-acl',stdout=output)
        with dump.open('rb') as source:
            run('docker','exec','-i',db,'pg_restore','--list',stdin=source,stdout=subprocess.DEVNULL)
        if '--verify-restore' in sys.argv:
            restore_db = 'web_backup_check_' + uuid.uuid4().hex[:12]
            run('docker','exec',db,'createdb','-U','umami',restore_db)
            try:
                with dump.open('rb') as source:
                    run('docker','exec','-i',db,'pg_restore','-U','umami','-d',restore_db,'--exit-on-error','--no-owner','--no-acl',stdin=source)
                if sql('SELECT count(*) FROM website',restore_db) != sql('SELECT count(*) FROM website'):
                    raise RuntimeError('Analytics restore count mismatch')
            finally:
                run('docker','exec',db,'dropdb','-U','umami',restore_db)
            print('Analytics backup restored successfully into a disposable database.')
        bundle = temp / 'website-backup.tar.gz'
        with tarfile.open(bundle,'w:gz') as archive:
            archive.add(dump,arcname='analytics.pgdump')
            for name in ['private','motionwisp.json','liftag.json','migration-metadata.json']:
                archive.add(root / name,arcname=name)
        encrypted = temp / 'website-backup.age'
        recipient = os.environ['AGE_RECIPIENT']
        if not recipient.startswith('age1'): raise RuntimeError('Missing recovery recipient')
        run(os.environ.get('AGE_BIN','/opt/liftag-db-backup/bin/age'),'--encrypt','--recipient',recipient,'--output',str(encrypted),str(bundle))
        checksum = base64.b64encode(hashlib.file_digest(encrypted.open('rb'),'sha256').digest()).decode()
        now = datetime.datetime.now(datetime.timezone.utc)
        prefix = os.environ.get('DAILY_BACKUP_PREFIX',os.environ.get('BACKUP_PREFIX','production/postgres')+'/daily')
        key = prefix + '/website-analytics/' + now.strftime('%Y/%m/%d/%Y%m%dT%H%M%SZ-') + uuid.uuid4().hex + '.web-backup.age'
        # The production database restore tool selects only *.dump.age. Never
        # let a website archive enter that restore candidate set.
        if key.endswith('.dump.age'): raise RuntimeError('Unsafe backup suffix')
        env = {**os.environ,
          'AWS_SHARED_CREDENTIALS_FILE':os.environ.get('AWS_CREDENTIALS_FILE','/etc/liftag-db-backup/aws-credentials'),
          'AWS_PROFILE':os.environ.get('AWS_PROFILE','liftag-backup'),
          'AWS_REGION':os.environ.get('BACKUP_REGION','eu-central-1')}
        returned = subprocess.check_output(['aws','--no-cli-pager','s3api','put-object',
          '--bucket',os.environ['BACKUP_BUCKET'],'--key',key,'--body',str(encrypted),
          '--server-side-encryption','AES256','--checksum-algorithm','SHA256','--checksum-sha256',checksum,
          '--if-none-match','*','--expected-bucket-owner',os.environ['BACKUP_ACCOUNT_ID'],
          '--query','ChecksumSHA256','--output','text'],env=env,text=True).strip()
        if returned != checksum: raise RuntimeError('Backup upload checksum mismatch')
        (state_root / 'last-success.json').write_text(json.dumps({'at':now.isoformat(),'key':key,'sha256':checksum}))
        print('Encrypted website backup uploaded; S3 checksum verified.')
