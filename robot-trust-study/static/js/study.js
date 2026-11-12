(() => {
    'use strict';

    const C = window.STUDY,
        E = window.ROBOT_STUDY_ENV || {},
        preview = E.preview === true;

    const params = new URLSearchParams(location.search);
    const app = document.getElementById('app') ||
        document.body.appendChild(document.createElement('div'));

    const esc = s => String(s).replace(
        /[&<>"']/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c])
    );

    const base = E.mediaBase || '/static/media/';

    function plan(c, b) {
        const order = c === 0
            ? ['outcome', 'care']
            : ['care', 'outcome'];

        return order.map(style => ({
            style,
            label: (style === 'outcome') === (b === 0) ? 'A' : 'B'
        }));
    }

    let api = null, id, condition, counterbalance;

    try {
        if (preview) {
            id = 'preview-' + crypto.randomUUID();

            condition = params.has('condition')
                ? Number(params.get('condition'))
                : Math.floor(Math.random() * 2);

            counterbalance = params.has('counterbalance')
                ? Number(params.get('counterbalance'))
                : Math.floor(Math.random() * 2);
        } else {
            if (!window.PsiTurk || typeof window.uniqueId === 'undefined') {
                throw Error(
                    'psiTurk connection missing. Use preview.html for an offline preview.'
                );
            }

            id = String(window.uniqueId);
            condition = Number(window.condition);
            counterbalance = Number(window.counterbalance);

            api = new PsiTurk(
                window.uniqueId,
                window.adServerLoc,
                window.mode
            );
        }

        if (
            ![0, 1].includes(condition) ||
            ![0, 1].includes(counterbalance)
        ) {
            throw Error(
                'Condition and counterbalance must each be 0 or 1. Set num_conds=2 and num_counters=2.'
            );
        }
    } catch (err) {
        app.innerHTML = `
            <main>
                <h1>Study setup needs attention</h1>
                <p>${esc(err.message)}</p>
            </main>
        `;
        return;
    }

    const robots = plan(condition, counterbalance);
    const storageKey = 'robot-study:' + C.version + ':' + id;

    let state = {
        id,
        condition,
        counterbalance,
        questions: {},
        trials: [],
        step: 'consent',
        started: null,
        deadline: null,
        pageStarted: null,
        dialogue: null,
        consented: false,
        finished: false
    };

    let cacheOK = true;

    try {
        if (!preview) {
            const old = JSON.parse(
                sessionStorage.getItem(storageKey) || 'null'
            );

            if (old && old.id === id) {
                state = old;
            }
        }
    } catch (_) {
        cacheOK = false;
    }

    let interval,
        pageExit,
        saving = false,
        dirty = false,
        saveTimer,
        stopped = false,
        lastSaveError = false;

    function cache() {
        try {
            sessionStorage.setItem(
                storageKey,
                JSON.stringify(state)
            );
        } catch (_) {
            cacheOK = false;
        }
    }

    function save() {
        cache();

        if (!api || !state.consented) return;

        dirty = true;
        if (saving) return;

        clearTimeout(saveTimer);
        saveTimer = setTimeout(flush, 120);
    }

    function flush(done) {
        if (!api) {
            if (done) done();
            return;
        }

        if (saving) {
            setTimeout(() => flush(done), 150);
            return;
        }

        saving = true;
        dirty = false;

        api.saveData({
            success: () => {
                saving = false;
                lastSaveError = false;

                if (dirty) {
                    flush(done);
                } else if (done) {
                    done();
                }
            },

            error: () => {
                saving = false;
                lastSaveError = true;

                const n = document.getElementById('save-status');

                if (n) {
                    n.textContent =
                        'Connection problem. Your answers remain in this tab; keep it open and retry at the end.';
                }

                if (done) showFinishError();
            }
        });
    }

    function q(key, value) {
        state.questions[key] = value;

        if (api) {
            api.recordUnstructuredData(key, value);
        }

        save();
    }

    function trial(event, detail = {}) {
        const row = {
            participant_id: id,
            version: C.version,
            condition,
            counterbalance,
            seq: state.trials.length,
            event,
            elapsed_ms: state.started
                ? Date.now() - state.started
                : 0,
            ...detail
        };

        state.trials.push(row);

        if (api) {
            api.recordTrialData(row);
        }

        save();
    }

    // Restore saved records after a refresh without resetting the timer.
    if (api && state.consented) {
        Object.entries(state.questions).forEach(
            ([k, v]) => api.recordUnstructuredData(k, v)
        );

        state.trials.forEach(x => api.recordTrialData(x));
    }

    function shell(title, body, section = 'Study', progress = 0) {
        clearInterval(interval);
        pageExit = null;

        document.querySelectorAll('video,audio').forEach(
            v => v.pause()
        );

        app.innerHTML = `
            ${preview || C.demoMode
                ? '<div class="demo-bar">Classroom study · Purdue Northwest</div>'
                : ''
            }

            <header>
                <div class="brand">
                    <span class="mark">R</span>
                    <div>
                        <strong>ROBOT DECISIONS</strong>
                        <div class="meta">
                            Julian Arceo &amp; Zachary Alexander · Purdue Northwest
                        </div>
                    </div>
                </div>

                <div
                    id="clock"
                    class="timer hidden"
                    role="timer"
                    aria-label="Time remaining"
                ></div>
            </header>

            <div class="progress">
                <span style="width:${progress}%"></span>
            </div>

            <main>
                <div class="eyebrow">${esc(section)}</div>
                <h1 tabindex="-1">${title}</h1>

                ${body}

                <div class="footer">
                    <span id="save-status">
                        ${preview
                            ? 'Preview only — CSV downloads are available at the end.'
                            : 'Responses are saved during the study.'
                        }
                    </span>

                    ${state.consented && !state.finished
                        ? ' <button id="withdraw">Stop participating</button>'
                        : ''
                    }
                </div>
            </main>
        `;

        document.querySelector('h1').focus();
        window.scrollTo(0, 0);

        const w = document.getElementById('withdraw');

        if (w) {
            w.onclick = () => {
                if (confirm(
                    'Stop participating? Responses already recorded will remain saved.'
                )) {
                    clearInterval(interval);
                    stopped = true;

                    q('withdrawn', true);
                    q('withdrawn_at_step', state.step);

                    state.step = 'withdrawn';
                    cache();
                    render();
                }
            };
        }
    }

    function startStep(name) {
        const fresh = state.step !== name || !state.pageStarted;
        state.step = name;

        if (fresh) {
            state.pageStarted = Date.now();
            state.deadline = null;
        }

        cache();
        return fresh;
    }

    function next(name) {
        state.step = name;
        state.pageStarted = null;
        state.deadline = null;

        cache();
        render();
    }

    function timed(seconds, exit) {
        if (!state.deadline) {
            state.deadline = Date.now() + seconds * 1000;
        }

        cache();

        let ended = false;

        pageExit = reason => {
            if (ended || stopped) return;

            ended = true;
            clearInterval(interval);

            document.querySelectorAll('video,audio').forEach(
                v => v.pause()
            );

            exit(reason);
        };

        const clock = document.getElementById('clock');
        clock.classList.remove('hidden');

        const tick = () => {
            const remaining = Math.max(
                0,
                Math.ceil((state.deadline - Date.now()) / 1000)
            );

            clock.textContent =
                `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} left`;

            clock.classList.toggle('urgent', remaining <= 15);

            if (remaining === 0) {
                pageExit('timeout');
            }
        };

        interval = setInterval(tick, 200);
        tick();
    }

    function details() {
        return {
            duration_ms: Date.now() - state.pageStarted
        };
    }

    function select(name, label, options) {
        return `
            <label for="${name}">${label}</label>
            <select id="${name}" name="${name}" required>
                <option value="">Choose an answer</option>
                ${options.map(x => `
                    <option value="${esc(x)}">${esc(x)}</option>
                `).join('')}
            </select>
        `;
    }

    function scale(name, label) {
        return `
            <fieldset>
                <legend>${label}</legend>
                <div class="scale">
                    ${[1, 2, 3, 4, 5, 6, 7].map(n => `
                        <label>
                            <input
                                type="radio"
                                name="${name}"
                                value="${n}"
                                required
                            >
                            ${n}
                        </label>
                    `).join('')}

                    <label>
                        <input
                            type="radio"
                            name="${name}"
                            value="skip"
                        >
                        Prefer not to answer
                    </label>
                </div>
            </fieldset>
        `;
    }

    function values(form) {
        const data = {};

        form.querySelectorAll('[name]').forEach(e => {
            if (!(e.name in data)) {
                data[e.name] = null;
            }
        });

        for (const [k, v] of new FormData(form)) {
            data[k] = v;
        }

        return data;
    }

    function restore(form, prefix) {
        form.querySelectorAll('[name]').forEach(e => {
            const v = state.questions[prefix + e.name];

            if (v === undefined || v === null) return;

            if (e.type === 'radio' || e.type === 'checkbox') {
                e.checked = e.value === String(v);
            } else {
                e.value = v;
            }
        });
    }

    function gate(form, extra = () => true) {
        const button = form.querySelector('button.primary');

        const update = () => {
            button.disabled = !form.checkValidity() || !extra();
        };

        form.addEventListener('input', update);
        form.addEventListener('change', update);

        update();
        return update;
    }

    function previous(step) {
        const b = document.getElementById('previous');

        if (b) {
            b.onclick = () => next(step);
        }
    }

    function backButton() {
        return '<button type="button" id="previous">Previous</button>';
    }

    function bindSurvey(prefix, onDone) {
        const form = document.querySelector('form');
        restore(form, prefix);
        gate(form);

        const persist = () => {
            Object.entries(values(form)).forEach(([key, value]) => q(prefix + key, value));
        };
        form.addEventListener('input', persist);
        form.addEventListener('change', persist);
        form.onsubmit = event => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            persist();
            q((prefix || state.step + '_') + 'completion_reason', 'completed');
            q(state.step + '_duration_ms', Date.now() - state.pageStarted);
            onDone('completed');
        };
    }

    function consent() {
        startStep('consent');

        shell('Before you begin', `
            <div class="card">
                <p>
                    <strong>
                        ${esc(C.researcher)} · ${esc(C.course)}
                    </strong>
                </p>

                <div class="grid">
                    <section>
                        <p>
                            <strong>What you will do:</strong>
                            Watch two robot characters answer a made-up rescue
                            problem. Choose questions to learn their reasons,
                            then rate each robot.
                        </p>

                        <p>
                            <strong>Time and age:</strong>
                            Allow about 15–20 minutes; take the time you need. You must be 18 or older.
                        </p>

                        <p>
                            <strong>About the story:</strong>
                            The rescue problem involves deciding who to save in a flood.
                            Your answers help us study how people judge robots.
                        </p>
                    </section>

                    <section>
                        <p>
                            <strong>Your data:</strong>
                            We collect non-identifiable answers, choices, and
                            response times.
                            We do not ask for your name or record your face or
                            voice. Do not type personal details.
                        </p>

                        <p>
                            <strong>Your choice:</strong>
                            Taking part is your choice. You can stop at any time.
                            Answers already saved may be kept. You may leave
                            the final comment blank.
                        </p>

                        <p>
                            The robots use recorded scripts, not live thinking.
                            They do not speak for Tesla.
                        </p>
                    </section>
                </div>

                <p class="subtle">
                    Questions? ${esc(C.contact)}
                </p>

                <label>
                    <input id="agree" type="checkbox">
                    I am 18 or older, have read this page, and agree to take part.
                </label>

                <div class="actions">
                    <button id="consent" class="primary" disabled>
                        Agree and continue
                    </button>

                    <button id="decline">
                        I do not agree
                    </button>
                </div>
            </div>
        `, 'Consent');

        const agree = document.getElementById('agree');

        agree.checked = state.consented;

        document.getElementById('consent').disabled = !agree.checked;

        agree.onchange = e => {
            document.getElementById('consent').disabled =
                !e.target.checked;
        };

        document.getElementById('consent').onclick = () => {
            if (!agree.checked) return;

            if (!state.consented) {
                state.consented = true;
                state.started = Date.now();

                q('consent', true);
                q('participant_id', id);
                q('study_version', C.version);
                q('condition', condition);
                q('counterbalance', counterbalance);
                q('robot_order', robots.map(r => r.style).join(','));
                q('first_robot_label', robots[0].label);
                q('preview', preview);
                q('demo_mode', C.demoMode);
                q('cache_available', cacheOK);
            }

            next('demographics');
        };

        document.getElementById('decline').onclick = () => {
            if (state.consented) {
                q('withdrawn', true);
                q('withdrawn_at_step', 'consent');
                next('withdrawn');
            } else {
                shell(
                    'You have not joined the study',
                    '<p>No study responses have been recorded. You may close this window.</p>',
                    'Thank you'
                );
            }
        };
    }

    function demographics() {
        startStep('demographics');

        shell('About you', `
            <form class="card">
                <p>Choose an answer for each question.</p>

                <div class="form-grid">
                    <div>
                        <label for="age">Age (18 or older)</label>
                        <input
                            id="age"
                            name="age"
                            type="number"
                            min="18"
                            step="1"
                            required
                            aria-describedby="age-error"
                        >
                        <p id="age-error" class="error hidden" role="alert">Not 18 yet — you must be 18 or older to take part.</p>
                    </div>

                    <div>
                        ${select(
                            'gender',
                            'Gender',
                            [
                                'Woman',
                                'Man',
                                'Nonbinary',
                                'Another gender',
                                'Prefer not to answer'
                            ]
                        )}
                    </div>

                    <div>
                        ${select(
                            'psiturk_before',
                            'Have you used psiTurk before?',
                            ['Yes', 'No', 'Not sure']
                        )}
                    </div>

                    <div>
                        ${select(
                            'robots_before',
                            'Have you worked with robots before?',
                            ['Yes', 'No', 'Not sure']
                        )}
                    </div>

                    <div>
                        ${select(
                            'robot_familiarity',
                            'How well do you know human-shaped robots?',
                            [
                                'Not at all',
                                'Slightly',
                                'Moderately',
                                'Very',
                                'Extremely',
                                'Prefer not to answer'
                            ]
                        )}
                    </div>
                </div>

                <div class="actions">
                    ${backButton()}
                    <button class="primary">Continue</button>
                </div>
            </form>
        `, 'Background', 8);

        bindSurvey('', () => next('media'));
        previous('consent');
        const age = document.getElementById('age');
        const checkAge = () => {
            const underage = age.value !== '' && Number(age.value) < 18;
            document.getElementById('age-error').classList.toggle('hidden', !underage);
            age.setAttribute('aria-invalid', String(underage));
        };
        age.addEventListener('input', checkAge);
        checkAge();
    }

    function playWholeVideo(video, ready, status, onFinished, onEvent = () => {}) {
        let finished = false, furthest = 0;
        ready(false);
        video.autoplay = true;
        video.controls = true;
        video.playsInline = true;
        video.addEventListener('timeupdate', () => {
            if (!video.seeking && video.currentTime <= furthest + 1.5) {
                furthest = Math.max(furthest, video.currentTime);
            }
        });
        video.addEventListener('seeking', () => {
            if (!finished && video.currentTime > furthest + 0.5) video.currentTime = furthest;
        });
        video.addEventListener('ratechange', () => {
            if (video.playbackRate !== 1) video.playbackRate = 1;
        });
        video.addEventListener('play', () => {
            status.textContent = 'Watch the full video. Then confirm you understood the response.';
            onEvent('video_play');
        });
        video.addEventListener('ended', () => {
            if (finished || !video.ended || !Number.isFinite(video.duration) || furthest < video.duration - 1) return;
            finished = true;
            status.textContent = 'Video finished. You can continue.';
            onEvent('video_ended');
            onFinished();
            ready(true);
        });
        video.addEventListener('error', () => {
            ready(false);
            status.textContent = 'Video could not load. Tell the study team or reload to try again.';
            status.classList.add('error');
            onEvent('video_error');
        });
        video.play().catch(() => {
            if (!video.isConnected || finished) return;
            status.textContent = 'Autoplay was blocked. Press Play on the video to start with sound.';
        });
    }

    function media() {
        startStep('media');

        shell('Check your sound and video', `
            <div class="card">
                <p>Watch the whole clip with sound. Then answer both questions.</p>

                <video
                    id="check-video"
                    controls
                    playsinline
                    preload="auto"
                    src="${base}av-check.mp4"
                ></video>
                <p id="playback-status" class="subtle" aria-live="polite"></p>

                <form>
                    <div class="form-grid">
                        <div>
                            ${select(
                                'tones',
                                'How many tones did you hear?',
                                ['1', '2', '3', '4']
                            )}
                        </div>

                        <div>
                            ${select(
                                'shape',
                                'Which shape did you see?',
                                ['Circle', 'Square', 'Triangle']
                            )}
                        </div>
                    </div>

                    <p
                        id="av-error"
                        class="error"
                        role="alert"
                    ></p>

                    <div class="actions">
                        ${backButton()}

                        <button class="primary">
                            Check and continue
                        </button>

                        <button type="button" id="av-fail">
                            I cannot hear or see it
                        </button>
                    </div>
                </form>
            </div>
        `, 'Equipment check', 15);

        let played = false;

        const form = document.querySelector('form');

        restore(form, 'av_last_');

        const update = gate(form, () => played);

        form.onchange = () => {
            const v = values(form);

            q('av_last_tones', v.tones);
            q('av_last_shape', v.shape);
        };

        playWholeVideo(document.getElementById('check-video'), done => {
            played = done;
            update();
        }, document.getElementById('playback-status'), () => q('av_clip_finished', true));

        form.onsubmit = e => {
            e.preventDefault();

            if (!form.checkValidity() || !played) return;

            const v = values(form);

            q('av_attempts', (state.questions.av_attempts || 0) + 1);
            q('av_last_tones', v.tones);
            q('av_last_shape', v.shape);

            if (v.tones === '3' && v.shape === 'Circle') {
                q('av_passed', true);
                next('explanation');
            } else {
                q('av_passed', false);

                document.getElementById('av-error').textContent =
                    'That did not match the clip. Replay it and try again.';
            }
        };

        previous('demographics');

        document.getElementById('av-fail').onclick = () => {
            q('av_passed', false);
            q('screenout_reason', 'media_check_failed');
            next('media_failed');
        };
    }

    function explanation() {
        startStep('explanation');

        shell('How this experiment works', `
            <div class="card">
                <p>
                    You will meet
                    <strong>Robot ${robots[0].label} first</strong>,
                    then
                    <strong>Robot ${robots[1].label}</strong>.
                    Both answer the same rescue problem.
                </p>

                <ol>
                    <li>Read the rescue story.</li>
                    <li>
                        Watch each robot’s full video.
                        Choose questions to learn why it made that choice.
                    </li>
                    <li>
                        Rate each robot, then choose which one you
                        would trust with decisions.
                    </li>
                </ol>

                <p>
                    The replies are recorded. You are not chatting
                    with a live robot. There is no right or wrong opinion.
                </p>

                <p>
                    The story page has a one-minute timer. Robot conversations
                    and questionnaires have no time limit. Finish each video
                    before confirming you understood it or choosing another question.
                </p>

                <div class="actions">
                    ${backButton()}

                    <button class="primary" id="next-explanation">
                        See the task
                    </button>
                </div>
            </div>
        `, 'Experiment instructions', 20);

        previous('media');

        document.getElementById('next-explanation').onclick = () => {
            next('instructions');
        };
    }

    function instructions() {
        startStep('instructions');

        shell('How to ask the robots questions', `
            <div class="card instruction-grid">
                <section>
                    <ol>
                        <li>Watch the robot’s first video to the end.</li>
                        <li>Choose any of the five main questions.</li>
                        <li>
                            Watch the full reply. Click
                            “I understand what the robot said.”
                        </li>
                        <li>
                            Repeat for all five questions.
                            Extra follow-up questions are optional.
                        </li>
                    </ol>

                    <p>
                        After five replies, you move to the ratings.
                        You will do this for both robots.
                    </p>

                    <p class="subtle">Look for this highlighted button after each video:</p>
                    <div class="review-highlight example-review">I understand what the robot said</div>
                    <div class="actions">
                        ${backButton()}

                        <button class="primary" id="begin">
                            Check my understanding
                        </button>
                    </div>
                </section>

                <figure>
                    <img
                        src="${base}task-example.png"
                        alt="Example task: video, question menu, full-width reply, and highlighted confirmation button."
                    >

                    <figcaption>
                        Example screen — choose questions on the right.
                    </figcaption>
                </figure>
            </div>
        `, 'Experiment instructions', 23);

        previous('explanation');

        document.getElementById('begin').onclick = () => {
            next('understanding');
        };
    }

    function understanding() {
        startStep('understanding');

        shell('Before the experiment starts', `
            <form class="card">
                <p>
                    Answer these three questions.
                    You can go back to review the instructions.
                </p>

                ${select(
                    'robots',
                    'Which robots will you meet?',
                    ['Both robots', 'Only one robot']
                )}

                ${select(
                    'replies',
                    'How do the robots reply?',
                    ['With recorded answers', 'With new, live answers']
                )}

                ${select(
                    'video',
                    'When can you move on from a robot video?',
                    [
                        'After the whole video finishes',
                        'Before the video finishes'
                    ]
                )}

                <p
                    id="understanding-error"
                    class="error"
                    role="alert"
                ></p>

                <div class="actions">
                    ${backButton()}

                    <button class="primary">
                        Start the experiment
                    </button>
                </div>
            </form>
        `, 'Understanding check', 26);

        const form = document.querySelector('form');

        restore(form, 'instructions_check_');
        gate(form);

        form.onchange = () => {
            Object.entries(values(form)).forEach(
                ([k, v]) => q('instructions_check_' + k, v)
            );
        };

        previous('instructions');

        form.onsubmit = e => {
            e.preventDefault();

            if (!form.checkValidity()) return;

            const v = values(form);

            Object.entries(v).forEach(
                ([k, x]) => q('instructions_check_' + k, x)
            );

            const ok =
                v.robots === 'Both robots' &&
                v.replies === 'With recorded answers' &&
                v.video === 'After the whole video finishes';

            const attempts =
                state.questions.instructions_check_history || [];

            q('instructions_check_history', [
                ...attempts,
                { ...v, correct: ok }
            ]);

            q('instructions_check_passed', ok);

            if (!ok) {
                document.getElementById('understanding-error').textContent =
                    'Review the instructions and try again: you meet both robots, their replies are recorded, and you must finish each video before moving on.';
                return;
            }

            q('instructions_completed', true);

            if (api) {
                api.finishInstructions();
            }

            next('scenario');
        };
    }

    function scenario() {
        const fresh = startStep('scenario');

        if (fresh) {
            trial('scenario_start');
        }

        shell('One boat. Two buildings.', `
            <form class="card">
                <p>${C.scenario}</p>

                <div class="grid">
                    <div class="card">
                        <h3>Building A</h3>
                        <p>1 person · Promise to return</p>
                    </div>

                    <div class="card">
                        <h3>Building B</h3>
                        <p>5 people · No prior promise</p>
                    </div>
                </div>

                ${select(
                    'understanding_rescues',
                    'How many rescues can the robot complete?',
                    ['One', 'Two']
                )}

                ${select(
                    'understanding_promise',
                    'Who was promised a rescue?',
                    [
                        'The person at Building A',
                        'The people at Building B'
                    ]
                )}

                <p class="subtle">
                    Assume the stated facts are fixed.
                    Neither robot can rescue both groups.
                </p>

                <button class="primary">
                    Continue to the first robot
                </button>
            </form>
        `, 'The scenario', 30);

        const f = document.querySelector('form');

        restore(f, '');
        gate(f);

        f.onchange = () => {
            Object.entries(values(f)).forEach(
                ([k, v]) => q(k, v)
            );
        };

        f.onsubmit = e => {
            e.preventDefault();

            if (f.reportValidity()) {
                pageExit('completed');
            }
        };

        timed(C.timing.scenario, reason => {
            const v = values(f);

            Object.entries(v).forEach(
                ([k, x]) => q(k, x)
            );

            q(
                'comprehension_correct',
                v.understanding_rescues === 'One' &&
                v.understanding_promise === 'The person at Building A'
            );

            q('comprehension_completion_reason', reason);

            trial('scenario_end', {
                ...details(),
                completion_reason: reason
            });

            next('dialogue_0');
        });
    }

    const icon = `
        <svg
            class="robot-icon"
            viewBox="0 0 80 90"
            aria-hidden="true"
        >
            <rect
                x="18"
                y="5"
                width="44"
                height="34"
                rx="14"
                fill="#7a9389"
            />

            <rect
                x="12"
                y="45"
                width="56"
                height="40"
                rx="13"
                fill="#7a9389"
            />

            <path
                d="M29 39v7m22-7v7"
                stroke="#7a9389"
                stroke-width="6"
            />
        </svg>
    `;

    function dialogue(index) {
        const r = robots[index];
        const fresh = startStep('dialogue_' + index);

        if (fresh) {
            state.dialogue = {
                active: 'opening',
                seen: [],
                opened: [],
                openingReviewed: false
            };

            trial('robot_start', {
                robot_style: r.style,
                robot_label: r.label,
                position: index + 1
            });
        }

        const d = state.dialogue;

        shell(
            `A conversation with Robot ${r.label}`,
            `
            <p class="subtle">${index + 1} of 2 robots · Same flood rescue problem</p>

            <div class="card dialogue-grid">

                <!-- Video: left column -->
                <section class="dialogue-media">
                    <div id="media-panel" class="video-panel"></div>
                </section>

                <!-- Questions: right column -->
                <section class="dialogue-questions">
                    <h2>What would you like to ask?</h2>

                    <p class="subtle">
                        Watch and confirm each reply. Follow-ups are optional.
                    </p>

                    <div id="questions" class="questions"></div>
                    <p id="count" class="subtle"></p>


                </section>

                <!-- Transcript: full width underneath -->
                <section class="dialogue-transcript">
                    <h2 id="response-title"></h2>

                    <div id="response" class="response"></div>

                    <p id="playback-status" class="subtle" aria-live="polite"></p>
                    <div class="actions">
                        <button id="review" class="primary review-highlight" disabled>
                            I understand what the robot said
                        </button>

                        <div id="follow-area"></div>
                    </div>
                </section>

            </div>
            `,
            'Robot dialogue',
            index === 0 ? 40 : 65
        );

        let videoFinished = false;

        function log(event, extra = {}) {
            trial(event, {
                robot_style: r.style,
                robot_label: r.label,
                position: index + 1,
                ...extra
            });
        }

        function show(active, record = true) {
            d.active = active;
            cache();

            const isOpening = active === 'opening';
            const follow = active.endsWith('_follow');
            const key = active.replace('_follow', '');
            const prompt = C.questions.find(x => x.id === key);

            const text = isOpening
                ? C.robots[r.style].opening
                : C.robots[r.style].answers[key][follow ? 1 : 0];

            document.getElementById('response-title').textContent =
                isOpening
                    ? C.robots[r.style].decision
                    : (follow ? prompt.follow : prompt.text);

            document.getElementById('response').textContent = text;

            const path = C.videos[r.style][active];

            document.getElementById('media-panel').innerHTML = path
                ? `
                    <video
                        controls
                        playsinline
                        preload="auto"
                        src="${esc(base + path)}"
                    ></video>

                    <p class="subtle">Robot ${r.label}</p>
                `
                : `
                    ${icon}
                    <strong>Robot ${r.label}</strong>
                    <span class="subtle">Video placeholder</span>
                    <span class="subtle">
                        Please tell the study team that this clip is missing.
                    </span>
                `;

            const v = document.querySelector('#media-panel video');

            videoFinished = false;
            const status = document.getElementById('playback-status');
            status.textContent = 'Loading video…';
            if (v) {
                playWholeVideo(v, done => {
                    videoFinished = done;
                    update();
                }, status, () => {}, event => log(event, {reply: active}));
            } else {
                status.textContent = 'This video is missing. Please tell the study team.';
                status.classList.add('error');
            }

            document.getElementById('follow-area').innerHTML =
                !isOpening && !follow
                    ? `<button id="follow">Follow up: ${esc(prompt.follow)}</button>`
                    : '';

            const f = document.getElementById('follow');

            if (f) {
                f.onclick = () => {
                    if (!videoFinished) return;
                    log('followup_selected', { question: key });
                    show(key + '_follow');
                };
            }

            if (record) {
                d.opened.push(active);

                log('reply_opened', {
                    reply: active,
                    has_video: !!path
                });
            }

            update();
        }

        function update() {
            document.getElementById('questions').innerHTML =
                C.questions.map(x => `
                    <button
                        data-question="${x.id}"
                        ${d.openingReviewed && videoFinished ? '' : 'disabled'}
                        class="${d.seen.includes(x.id) ? 'seen' : ''}"
                    >
                        ${esc(x.text)}
                        ${d.seen.includes(x.id)
                            ? '<small>Reviewed</small>'
                            : ''
                        }
                    </button>
                `).join('');

            document.querySelectorAll('[data-question]').forEach(
                b => b.onclick = () => { if (videoFinished) show(b.dataset.question); }
            );

            document.getElementById('count').textContent =
                `${d.seen.length} of 5 main responses reviewed`;

            document.getElementById('review').disabled = !videoFinished;
            const followButton = document.getElementById('follow');
            if (followButton) followButton.disabled = !videoFinished;
            document.getElementById('review').onclick = () => {
                if (!videoFinished) return;
                const active = d.active;

                if (active === 'opening') {
                    d.openingReviewed = true;
                } else {
                    const key = active.replace('_follow', '');

                    if (!d.seen.includes(key)) {
                        d.seen.push(key);
                    }
                }

                log('reply_reviewed', { reply: active });
                cache();

                if (d.seen.length === 5) {
                    endDialogue();
                    return;
                }

                update();

                document.getElementById('review').textContent =
                    'Reviewed — choose another question';
            };

            document.getElementById('review').textContent =
                'I understand what the robot said';
        }

        show(d.active, fresh);

        function endDialogue() {
            const reason = 'completed';
            log('robot_end', {
                ...details(),
                completion_reason: reason,
                main_responses_reviewed: d.seen.slice(),
                replies_opened: d.opened.slice(),
                active_reply: d.active
            });

            next('ratings_' + index);
        }
    }

    function ratings(index) {
        startStep('ratings_' + index);

        const r = robots[index];

        shell(`Your ratings of Robot ${r.label}`, `
            <form class="card ratings">
                <p>Rate the robot you just met.</p>

                <p class="subtle">
                    <strong>
                        1 = Strongly disagree · 4 = Neither ·
                        7 = Strongly agree
                    </strong>
                </p>

                <div class="rating-grid">
                    ${C.ratingItems.map(
                        ([k, t]) => scale(k, t)
                    ).join('')}
                </div>

                <div class="actions">
                    <button class="primary">
                        Save ratings and continue
                    </button>
                </div>
            </form>
        `, 'Robot ratings', index === 0 ? 53 : 78);

        bindSurvey(
            'robot_' + r.style + '_',
            () => next(index === 0 ? 'dialogue_1' : 'mdmt_0_0')
        );
    }

    function mdmt(index, block) {
        startStep(`mdmt_${index}_${block}`);
        const r = robots[index];
        const items = C.mdmtItems.slice(block * 6, block * 6 + 6);
        const prefix = `robot_${r.style}_mdmt_`;
        shell(`Moral trust in Robot ${r.label}`, `
            <form class="card ratings mdmt">
                <p>How well does each word describe Robot ${r.label}? ${esc(C.robots[r.style].decision)}</p>
                <p><strong>0 = Not at all · 7 = Very</strong> · Choose “Does Not Fit” if a word does not apply.</p>
                <div class="rating-grid">${items.map(([key, label]) => `
                    <fieldset><legend>${esc(label)}</legend><div class="scale">
                    ${[0,1,2,3,4,5,6,7,'does_not_fit'].map(n => `<label>
                        <input type="radio" name="${key}" value="${n}" required>
                        ${n === 'does_not_fit' ? 'Does Not Fit' : n}</label>`).join('')}
                    </div></fieldset>`).join('')}</div>
                <p class="subtle">Robot ${index + 1} of 2 · Page ${block + 1} of 2</p>
                <div class="actions"><button class="primary">Save and continue</button></div>
            </form>`, 'Final trust questions', 79 + index * 4 + block * 2);
        bindSurvey(prefix, () => {
            if (block === 0) return next(`mdmt_${index}_1`);
            const scores = [];
            for (const dimension of ['ethical', 'sincere', 'benevolent']) {
                const answers = C.mdmtItems.filter(x => x[2] === dimension)
                    .map(x => state.questions[prefix + x[0]])
                    .filter(v => v !== null && v !== undefined && v !== 'does_not_fit')
                    .map(Number).filter(Number.isFinite);
                const score = answers.length ? answers.reduce((a,b) => a+b, 0) / answers.length : null;
                q(prefix + dimension + '_n', answers.length);
                q(prefix + dimension + '_mean', score);
                if (score !== null) scores.push(score);
            }
            q(prefix + 'moral_trust_mean', scores.length >= 2 ? scores.reduce((a,b) => a+b, 0) / scores.length : null);
            q(prefix + 'valid_subscales', scores.length);
            q(prefix + 'version', 'MDMT v2 2025-09-01 Moral Trust');
            next(index === 0 ? 'mdmt_1_0' : 'authority');
        });
    }

    function authority() {
        startStep('authority');

        shell('Which robot would you put in charge?', `
            <form class="card">
                <p>
                    A human can change the robot’s decision.
                    Which robot would you put in charge of each area?
                </p>

                <div class="notice">
                    ${robots.map(r => `
                        Robot ${r.label}:
                        ${esc(
                            C.robots[r.style].decision.replace(
                                'I would',
                                'Would'
                            )
                        )}
                    `).join(' · ')}
                </div>

                ${C.domains.map(([key, title, desc]) => `
                    <fieldset>
                        <legend>
                            <strong>${title}</strong> — ${desc}
                        </legend>

                        <div class="scale">
                            ${[
                                'Robot A',
                                'Robot B',
                                'No preference',
                                'Neither robot'
                            ].map(x => `
                                <label>
                                    <input
                                        type="radio"
                                        name="authority_${key}"
                                        value="${x}"
                                        required
                                    >
                                    ${x}
                                </label>
                            `).join('')}

                            <label>
                                <input
                                    type="radio"
                                    name="authority_${key}"
                                    value="skip"
                                >
                                Prefer not to answer
                            </label>
                        </div>
                    </fieldset>
                `).join('')}

                <p class="subtle">
                    No preference = either is OK.
                    Neither robot = neither is OK.
                </p>

                <button class="primary">
                    Save choices and continue
                </button>
            </form>
        `, 'Compare the robots', 87);

        bindSurvey('', () => {
            C.domains.forEach(([k]) => {
                const choice = state.questions['authority_' + k];

                q(
                    'authority_' + k + '_style',
                    choice === 'Robot A' || choice === 'Robot B'
                        ? robots.find(
                            r => 'Robot ' + r.label === choice
                        ).style
                        : choice
                );
            });

            next('reflection');
        });
    }

    function reflection() {
        startStep('reflection');

        shell('What shaped your decision?', `
            <form class="card">
                <label for="reflection">
                    What made you trust one robot more?
                    Why did you choose the same or different robots
                    for each area?
                </label>

                <p class="subtle">
                    Please do not include names or identifying details.
                    You may leave this blank.
                </p>

                <textarea
                    id="reflection"
                    name="reflection"
                    maxlength="3000"
                    placeholder="Share your thoughts…"
                ></textarea>

                <button class="primary">
                    Finish the experiment
                </button>
            </form>
        `, 'Final reflection', 95);

        bindSurvey('', () => {
            q('study_duration_ms', Date.now() - state.started);
            q('completed', true);

            state.finished = true;
            next('finish');
        });
    }

    function csv(rows, columns) {
        const cell = x =>
            '"' + String(x ?? '').replace(/"/g, '""') + '"';

        return [
            columns.join(','),
            ...rows.map(r =>
                columns.map(k =>
                    cell(
                        typeof r[k] === 'object' && r[k] !== null
                            ? JSON.stringify(r[k])
                            : r[k]
                    )
                ).join(',')
            )
        ].join('\r\n');
    }

    function exportData() {
        const cols = [
            ...new Set(
                state.trials.flatMap(r => Object.keys(r))
            )
        ];

        return {
            trial: csv(state.trials, cols),

            question: csv(
                Object.entries(state.questions).map(
                    ([key, value]) => ({
                        participant_id: id,
                        key,
                        value
                    })
                ),
                ['participant_id', 'key', 'value']
            )
        };
    }

    function download(name, data) {
        const a = document.createElement('a');

        a.href = URL.createObjectURL(
            new Blob([data], {
                type: 'text/csv;charset=utf-8'
            })
        );

        a.download = name;
        a.click();

        setTimeout(
            () => URL.revokeObjectURL(a.href),
            1000
        );
    }

    function showFinishError() {
        const el = document.getElementById('finish-status');

        if (el) {
            el.innerHTML = `
                <p class="error">
                    Saving failed. Keep this tab open,
                    check your connection, then retry.
                </p>

                <button id="retry">
                    Retry saving
                </button>
            `;
        }

        const b = document.getElementById('retry');

        if (b) {
            b.onclick = () => flush(finishSaved);
        }
    }

    function finishSaved() {
        const el = document.getElementById('finish-status');

        if (el) {
            el.innerHTML = `
                <p>Your responses have been saved.</p>

                <button id="complete" class="primary">
                    Close study / complete task
                </button>
            `;

            document.getElementById('complete').onclick = () => {
                api.completeHIT();
            };
        }
    }

    function finish() {
        shell('Thank you for taking part', `
            <div class="card">
                <p>
                    One robot chose to save more lives.
                    The other chose to keep a promise.
                    We want to learn how these choices affect your trust
                    and who you would put in charge.
                </p>

                <p>
                    The robot replies were scripted.
                    They do not show what Tesla or a real robot would decide.
                </p>

                <p>
                    Julian Arceo &amp; Zachary Alexander · Purdue Northwest
                </p>

                <div id="finish-status"></div>

                ${preview
                    ? `
                        <div class="actions">
                            <button id="trials">
                                Download trialdata.csv
                            </button>

                            <button id="questions-export">
                                Download questiondata.csv
                            </button>

                            <button id="again">
                                Start a new preview
                            </button>
                        </div>
                    `
                    : ''
                }
            </div>
        `, 'Debrief', 100);

        if (preview) {
            document.getElementById('finish-status').textContent =
                'Preview complete. These files contain only this preview session.';

            document.getElementById('trials').onclick = () => {
                download(
                    'trialdata.csv',
                    exportData().trial
                );
            };

            document.getElementById('questions-export').onclick = () => {
                download(
                    'questiondata.csv',
                    exportData().question
                );
            };

            document.getElementById('again').onclick = () => {
                location.href = location.pathname;
            };
        } else {
            document.getElementById('finish-status').textContent =
                'Saving your responses…';

            flush(finishSaved);
        }
    }

    function render() {
        stopped = false;

        if (state.step === 'consent') {
            consent();
        } else if (state.step === 'demographics') {
            demographics();
        } else if (state.step === 'media') {
            media();
        } else if (state.step === 'explanation') {
            explanation();
        } else if (state.step === 'understanding') {
            understanding();
        } else if (state.step === 'instructions') {
            instructions();
        } else if (state.step === 'scenario') {
            scenario();
        } else if (state.step.startsWith('dialogue_')) {
            dialogue(Number(state.step.slice(-1)));
        } else if (state.step.startsWith('ratings_')) {
            ratings(Number(state.step.slice(-1)));
        } else if (state.step.startsWith('mdmt_')) {
            const [, index, block] = state.step.split('_').map(Number);
            mdmt(index, block);
        } else if (state.step === 'authority') {
            authority();
        } else if (state.step === 'reflection') {
            reflection();
        } else if (state.step === 'finish') {
            finish();
        } else {
            shell('The study has ended', `
                <p>
                    ${state.step === 'media_failed'
                        ? 'The equipment check was not completed. Please tell the study team about the problem.'
                        : 'You have stopped participating. Responses already recorded remain saved.'
                    }
                </p>

                <p>You may close this window.</p>
            `, 'Thank you');
        }
    }

    // State access for preview tests; unavailable in psiTurk mode.
    if (preview) {
        window.studyDemo = {
            getState: () => structuredClone(state),
            plan,
            exportData
        };
    }

    render();
})();