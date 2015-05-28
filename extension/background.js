(function () {
  var HOME_URL = 'http://www.senscritique.com';
  var NOTIFICATIONS_URL = 'http://www.senscritique.com/notifications';
  var SOCIALCOUNT_URL = 'http://www.senscritique.com/users/socialCount.json';
  
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
    var timestamp = Math.round(new Date().getTime() / 1000);
    xhr('GET', SOCIALCOUNT_URL + '?_=' + timestamp, function (data) {
      var json, count;

      // no data or not logged in
      //if (data === false || '/signin') {
      //  callback(false);
      //}

      try {
        json = JSON.parse(data);
        count = json.json.notifications_count;
      } catch (e) {
        console.error("Parsing error:", e.message);
        callback(false);
      }

      if (count > 0) {
        callback(count.toString());
      } else if (count === 0) {
        callback('0');
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
      //console.log(count);
      if (count !== false) {
        render((count !== '0' ? count : ''), [208, 0, 24, 255], chrome.i18n.getMessage('browserActionDefaultTitle', count));
      } else {
        render('?', [190, 190, 190, 230], chrome.i18n.getMessage('browserActionErrorTitle'));
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
    update();
  });

  update();
})();