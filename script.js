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
document.getElementById('enquiry').addEventListener('submit', function (e) {
  e.preventDefault();
  var note = document.getElementById('note');
  var name = document.getElementById('name').value.trim();
  note.textContent = 'Go raibh maith agat' + (name ? ', ' + name : '') + '. This form is a preview and is not connected yet, so please email sioldigital@gmail.com for now.';
  note.hidden = false;
});
