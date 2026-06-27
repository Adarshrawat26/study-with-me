(function () {
  var ORIGIN = document.currentScript
    ? new URL(document.currentScript.src).origin
    : window.location.origin;

  if (document.getElementById("study-with-me-embed-root")) return;

  var root = document.createElement("div");
  root.id = "study-with-me-embed-root";
  root.style.cssText =
    "position:fixed;bottom:20px;right:20px;z-index:2147483647;width:320px;height:140px;pointer-events:auto;";

  var iframe = document.createElement("iframe");
  iframe.src = ORIGIN + "/embed";
  iframe.title = "Study with me timer";
  iframe.allow = "clipboard-write";
  iframe.style.cssText =
    "width:100%;height:100%;border:none;border-radius:16px;box-shadow:0 8px 32px rgba(236,72,153,0.2);background:transparent;";

  root.appendChild(iframe);
  document.body.appendChild(root);
})();
