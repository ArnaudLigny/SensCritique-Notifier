(function () {
  'use strict';

  /**
   * Config
   */

  var HOME_URL = 'https://www.senscritique.com';
  var NOTIFICATIONS_URL = 'https://www.senscritique.com/notifications';
  var SOCIALCOUNT_URL = 'https://www.senscritique.com/users/socialCount.json';

  /**
   * Main functions
   */

  // Notifications count function
  const notificationsCount = callback => {
    const parser = new DOMParser();
    var timestamp = Math.round(new Date().getTime() / 1000);

    window.fetch(SOCIALCOUNT_URL + '?_=' + timestamp, {
      credentials: 'same-origin',
      headers: new Headers({
        'X-Requested-With': 'XMLHttpRequest'
      })
    })
      .then(response => {
        if (response.ok) {
          return response.text();
        }

        throw new Error('Network response was not OK.');
      })
      .then(data => {
        const json = JSON.parse(data);
        const count = parseInt(json.json.notifications_count, 10) + parseInt(json.json.messages_count, 10);

        if (count >= 0) {
          callback(count.toString());
        } else {
          throw new Error('Unable to parse the response.');
        }
      })
      .catch(callback);
   };

   // Update badge
   function updateBadge() {
     notificationsCount(count => {
       if (count instanceof Error) {
         render(
           '?',
           [190, 190, 190, 255],
           chrome.i18n.getMessage('browserActionErrorTitle')
         );
       } else {
         render(
           parseInt(count, 10) ? count : '',
           [208, 0, 24, 255],
           chrome.i18n.getMessage('browserActionDefaultTitle', count)
         );
       }
     });
   }

   // Badge renderer
   function render(text, color, title) {
     chrome.browserAction.setBadgeText({text});
     chrome.browserAction.setBadgeBackgroundColor({color});
     chrome.browserAction.setTitle({title});
     chrome.browserAction.setIcon({path: 'icon-19.png'});
   }

   /**
   * Events
   */

  // Chrome alarm
  chrome.alarms.create({delayInMinutes: 1, periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(updateBadge);

  // Browser action
  chrome.browserAction.onClicked.addListener(tab => {
    updateBadge();
    chrome.tabs.create({
      url: NOTIFICATIONS_URL
    });
  });

  // Check whether new version is installed
  chrome.runtime.onInstalled.addListener(details => {
      updateBadge();
  });

  // Handle connection status events
  function handleConnectionStatus(event) {
    if (event.type === 'online') {
      updateBadge();
    } else if (event.type === 'offline') {
      render(
        '?',
        [245, 159, 0, 255],
        chrome.i18n.getMessage('browserActionErrorTitle')
      );
    }
  }
  window.addEventListener('online', handleConnectionStatus);
  window.addEventListener('offline', handleConnectionStatus);
})();
