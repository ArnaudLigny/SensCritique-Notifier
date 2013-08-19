(function () {
  var NOTIFICATIONS_URL = 'http://www.senscritique.com/notifications';
  
  // XHR helper function
  var xhr = function () {
    var xhr = new XMLHttpRequest();
    return function(method, url, callback) {
      xhr.onreadystatechange = function () {
        // request finished and response is ready
        if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
            callback(false);
          }
          callback(xhr.responseText);
        }
      };
      xhr.open(method, url);
      xhr.send();
    };
  }();

  // main function
  window.NotificationsCount = function (callback) {
    var tmpDom = document.createElement('div');

    xhr('GET', NOTIFICATIONS_URL, function (data) {
      var notifElem, countElem;
      tmpDom.innerHTML = data;

      // no data
      if (data === false) {
        callback(false);
      }

      notifElem = tmpDom.querySelector('a[href="/notifications"].lahead-subnav-link');
      if (notifElem) {
        countElem = tmpDom.querySelector('span.lahead-user-notify');
        if (countElem) {
          callback(countElem.textContent);
        } else {
          callback('0');
        }
      }
      else {
        callback(false);
      }
    });
  };

  // badge renderer
  function render(badge, color, title) {
    chrome.browserAction.setBadgeText({
      text: badge
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: color
    });
    chrome.browserAction.setTitle({
      title: title
    });
  }

  // update badge
  function update() {
    NotificationsCount(function (count) {
      if (count !== false) {
        //console.log(count);
        render((count !== '0' ? count : ''), [208, 0, 24, 255], 'SensCritique notifications');
      } else {
        render('?', [190, 190, 190, 230], 'You should be logged into SensCritique');
      }
    });
  }

  // Chrome alarm
  chrome.alarms.create({periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(update);

  // browser action
  chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({
      url: NOTIFICATIONS_URL
    });
  });

  update();
})();