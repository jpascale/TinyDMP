chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url && isParsedWebsite(changeInfo.url)) {
    var user;
    getSavedUsername((username) => {
      if (username) {
        user = username;
      }
    });

    getMetadata(changeInfo.url);

    getLocalIPs(function (ips) {
      // sendData(user, ips[0], changeInfo.url);
    });
  }
});

function isParsedWebsite(url) {
  return url.indexOf('lanacion.com') > 0 || url.indexOf('infobae.com') > 0 || url.indexOf('clarin.com') > 0;
}

function getMetadata(url) {
  if (url.indexOf('lanacion.com') > 0) {
    var section = document.getElementsByClassName('encabezado')[0].children[0].getAttribute('title');
    var subsection = document.getElementsByClassName('encabezado')[0].children[1].children[0].textContent;
    if (!subsection) {
      var subsection = document.getElementsByClassName('encabezado')[0].children[0].textContent;
    }
    var title = document.querySelectorAll('[itemprop="headline"]')[0].textContent;
    var ps = document.getElementsByTagName('p');
    var text = '';
    for (var i = 0, len = ps.length; i < len; i++) {
      if (ps[i].textContent.length > 60 && !ps[i].textContent.startsWith('Los comentarios publicados')) {
        text += ps[i].textContent;
      }
    }
  } else if (url.indexOf('clarin.com') > 0) {
    var section = document.getElementsByClassName('breadcrumb')[0].children[1].children[1].textContent.trim();
    var subsection = document.getElementsByClassName('volanta')[0].textContent;
    var ps = document.getElementsByTagName('p');
    var text = '';
    for (var i = 0, len = ps.length; i < len; i++) {
      if (ps[i].textContent.length > 60 && !ps[i].textContent.startsWith('Para comentar') && !ps[i].textContent.startsWith('Registro Propiedad Intelectual')) {
        text += ps[i].textContent;
      }
    }
  } else if (url.indexOf('infobae.com') > 0) {
    var section = document.getElementsByClassName('header-label')[0].children[0].textContent;
    var ps = document.getElementsByTagName('p');
    var text = '';
    for (var i = 0, len = ps.length; i < len; i++) {
      if (ps[i].getAttribute('class') == "element element-paragraph") {
        text += ps[i].textContent;
      }
    }
  }
}

function sendData(username, ip, url) {
  var base = 'http://10.0.191.117:8000/t/trck';
  var query = '?name=' + username + '&ip=' + ip + '&url=' + encodeURIComponent(url) + '&save=true';
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
