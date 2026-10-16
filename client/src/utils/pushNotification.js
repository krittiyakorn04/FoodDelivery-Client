import { subscribePush } from "../api/PushNotification";

// =====================================================
// แปลง VAPID Public Key
// =====================================================

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4,
  );

  const base64 = (
    base64String +
    padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0)),
  );
};

// =====================================================
// เปิด Push Notification
// =====================================================

export const enablePushNotification = async (token) => {
  try {
    if (!token) {
      console.log("ไม่พบ Token");
      return false;
    }

    // Browser รองรับ Notification หรือไม่
    if (!("Notification" in window)) {
      console.log(
        "Browser นี้ไม่รองรับ Notification",
      );
      return false;
    }

    // Browser รองรับ Service Worker หรือไม่
    if (!("serviceWorker" in navigator)) {
      console.log(
        "Browser นี้ไม่รองรับ Service Worker",
      );
      return false;
    }

    // Browser รองรับ Push หรือไม่
    if (!("PushManager" in window)) {
      console.log(
        "Browser นี้ไม่รองรับ Push Notification",
      );
      return false;
    }

    // =====================================================
    // ขอ Permission
    // =====================================================


    let permission = Notification.permission;

    if (permission === "denied") {
      console.log("ผู้ใช้ต้องเปิดสิทธิ์จากการตั้งค่าเบราว์เซอร์");
      return false;
    }

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      return false;
    }


    // =====================================================
    // Register Service Worker
    // =====================================================

    const registration =
      await navigator.serviceWorker.register(
        "/sw.js",
      );

    await navigator.serviceWorker.ready;

    // =====================================================
    // เช็ก Subscription เดิม
    // =====================================================

    let subscription =
      await registration.pushManager.getSubscription();

    // =====================================================
    // ถ้ายังไม่มี ให้สร้างใหม่
    // =====================================================

    if (!subscription) {
      const vapidPublicKey =
        import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.error(
          "ไม่พบ VITE_VAPID_PUBLIC_KEY",
        );

        return false;
      }

      const applicationServerKey =
        urlBase64ToUint8Array(
          vapidPublicKey,
        );

      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
    }

    // =====================================================
    // ส่ง Subscription ไป Backend
    // =====================================================

    await subscribePush(
      token,
      subscription.toJSON(),
    );

    console.log(
      "เปิด Push Notification สำเร็จ",
    );

    return true;
  } catch (error) {
    console.error(
      "enablePushNotification error =",
      error,
    );

    return false;
  }
};