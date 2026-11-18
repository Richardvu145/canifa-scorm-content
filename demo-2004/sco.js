/* A deliberately plain SCORM 2004 SCO: reads its resume state synchronously after Initialize. */
(function () {
  function findAPI(w) { for (var i = 0; w && i < 10; i++) { if (w.API_1484_11) return w.API_1484_11; if (w.parent === w) break; w = w.parent; } return null; }
  var api = findAPI(window) || (window.opener && findAPI(window.opener));
  var log = [], t0 = Date.now();
  function call(name) {
    var args = [].slice.call(arguments, 1), r = api[name].apply(api, args), err = api.GetLastError();
    log.push({ call: name, args: args, result: r, error: err });
    document.getElementById('log').textContent = log.map(function (l) { return l.call + '(' + l.args.join(', ') + ') = ' + l.result + ' [' + l.error + ']'; }).join('\n');
    return r;
  }
  function iso(ms) { return 'PT' + Math.round(ms / 1000) + 'S'; }
  var sco = window.__sco = { version: '2004', api: !!api, log: log };
  if (!api) { document.getElementById('status').textContent = 'Không tìm thấy API SCORM'; return; }
  sco.init = call('Initialize', '');
  sco.resume = {
    entry: call('GetValue', 'cmi.entry'),
    location: call('GetValue', 'cmi.location'),
    suspend: call('GetValue', 'cmi.suspend_data'),
    completion: call('GetValue', 'cmi.completion_status'),
    success: call('GetValue', 'cmi.success_status'),
    learnerId: call('GetValue', 'cmi.learner_id'),
    learnerName: call('GetValue', 'cmi.learner_name'),
    totalTime: call('GetValue', 'cmi.total_time')
  };
  var page = parseInt(sco.resume.location || '0', 10) || 0;
  document.getElementById('status').textContent = 'Trang ' + page + (sco.resume.entry === 'resume' ? ' (học tiếp)' : '');
  if (sco.resume.completion === 'unknown' || sco.resume.completion === 'not attempted') call('SetValue', 'cmi.completion_status', 'incomplete');
  sco.next = function () {
    page++;
    call('SetValue', 'cmi.location', String(page));
    call('SetValue', 'cmi.suspend_data', JSON.stringify({ page: page, seen: Array.from({ length: page }, function (_, i) { return i + 1; }) }));
    call('SetValue', 'cmi.progress_measure', String(Math.min(1, page / 4)));
    call('SetValue', 'cmi.exit', 'suspend');
    return call('Commit', '');
  };
  sco.pass = function (score) {
    call('SetValue', 'cmi.score.min', '0');
    call('SetValue', 'cmi.score.max', '100');
    call('SetValue', 'cmi.score.raw', String(score));
    call('SetValue', 'cmi.score.scaled', String(score / 100));
    call('SetValue', 'cmi.success_status', score >= 70 ? 'passed' : 'failed');
    call('SetValue', 'cmi.completion_status', 'completed');
    return call('Commit', '');
  };
  sco.finish = function (suspend, fakeMs) {
    call('SetValue', 'cmi.session_time', iso(fakeMs != null ? fakeMs : Date.now() - t0));
    call('SetValue', 'cmi.exit', suspend ? 'suspend' : 'normal');
    return call('Terminate', '');
  };
  sco.bad = function () { return { set: call('SetValue', 'cmi.success_status', 'great'), err: api.GetLastError() }; };
  document.getElementById('next').onclick = function () { sco.next(); };
  document.getElementById('pass').onclick = function () { sco.pass(85); };
  document.getElementById('done').onclick = function () { sco.finish(false); };
})();
