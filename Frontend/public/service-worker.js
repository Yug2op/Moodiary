// public/sw.js
self.addEventListener("push", (event) => {
    if (!event.data) return;
    try {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || "/web-app-manifest-192x192.png",
            badge: "/badge.png",
            tag: "daily-mood-reminder",
            renotify: true,
            vibrate: [300, 100, 300, 100, 400], // Custom vibration pattern for Android phones
            data: { url: "/mood" }, // Where to open when tapped
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error("Push Notification Error:", error);
    }
});



// Open your application when the user taps on the message banner
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});