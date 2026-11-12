"""Run with the psiTurk Python environment. Uses only a temporary study/database."""
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

source = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='robot-native-test-') as temporary:
    target = Path(temporary) / 'study'
    subprocess.run([sys.executable, str(source / 'setup_experiment.py'), str(target)], check=True)
    refused = subprocess.run([sys.executable, str(source / 'setup_experiment.py'), str(target)], capture_output=True)
    assert refused.returncode != 0
    for media in (source / 'static/media').iterdir():
        if media.is_file():
            assert hashlib.sha256(media.read_bytes()).digest() == hashlib.sha256((target / 'static/media' / media.name).read_bytes()).digest()
    os.chdir(target)
    from psiturk.experiment import app
    from psiturk.models import Participant
    from psiturk.db import db_session
    client = app.test_client()
    assignments = set()
    ids = set()
    for number in range(4):
        worker, assignment, hit = 'debugWorker' + str(number), 'debugAssignment' + str(number), 'debugHit' + str(number)
        query = {'workerId': worker, 'assignmentId': assignment, 'hitId': hit, 'mode': 'debug'}
        consent = client.get('/consent', query_string=query)
        assert consent.status_code == 200 and b'mode=debug' in consent.data
        page = client.get('/exp', query_string=query)
        assert page.status_code == 200 and b'preview:false' in page.data and b'study.js' in page.data
        uid = worker + ':' + assignment
        ids.add(uid)
        participant = Participant.query.filter_by(uniqueid=uid).one()
        assignments.add((participant.cond, participant.counterbalance))
        assert client.post('/inexp', data={'uniqueId': uid}).json['status'] == 'success'
        payload = {'data': [{'current_trial': 0, 'dateTime': 1, 'trialdata': {'participant_id': uid, 'event': 'test'}}],
                   'questiondata': {'participant_id': uid, 'age': '23', 'completed': True}, 'eventdata': [], 'currenttrial': 1}
        assert client.put('/sync/' + uid, json=payload).status_code == 200
        assert client.get('/sync/' + uid).json == payload
        assert client.get('/complete', query_string={'uniqueId': uid, 'mode': 'debug'}).status_code == 200
    assert assignments == {(0, 0), (0, 1), (1, 0), (1, 1)}
    subprocess.run([sys.executable, str(target / 'export_results.py')], check=True)
    export = next((target / 'exports').iterdir())
    trials = list(csv.reader(io.StringIO((export / 'trialdata.csv').read_text())))
    questions = list(csv.reader(io.StringIO((export / 'questiondata.csv').read_text())))
    assert {row[0] for row in trials} == ids == {row[0] for row in questions}
    assert len(trials) == 4 and len(questions) == 12
    assert (export / 'participants.db').is_file()
    db_session.remove()
    print('PASS native psiTurk 3.3.1: fresh install, overwrite refusal, media hashes, consent/experiment rendering, four assignments, sync persistence, completion, CSV ID linkage, database backup')
