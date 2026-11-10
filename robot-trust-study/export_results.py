#!/usr/bin/env python3
"""Export every saved participant to a new dated folder using psiTurk's CSV format."""
from datetime import datetime
from pathlib import Path
import os
import sqlite3


def main():
    project = Path(__file__).resolve().parent
    if not (project / 'config.txt').is_file():
        raise SystemExit('Run the copy of this script in your installed psiTurk project.')
    os.chdir(project)
    from psiturk.psiturk_config import PsiturkConfig
    config = PsiturkConfig()
    config.load_config()
    url = config.get('Database Parameters', 'database_url')
    if url.startswith('sqlite:///'):
        database = Path(url[len('sqlite:///'):]).resolve()
        if not database.is_file():
            raise SystemExit('No participant database yet. Start the study and complete a pilot first.')
    from psiturk.models import Participant
    participants = Participant.query.all()
    output = project / 'exports' / datetime.now().strftime('%Y-%m-%d_%H-%M-%S_%f')
    output.mkdir(parents=True, exist_ok=False)
    for name, method in [('trialdata', 'get_trial_data'), ('questiondata', 'get_question_data'), ('eventdata', 'get_event_data')]:
        with (output / (name + '.csv')).open('w', newline='', encoding='utf-8') as handle:
            for participant in participants:
                if participant.datastring:
                    handle.write(getattr(participant, method)())
    if url.startswith('sqlite:///'):
        # SQLite's backup API gives a consistent snapshot even while the server runs.
        with sqlite3.connect(str(database)) as source, sqlite3.connect(str(output / 'participants.db')) as destination:
            source.backup(destination)
    print('Exported {} participant records to {}'.format(len(participants), output))
    print('CSV files include completed and partial sessions. The first column is the shared participant ID.')


if __name__ == '__main__':
    main()
