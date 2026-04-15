if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    if (regs.length > 0) {
      var done = sessionStorage.getItem('sw_cleared');
      if (!done) {
        Promise.all(regs.map(function (r) { return r.unregister(); })).then(function () {
          if ('caches' in window) {
            caches.keys().then(function (ns) {
              Promise.all(ns.map(function (n) { return caches.delete(n); })).then(function () {
                sessionStorage.setItem('sw_cleared', '1');
                location.reload();
              });
            });
          } else {
            sessionStorage.setItem('sw_cleared', '1');
            location.reload();
          }
        });
      }
    }
  });
}
