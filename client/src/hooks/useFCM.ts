import { useEffect } from "react";
import { getToken, messaging, onMessage } from "../config/firebase.ts";

const useFCM = () => {
  useEffect(() => {
    // Request permission
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, { vapidKey: "BFNTgN2IWK-wkPII2_2eOCI3oG6sj7xEvPVZTDCAHIEybLUiRuWy7ljhKBlKX1P9VSFFXhazRulQEY8ybSLwwIU" })
          .then((currentToken) => {
            if (currentToken) {
              console.log("FCM Token:", currentToken);
              // Send token to backend
              fetch("http://localhost:3000/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: currentToken }),
              });
            } else {
              console.log("No registration token available.");
            }
          })
          .catch((err) => console.error("Error getting FCM token", err));
      }
    });

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log("FCM message received:", payload);
      alert(`Notification: ${payload.notification?.title}\n${payload.notification?.body}`);
    });
  }, []);
};

export default useFCM;
