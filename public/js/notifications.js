var VAPID_PUBLIC_KEY = 'BIQQjQXUNvzuC3kRUyDRGCTr2WtXNGqtXSKUDg5f7RXjeEIIesWbP7H5NH6f-ewF4VP0kHJVhko23GC62L7EfJQ'; // IMPORTANT should match the one in .env file

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function unsubscribeUserFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return;
    }

    const successful = await subscription.unsubscribe();
    if (successful) {
      await removeSubscriptionFromBackend(subscription);
    } else {
      console.warn('Unsubscribe call completed, but not successful.');
    }
  } catch (error) {
    console.error('Failed to unsubscribe the user: ', error);
  }
}

async function removeSubscriptionFromBackend(subscription) {
    try {
    var response = await fetch('/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({endpoint :subscription.endpoint}),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Backend failed to accept subscription');
    }
    console.log('User unsubscribed successfully.');
  } catch (error) {
    console.error('Error sending subscription to backend: ', error);
  }
}


async function subscribeUserToPush() {
  try {
    var registration = await navigator.serviceWorker.ready; // Ensure SW is active
    var existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      // Optional: You might want to send it to the server again to ensure it's up-to-date
      // sendSubscriptionToBackend(existingSubscription);
      return;
    }

    var subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    await sendSubscriptionToBackend(subscription);
  } catch (error) {
    console.log('Failed to subscribe the user: ', error);
    if (Notification.permission === 'denied') {
      console.warn('Permission for notifications was denied');
    }
  }
}

async function sendSubscriptionToBackend(subscription) {
  try {
    var response = await fetch('/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Backend failed to accept subscription');
    }
    console.log('Subscription successfull.');
  } catch (error) {
    console.error('Error sending subscription to backend: ', error);
  }
}

function requestNotificationPermissionAndSubscribe() {
    var banner = document.getElementById('notification-banner');
    if(banner){
    banner.style.display = 'none';
}
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        return;
    }


   Notification.requestPermission(status => {
    console.log('Notification permission status:', status);
    if (status === 'granted') {
      subscribeUserToPush();
    } else {
      console.log('Permission not granted.');
    }
  });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/sw.js')
    .then(function(registration) {
      if (Notification.permission === 'granted') {
          subscribeUserToPush();
      } else if (Notification.permission !== 'denied') {
          console.log('Notification permission not yet granted');
      }
    }).catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
} else {
  console.warn('Push messaging is not supported by this browser.');
}

function showBanner () {
  var permission = Notification.permission;
  var banner = document.getElementById('notification-banner');
  if (permission === 'default' && banner) {
    banner.style.display = 'block';
  }
};

var laterbtn = document.getElementById('later-btn')

if(laterbtn){
  var banner = document.getElementById('notification-banner');
laterbtn.addEventListener('click', () => {
  localStorage.setItem('notification-banner', 'hidden');
  banner.style.display = 'none';
});
}

window.addEventListener('DOMContentLoaded', ()=>{
  if(localStorage && localStorage.getItem('notification-banner') === 'hidden'){
    var banner = document.getElementById('notification-banner');
    if(banner) banner.style.display = 'none';
  } else {
    showBanner();
  }
});