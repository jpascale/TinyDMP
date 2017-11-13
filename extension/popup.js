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

document.addEventListener('DOMContentLoaded', () => {
  var input = document.getElementById('name-input');
  var button = document.getElementById('submit');
  var feedback = document.getElementById('feedback');

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
    } else {
      feedback.textContent = 'No tenés usuario configurado';
    }
  });
});