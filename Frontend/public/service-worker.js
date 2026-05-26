// public/sw.js
self.addEventListener("push", (event) => {
    if (!event.data) return;
    try {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || "/web-app-manifest-192x192.png",
            badge: "/web-app-manifest-192x192.png",
            vibrate: [200, 100, 200], // Custom vibration pattern for Android phones
            data: { url: "/mood-entry" }, // Where to open when tapped

            sound: "/notification.mp3"
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