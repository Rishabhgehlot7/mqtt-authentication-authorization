import mqtt from "mqtt";
import React, { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import MqttConnection from "../components/MqttConnection";
import MqttMessages from "../components/MqttMessages";
import MqttPublish from "../components/MqttPublish";
import MqttSubscribe from "../components/MqttSubscribe";
import Button from "../components/ui/Button";
import type { MqttMessage } from "../types/mqtt";

const MqttDashboard: React.FC = () => {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
  const [messages, setMessages] = useState<MqttMessage[]>([]);

  const BROKER_URL = "ws://localhost:8888";

  const connectToBroker = (username: string, password: string) => {
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

      mqttClient.on("connect", (packet) => {
        console.log(
          `[client] Connected (session: ${
            packet.sessionPresent ? "existing" : "new"
          })`
        );
        setConnected(true);
        setConnecting(false);
        setAuthError(null);
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
        setMessages((prev) => [messageData, ...prev].slice(0, 100));
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

      setClient(mqttClient);
    } catch (error) {
      console.error("[client] Failed to create connection:", error);
      setAuthError("Failed to connect to broker");
      setConnecting(false);
    }
  };

  const disconnect = () => {
    if (client) {
      client.end(true, () => {
        console.log("[client] Disconnected");
        setClient(null);
        setConnected(false);
        setConnecting(false);
        setSubscribedTopics([]);
        setMessages([]);
      });
    }
  };

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

  const publishMessage = (topic: string, message: string) => {
    if (!client || !connected || !message.trim() || !topic) {
      setAuthError("Cannot publish: not connected or missing message/topic");
      return;
    }

    client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error(`[client] Publish error to ${topic}:`, err);
        setAuthError(`Publish denied: ${err.message}`);
      } else {
        console.log(`[client] Published to ${topic}: ${message}`);
        setAuthError(null);
      }
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    return () => {
      if (client) {
        client.end(true);
      }
    };
  }, [client]);

  const sidebarContent = (
    <div className="space-y-2">
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
        Quick Actions
      </div>
      <div className="space-y-1">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="justify-start"
          onClick={() => subscribeToTopic("device/response")}
          disabled={!connected}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Subscribe Default
        </Button>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="justify-start"
          onClick={() => publishMessage("device/data", "Hello World")}
          disabled={!connected}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          Send Test Message
        </Button>
      </div>

      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider mt-6">
        Broker Info
      </div>
      <div className="px-3 py-2 text-xs text-gray-500 space-y-1">
        <div>WebSocket: ws://localhost:8888</div>
        <div>QoS: 1</div>
        <div>Keep Alive: 60s</div>
      </div>
    </div>
  );

  return (
    <MainLayout sidebar={sidebarContent}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Connection & Status */}
        <div className="lg:col-span-1 space-y-6">
          <MqttConnection
            client={client}
            connected={connected}
            connecting={connecting}
            authError={authError}
            subscribedTopics={subscribedTopics}
            onConnect={connectToBroker}
            onDisconnect={disconnect}
            onSubscribe={subscribeToTopic}
            onUnsubscribe={unsubscribeFromTopic}
            onPublish={publishMessage}
            messages={messages}
            clearMessages={clearMessages}
          />
        </div>

        {/* Right Column - Publish, Subscribe, Messages */}
        <div className="lg:col-span-2 space-y-6">
          {connected && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MqttPublish
                  client={client}
                  connected={connected}
                  connecting={connecting}
                  authError={authError}
                  subscribedTopics={subscribedTopics}
                  onConnect={connectToBroker}
                  onDisconnect={disconnect}
                  onSubscribe={subscribeToTopic}
                  onUnsubscribe={unsubscribeFromTopic}
                  onPublish={publishMessage}
                  messages={messages}
                  clearMessages={clearMessages}
                />
                <MqttSubscribe
                  client={client}
                  connected={connected}
                  connecting={connecting}
                  authError={authError}
                  subscribedTopics={subscribedTopics}
                  onConnect={connectToBroker}
                  onDisconnect={disconnect}
                  onSubscribe={subscribeToTopic}
                  onUnsubscribe={unsubscribeFromTopic}
                  onPublish={publishMessage}
                  messages={messages}
                  clearMessages={clearMessages}
                />
              </div>
            </>
          )}

          <MqttMessages
            messages={messages}
            onClearMessages={clearMessages}
            connected={connected}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default MqttDashboard;
