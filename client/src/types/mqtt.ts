import type mqtt from "mqtt";

export interface MqttMessage {
  topic: string;
  payload: string;
  timestamp: Date;
}

export interface MqttClientProps {
  client: mqtt.MqttClient | null;
  connected: boolean;
  connecting: boolean;
  authError: string | null;
  subscribedTopics: string[];
  onConnect: (username: string, password: string) => void;
  onDisconnect: () => void;
  onSubscribe: (topic: string) => void;
  onUnsubscribe: (topic: string) => void;
  onPublish: (topic: string, message: string) => void;
  messages: MqttMessage[];
  clearMessages: () => void;
}
