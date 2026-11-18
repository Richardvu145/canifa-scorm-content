/* A deliberately plain SCORM 1.2 SCO: it reads its resume state synchronously right after
   LMSInitialize, like most authoring tools do, so the test catches asynchronous runtimes. */
(function () {
  function findAPI(w) { for (var i = 0; w && i < 10; i++) { if (w.API) return w.API; if (w.parent === w) break; w = w.parent; } return null; }
  var api = findAPI(window) || (window.opener && findAPI(window.opener));
  var log = [], t0 = Date.now();
  function call(name) {
    var args = [].slice.call(arguments, 1), r = api[name].apply(api, args), err = api.LMSGetLastError();
    log.push({ call: name, args: args, result: r, error: err });
    document.getElementById('log').textContent = log.map(function (l) { return l.call + '(' + l.args.join(', ') + ') = ' + l.result + ' [' + l.error + ']'; }).join('\n');
    return r;
  }
  function hms(ms) { var s = Math.round(ms / 1000), p = function (n) { return (n < 10 ? '0' : '') + n; }; return p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60); }
  var sco = window.__sco = { version: '1.2', api: !!api, log: log };
  if (!api) { document.getElementById('status').textContent = 'Không tìm thấy API SCORM'; return; }
  sco.init = call('LMSInitialize', '');
  sco.resume = {
    entry: call('LMSGetValue', 'cmi.core.entry'),
    location: call('LMSGetValue', 'cmi.core.lesson_location'),
    suspend: call('LMSGetValue', 'cmi.suspend_data'),
    status: call('LMSGetValue', 'cmi.core.lesson_status'),
    studentId: call('LMSGetValue', 'cmi.core.student_id'),
    studentName: call('LMSGetValue', 'cmi.core.student_name'),
    totalTime: call('LMSGetValue', 'cmi.core.total_time')
  };
  var page = parseInt(sco.resume.location || '0', 10) || 0;
  document.getElementById('status').textContent = 'Trang ' + page + (sco.resume.entry === 'resume' ? ' (học tiếp)' : '');
  if (sco.resume.status === 'not attempted' || !sco.resume.status) call('LMSSetValue', 'cmi.core.lesson_status', 'incomplete');
  sco.next = function () {
    page++;
    call('LMSSetValue', 'cmi.core.lesson_location', String(page));
    call('LMSSetValue', 'cmi.suspend_data', JSON.stringify({ page: page, seen: Array.from({ length: page }, function (_, i) { return i + 1; }) }));
    call('LMSSetValue', 'cmi.core.exit', 'suspend');
    return call('LMSCommit', '');
  };
  sco.pass = function (score) {
    call('LMSSetValue', 'cmi.core.score.min', '0');
    call('LMSSetValue', 'cmi.core.score.max', '100');
    call('LMSSetValue', 'cmi.core.score.raw', String(score));
    call('LMSSetValue', 'cmi.core.lesson_status', score >= 70 ? 'passed' : 'failed');
    return call('LMSCommit', '');
  };
  sco.finish = function (suspend, fakeMs) {
    call('LMSSetValue', 'cmi.core.session_time', hms(fakeMs != null ? fakeMs : Date.now() - t0));
    call('LMSSetValue', 'cmi.core.exit', suspend ? 'suspend' : '');
    return call('LMSFinish', '');
  };
  sco.bad = function () { return { set: call('LMSSetValue', 'cmi.core.lesson_status', 'great'), err: api.LMSGetLastError() }; };
  document.getElementById('next').onclick = function () { sco.next(); };
  document.getElementById('pass').onclick = function () { sco.pass(85); };
  document.getElementById('done').onclick = function () { sco.finish(false); };
})();
