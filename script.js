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

  // Show a problem right under the box it belongs to. Screen readers read it out
  // because each box is linked to its message (aria-describedby in index.html).
  var fieldError = function (id, text) {
    var input = document.getElementById(id), msg = document.getElementById(id + '-error');
    msg.textContent = text || '';
    msg.hidden = !text;
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return input;
  };

  var name = val('name'), reply = val('reply');
  var nameBad = !name;
  var replyBad = !reply || !document.getElementById('reply').checkValidity();
  var nameInput = fieldError('name', nameBad ? 'Please add your name.' : '');
  var replyInput = fieldError('reply', replyBad ? 'Please add an email address so we can reply.' : '');
  if (nameBad || replyBad) { note.hidden = true; (nameBad ? nameInput : replyInput).focus(); return; }
  if (val('hp')) return; // spam bot filled the hidden field

  var needs = Array.prototype.map.call(form.querySelectorAll('.checks input:checked'), function (box) {
    return box.parentNode.textContent.trim();
  });

  var fields = {
    Name: name,
    Business: val('biz') || '—',
    Email: reply,
    Phone: val('phone') || '—',
    Needs: needs.length ? needs.join(', ') : '—',
    Message: val('msg') || '—'
  };
  var payload = { _subject: 'New Síol Digital enquiry from ' + name, _replyto: reply, _template: 'table', _captcha: 'false' };
  Object.keys(fields).forEach(function (key) { payload[key] = fields[key]; });

  // One attempt at sending. FormSubmit can be slow, and now and then answers with a server error.
  var send = function () {
    return fetch(ENQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok || String(r.data.success) !== 'true') throw new Error(r.data.message || 'Send failed');
      });
  };

  button.disabled = true;
  button.textContent = 'Sending…';
  note.hidden = true;
  // If it is taking a while, say so, so the visitor knows to wait.
  var slow = setTimeout(function () { button.textContent = 'Still sending, one moment…'; }, 5000);

  send()
    .catch(function () {
      // First try failed: wait a moment and try once more before giving up.
      return new Promise(function (resolve) { setTimeout(resolve, 1500); }).then(send);
    })
    .then(function () {
      form.reset();
      show(', ' + name + '! Your enquiry is with us and we will reply within two working days.');
      // Mark the Irish thank-you as Irish so screen readers pronounce it properly.
      var thanks = document.createElement('span');
      thanks.lang = 'ga';
      thanks.textContent = 'Go raibh maith agat';
      note.insertBefore(thanks, note.firstChild);
    })
    .catch(function () {
      // Both tries failed. Keep what they typed in the form, and offer a link that
      // opens their own email app with the enquiry already written out.
      show('Sorry, your enquiry did not send. ', true);
      var body = Object.keys(fields).map(function (key) { return key + ': ' + fields[key]; }).join('\n');
      var link = document.createElement('a');
      link.href = 'mailto:sioldigital@gmail.com?subject=' + encodeURIComponent('Enquiry from ' + name) + '&body=' + encodeURIComponent(body);
      link.textContent = 'Email it to us instead';
      note.appendChild(link);
      note.appendChild(document.createTextNode(' (your details are filled in for you), or write to sioldigital@gmail.com.'));
    })
    .then(function () {
      clearTimeout(slow);
      button.disabled = false;
      button.textContent = 'Get my free audit';
      note.focus(); // moves screen readers (and the phone's view) to the result message
    });
});

// Clear a box's error as soon as the visitor starts fixing it.
['name', 'reply'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', function () {
    this.removeAttribute('aria-invalid');
    document.getElementById(id + '-error').hidden = true;
  });
});

// Phone menu: close it after a link is tapped.
var menu = document.getElementById('menu');
menu.addEventListener('click', function (e) {
  if (e.target.closest('a') && menu.hidePopover) menu.hidePopover();
});
