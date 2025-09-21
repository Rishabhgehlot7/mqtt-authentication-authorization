import mqtt from "mqtt";
import React, { useEffect, useState } from "react";

interface MqttMessage {
  topic: string;
  payload: string;
  timestamp: Date;
}

const MqttClient: React.FC = () => {
  // Connection states
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Auth states
  const [username, setUsername] = useState("rishabh");
  const [password, setPassword] = useState("rishabh");
  const [authError, setAuthError] = useState<string | null>(null);

  // Message states
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<MqttMessage[]>([]);

  // Topic states
  const [publishTopic, setPublishTopic] = useState("device/data");
  const [subscribeTopic, setSubscribeTopic] = useState("device/response");
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);

  // Broker config
  const BROKER_URL = "ws://localhost:8888";

  // Connect to MQTT broker
  const connectToBroker = async () => {
    if (!username || !password) {
      setAuthError("Username and password are required");
      return;
    }

    setConnecting(true);
    setAuthError(null);
    setConnected(false);

    try {
      const clientId = `react-client-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2, 8)}`;

      const mqttClient = mqtt.connect(BROKER_URL, {
        username,
        password,
        clientId,
        connectTimeout: 5000,
        reconnectPeriod: 1000,
        clean: true,
      });

      // Connection events
      mqttClient.on("connect", (packet) => {
        console.log(
          `[client] Connected to broker (session: ${
            packet.sessionPresent ? "existing" : "new"
          })`
        );
        setConnected(true);
        setConnecting(false);
        setAuthError(null);

        // Subscribe to configured topic
        if (subscribeTopic) {
          subscribeToTopic(subscribeTopic);
        }
      });

      mqttClient.on("reconnect", () => {
        console.log("[client] Attempting to reconnect...");
        setConnecting(true);
      });

      mqttClient.on("message", (topic, payload) => {
        const messageData: MqttMessage = {
          topic,
          payload: payload.toString(),
          timestamp: new Date(),
        };

        console.log(`[client] Message on ${topic}:`, payload.toString());
        setReceivedMessages((prev) => [messageData, ...prev].slice(0, 50)); // Keep last 50 messages
      });

      mqttClient.on("error", (err) => {
        console.error("[client] Connection error:", err);
        setAuthError(`Connection error: ${err.message}`);
        setConnecting(false);
      });

      mqttClient.on("close", () => {
        console.log("[client] Connection closed");
        setConnected(false);
        setConnecting(false);
        setSubscribedTopics([]);
      });

      mqttClient.on("offline", () => {
        console.log("[client] Client is offline");
        setConnected(false);
        setConnecting(false);
      });

      // Store client reference
      setClient(mqttClient);
    } catch (error) {
      console.error("[client] Failed to create connection:", error);
      setAuthError("Failed to connect to broker");
      setConnecting(false);
    }
  };

  // Subscribe to topic
  const subscribeToTopic = (topic: string) => {
    if (!client || !connected) {
      setAuthError("Not connected to broker");
      return;
    }

    if (subscribedTopics.includes(topic)) {
      console.log(`[client] Already subscribed to ${topic}`);
      return;
    }

    client.subscribe(topic, { qos: 1 }, (err, granted) => {
      if (err) {
        console.error(`[client] Subscribe error for ${topic}:`, err);
        setAuthError(`Failed to subscribe to ${topic}: ${err.message}`);
      } else {
        console.log(`[client] Subscribed to ${topic}:`, granted);
        setSubscribedTopics((prev) => [...prev, topic]);
        setAuthError(null);
      }
    });
  };

  // Unsubscribe from topic
  const unsubscribeFromTopic = (topic: string) => {
    if (!client || !connected) return;

    client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`[client] Unsubscribe error for ${topic}:`, err);
      } else {
        console.log(`[client] Unsubscribed from ${topic}`);
        setSubscribedTopics((prev) => prev.filter((t) => t !== topic));
      }
    });
  };

  // Publish message
  const sendMessage = () => {
    if (!client || !connected || !message.trim() || !publishTopic) {
      setAuthError("Cannot publish: not connected or missing message/topic");
      return;
    }

    client.publish(publishTopic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error(`[client] Publish error to ${publishTopic}:`, err);
        setAuthError(`Publish denied: ${err.message}`);
      } else {
        console.log(`[client] Published to ${publishTopic}: ${message}`);
        setAuthError(null);
        setMessage(""); // Clear input after successful publish
      }
    });
  };

  // Disconnect
  const disconnect = () => {
    if (client) {
      client.end(true, () => {
        console.log("[client] Disconnected");
        setClient(null);
      });
    }
    setConnected(false);
    setConnecting(false);
    setSubscribedTopics([]);
    setReceivedMessages([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.end(true);
      }
    };
  }, [client]);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">MQTT Client Panel</h2>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Status:</span>
          {connecting && (
            <span className="flex items-center text-yellow-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              Connecting...
            </span>
          )}
          {connected && (
            <span className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Connected
            </span>
          )}
          {!connected && !connecting && (
            <span className="flex items-center text-red-600">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Disconnected
            </span>
          )}
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{authError}</p>
          </div>
        )}
      </div>

      {/* Authentication */}
      {!connected && !connecting && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-3">Connect to Broker</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={connectToBroker}
              disabled={!username || !password}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Publish Section */}
      {connected && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-3">Publish Message</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Publish Topic
              </label>
              <input
                type="text"
                value={publishTopic}
                onChange={(e) => setPublishTopic(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., device/data"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={sendMessage}
                disabled={!message.trim() || !publishTopic}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
              <button
                onClick={() => setMessage("")}
                disabled={!message.trim()}
                className="px-4 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribe Section */}
      {connected && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-3">Subscriptions</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Subscribe Topic
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={subscribeTopic}
                  onChange={(e) => setSubscribeTopic(e.target.value)}
                  className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., device/response"
                />
                <button
                  onClick={() => subscribeToTopic(subscribeTopic)}
                  disabled={
                    !subscribeTopic || subscribedTopics.includes(subscribeTopic)
                  }
                  className="px-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Active Subscriptions */}
            {subscribedTopics.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Active Subscriptions
                </label>
                <div className="flex flex-wrap gap-2">
                  {subscribedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                    >
                      {topic}
                      <button
                        onClick={() => unsubscribeFromTopic(topic)}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Section */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold mb-3">
          Received Messages ({receivedMessages.length})
        </h3>
        {receivedMessages.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No messages received yet...
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {receivedMessages.map((msg, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-sm text-blue-600">
                    /{msg.topic}
                  </span>
                  <span className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm break-words">{msg.payload}</p>
              </div>
            ))}
          </div>
        )}
        {connected && (
          <button
            onClick={() => setReceivedMessages([])}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Messages
          </button>
        )}
      </div>

      {/* Disconnect Button */}
      {connected && (
        <div className="mt-4 text-center">
          <button
            onClick={disconnect}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default MqttClient;
