#!/usr/bin/env python3
"""Create a separate, local psiTurk study without overwriting an existing project."""
import argparse
import configparser
import importlib.util
from pathlib import Path
import shutil
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', type=Path)
    parser.add_argument('--port', type=int, default=22364)
    args = parser.parse_args()
    target = args.project.expanduser().resolve()
    if target.exists():
        parser.error('This folder already exists. Choose a new folder; existing studies and data are never overwritten.')
    if not 1024 <= args.port <= 65535:
        parser.error('Port must be between 1024 and 65535.')
    spec = importlib.util.find_spec('psiturk')
    if spec is None:
        parser.error('Activate your psiTurk virtual environment before running this script.')
    example = Path(spec.origin).parent / 'example'
    if not (example / 'config.txt.sample').is_file():
        parser.error('The installed psiTurk example is missing config.txt.sample.')
    shutil.copytree(example, target)
    (target / 'config.txt.sample').rename(target / 'config.txt')
    if (target / 'custom.py.sample').exists():
        (target / 'custom.py.sample').rename(target / 'custom.py')
    source = Path(__file__).resolve().parent
    subprocess.run([sys.executable, str(source / 'install_into_psiturk.py'), str(target)], check=True)
    config = configparser.ConfigParser(interpolation=None)
    config.read(target / 'config.txt')
    settings = {
        'Database Parameters': {'database_url': 'sqlite:///' + str(target / 'participants.db')},
        'Server Parameters': {'host': 'localhost', 'port': str(args.port)},
        'Task Parameters': {'experiment_code_version': 'robot-trust-experiment-1.2.0',
                            'num_conds': '2', 'num_counters': '2', 'cutoff_time': '30'},
    }
    for section, values in settings.items():
        if not config.has_section(section):
            config.add_section(section)
        for key, value in values.items():
            config.set(section, key, value)
    with (target / 'config.txt').open('w') as handle:
        config.write(handle)
    shutil.copy2(source / 'export_results.py', target / 'export_results.py')
    shutil.copy2(source / 'docs' / 'RUN_EXPERIMENT.md', target / 'RUN_EXPERIMENT.md')
    print('\nExperiment installed at:', target)
    print('Database:', target / 'participants.db')
    print('Port:', args.port)
    print('From that folder, run: psiturk server on')
    print('For each participant, run: psiturk debug -p')
    print('To export all saved participants, run: python export_results.py')


if __name__ == '__main__':
    main()
