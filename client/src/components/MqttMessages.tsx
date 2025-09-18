import { ViewfinderCircleIcon } from "@heroicons/react/24/solid";

import React, { useState } from "react";
import type { MqttMessage } from "../types/mqtt";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";

interface MqttMessagesProps {
  messages: MqttMessage[];
  onClearMessages: () => void;
  connected: boolean;
}

const MqttMessages: React.FC<MqttMessagesProps> = ({
  messages,
  onClearMessages,
  connected,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "errors">("all");

  const filteredMessages = messages
    .filter((msg) => {
      const matchesSearch =
        msg.payload.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "recent" && messages.indexOf(msg) < 10) ||
        (filter === "errors" && msg.payload.toLowerCase().includes("error"));
      return matchesSearch && matchesFilter;
    })
    .slice(0, 100); // Limit to 100 messages for performance

  const getMessageColor = (topic: string) => {
    const topicHash = topic
      .split("/")
      .reduce((acc, part) => acc + part.charCodeAt(0), 0);
    const colors = [
      "border-blue-500",
      "border-green-500",
      "border-purple-500",
      "border-orange-500",
      "border-pink-500",
    ];
    return colors[topicHash % colors.length];
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return timestamp.toLocaleTimeString();
  };

  return (
    <Card
      title="Message Feed"
      subtitle={`${filteredMessages.length} of ${messages.length} messages`}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <ViewfinderCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "recent" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("recent")}
          >
            Recent
          </Button>
          <Button
            variant={filter === "errors" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("errors")}
          >
            Errors
          </Button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No messages found" : "No messages yet"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? `No messages match "${searchTerm}"`
              : "Messages will appear here when published."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredMessages.map((msg, index) => (
            <div
              key={index}
              className="group p-4 bg-gray-50 rounded-lg border-l-4 transition-all duration-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${getMessageColor(
                      msg.topic
                    )}`}
                  ></div>
                  <span className="font-mono text-sm font-medium text-gray-900 truncate max-w-xs">
                    {msg.topic}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-900 break-words leading-relaxed">
                {msg.payload}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Badge variant="default" className="text-xs">
                  QoS 1
                </Badge>
                <div className="flex space-x-2">
                  <button className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded">
                    Copy
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded">
                    Pin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {connected && messages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing {filteredMessages.length} of {messages.length} messages
          </span>
          <Button variant="outline" size="sm" onClick={onClearMessages}>
            Clear All Messages
          </Button>
        </div>
      )}
    </Card>
  );
};

export default MqttMessages;
