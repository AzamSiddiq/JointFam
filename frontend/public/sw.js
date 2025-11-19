// Listen for push events
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notification";
  const options = {
    body: data.body || "",
    data: data, // include full data for click handling
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const data = event.notification.data || {};

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/"); // open app if not already open
      }
    })
  );
});
