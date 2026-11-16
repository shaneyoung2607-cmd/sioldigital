document.getElementById('copy').addEventListener('click', function () {
  var btn = this, text = document.getElementById('email').textContent;
  var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy email'; }, 1800); };
  try {
    navigator.clipboard.writeText(text).then(done, function () { selectEmail(); });
  } catch (e) { selectEmail(); }
  function selectEmail() {
    var r = document.createRange(); r.selectNodeContents(document.getElementById('email'));
    var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Press Ctrl+C';
  }
});

// Enquiries are forwarded to sioldigital@gmail.com by FormSubmit (formsubmit.co).
var ENQUIRY_ENDPOINT = 'https://formsubmit.co/ajax/sioldigital@gmail.com';

document.getElementById('enquiry').addEventListener('submit', function (e) {
  e.preventDefault();
  var form = this;
  var note = document.getElementById('note');
  var button = form.querySelector('button[type="submit"]');
  var val = function (id) { return document.getElementById(id).value.trim(); };
  var show = function (text, isError) {
    note.textContent = text;
    note.classList.toggle('is-error', !!isError);
    note.hidden = false;
  };

  var name = val('name'), reply = val('reply');
  if (!name) { show('Please add your name.', true); document.getElementById('name').focus(); return; }
  if (!reply || !document.getElementById('reply').checkValidity()) {
    show('Please add an email address so we can reply.', true); document.getElementById('reply').focus(); return;
  }
  if (val('hp')) return; // spam bot filled the hidden field

  var needs = Array.prototype.map.call(form.querySelectorAll('.checks input:checked'), function (box) {
    return box.parentNode.textContent.trim();
  });

  button.disabled = true;
  button.textContent = 'Sending…';
  note.hidden = true;

  fetch(ENQUIRY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject: 'New Síol Digital enquiry from ' + name,
      _replyto: reply,
      _template: 'table',
      _captcha: 'false',
      Name: name,
      Business: val('biz') || '—',
      Email: reply,
      Phone: val('phone') || '—',
      Needs: needs.length ? needs.join(', ') : '—',
      Message: val('msg') || '—'
    })
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (r) {
      if (!r.ok || String(r.data.success) !== 'true') throw new Error(r.data.message || 'Send failed');
      form.reset();
      show('Go raibh maith agat, ' + name + '! Your enquiry is with us and we will reply within two working days.');
    })
    .catch(function () {
      show('Sorry, your enquiry did not send. Please email us at sioldigital@gmail.com and we will get back to you.', true);
    })
    .then(function () {
      button.disabled = false;
      button.textContent = 'Send enquiry';
    });
});
