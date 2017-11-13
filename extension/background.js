chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    var user;
    getSavedUsername((username) => {
      if (username) {
        user = username;
      }
    });

    getLocalIPs(function (ips) {
      sendData(user, ips[0], changeInfo.url);
    });
  }
});

function sendData(username, ip, url) {
  var base = 'http://10.0.191.117:8000/t/trck';
  var query = '?name=' + username + '&ip=' + ip + '&url=' + encodeURIComponent(url);
  var request = new XMLHttpRequest();
  request.open("GET", base + query, true);
  request.send(null);
}

function getSavedUsername(callback) {
  chrome.storage.sync.get('user', (items) => {
    callback(chrome.runtime.lastError ? null : items['user']);
  });
}

function getLocalIPs(callback) {
  var ips = [];

  var RTCPeerConnection = window.RTCPeerConnection ||
    window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

  var pc = new RTCPeerConnection({
    // Don't specify any stun/turn servers, otherwise you will
    // also find your public IP addresses.
    iceServers: []
  });
  // Add a media line, this is needed to activate candidate gathering.
  pc.createDataChannel('');

  // onicecandidate is triggered whenever a candidate has been found.
  pc.onicecandidate = function (e) {
    if (!e.candidate) { // Candidate gathering completed.
      pc.close();
      callback(ips);
      return;
    }
    var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
    if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
      ips.push(ip);
  };
  pc.createOffer(function (sdp) {
    pc.setLocalDescription(sdp);
  }, function onerror() { });
}
