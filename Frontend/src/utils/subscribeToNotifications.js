// src/utils/subscribeUserNotifications.js
import api from "../apis/client";

// Utility converting VAPID key context string vectors to an unsigned integer array template block wrapper
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeUserNotifications = async () => {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.warn("Native push architectures are completely unsupported inside this browser runtime shell.");
      return false;
    }

    // 1. Request structural permissions from screen parameters
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("User explicitly blocked permission requirements context.");
      return false;
    }

    // 2. Access the active service worker registry sequence maps
    const registration = await navigator.serviceWorker.ready;
    
    // 3. Create push subscription configuration block elements
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);

    // 4. Dispatch metadata array maps straight into database record vectors via custom endpoint paths
    await api.post("/notifications/subscribe", { subscription });
    
    console.log("Device channel registration parameters linked securely.");
    return true;
  } catch (error) {
    console.error("Frontend registration handshake collapsed line error:", error);
    return false;
  }
};