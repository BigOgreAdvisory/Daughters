/* Web version of Space Words: installs the offline worker (sw.js) and asks it to fetch the voice clips
   in the background. Also tidies the hub for a browser (ES5, like the rest). */
(function(){
"use strict";
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
    navigator.serviceWorker.ready.then(function(reg){
      if (reg.active) reg.active.postMessage({ type: "prefetch-audio" });
    }).catch(function(){});
    // ask the browser not to throw the 60 MB of clips away when space gets tight
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function(){}); } catch(e){}
  });
}
/* "Pick a mission" in a browser: there are no photos to go back to, so Back would do nothing */
if (!window.AndroidApp && !document.querySelector('meta[name="parent"]')) {
  var b = document.getElementById("backBtn");
  if (b) b.style.display = "none";
}
})();
