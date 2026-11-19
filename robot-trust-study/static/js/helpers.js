window.StudyHelpers = (() => {
  'use strict';
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );

  function plan(c, b) {
    const order = c === 0 ? ['outcome', 'care'] : ['care', 'outcome'];
    return order.map((style) => ({
      style,
      label: (style === 'outcome') === (b === 0) ? 'A' : 'B',
    }));
  }

  function select(name, label, options) {
    return ` <label for="${name}">${label}</label>
<select id="${name}" name="${name}" required>
<option value="">Choose an answer</option> ${options.map((x) => ` <option value="${esc(x)}">${esc(x)}</option> `).join('')} </select> `;
  }

  function scale(name, label, options = [1, 2, 3, 4, 5, 6, 7, 'skip']) {
    const captions = { skip: 'Prefer not to answer', does_not_fit: 'Does Not Fit' };
    return `<fieldset>
<legend>${label}</legend>
<div class="scale">${options
      .map(
        (value) => `<label>
<input type="radio" name="${esc(name)}" value="${esc(value)}" required> ${esc(captions[value] || value)} </label>`,
      )
      .join('')}</div>
</fieldset>`;
  }

  function values(form) {
    const data = {};
    form.querySelectorAll('[name]').forEach((e) => {
      if (!(e.name in data)) {
        data[e.name] = null;
      }
    });
    for (const [k, v] of new FormData(form)) {
      data[k] = v;
    }
    return data;
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

  function backButton() {
    return '<button type="button" id="previous">Previous</button>';
  }

  function playWholeVideo(video, ready, status, onFinished, onEvent = () => {}) {
    let finished = false,
      furthest = 0;
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
      if (
        finished ||
        !video.ended ||
        !Number.isFinite(video.duration) ||
        furthest < video.duration - 1
      )
        return;
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

  function csv(rows, columns) {
    const cell = (x) => '"' + String(x ?? '').replace(/"/g, '""') + '"';
    return [
      columns.join(','),
      ...rows.map((r) =>
        columns
          .map((k) => cell(typeof r[k] === 'object' && r[k] !== null ? JSON.stringify(r[k]) : r[k]))
          .join(','),
      ),
    ].join('\r\n');
  }

  function download(name, data) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([data], {
        type: 'text/csv;charset=utf-8',
      }),
    );
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  return { esc, plan, select, scale, values, gate, backButton, playWholeVideo, csv, download };
})();
