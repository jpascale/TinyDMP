function getSavedUsername(callback) {
  chrome.storage.sync.get('user', (items) => {
    callback(chrome.runtime.lastError ? null : items['user']);
  });
}

function saveUsername(user) {
  var items = {};
  items['user'] = user;
  chrome.storage.sync.set(items);
}

function getRecommend(user, cb) {
  var base = 'http://localhost:8000/t/recommend';
  var query = '?user=' + user;
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState == XMLHttpRequest.DONE) {
      cb(request.responseText);
    }
  }

  request.open("GET", base + query, true);
  request.send(null);
}

document.addEventListener('DOMContentLoaded', () => {
  var input = document.getElementById('name-input');
  var button = document.getElementById('submit');
  var feedback = document.getElementById('feedback');
  var recommend = document.getElementById('recommend');

  button.addEventListener("click", function () {
    if (input.value) {
      saveUsername(input.value);
    } else {
      alert('Tenes que ingresar tu nombre :)');
    }
    return false;
  }, false);

  getSavedUsername((username) => {
    if (username) {
      input.value = username;
      feedback.textContent = 'Usuario configurado :)';
      getRecommend(username, function (rec) {
        recommend.textContent = 'Recomendado: ' + rec;
      });
    } else {
      feedback.textContent = 'No tenés usuario configurado';
    }
  });
});