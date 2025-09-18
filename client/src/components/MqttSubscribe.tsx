import React, { useState } from 'react';
import type { MqttClientProps } from '../types/mqtt';

const MqttSubscribe: React.FC<MqttClientProps> = ({ onSubscribe, onUnsubscribe, subscribedTopics, connected }) => {
  const [topic, setTopic] = useState('device/response');

  const handleSubscribe = () => {
    if (topic && !subscribedTopics.includes(topic)) {
      onSubscribe(topic);
      setTopic('');
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-3 text-lg">Subscriptions</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Subscribe Topic</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., device/response"
            />
            <button
              onClick={handleSubscribe}
              disabled={!connected || !topic || subscribedTopics.includes(topic)}
              className="px-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Subscribe
            </button>
          </div>
        </div>
        {subscribedTopics.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Active Subscriptions</label>
            <div className="flex flex-wrap gap-2">
              {subscribedTopics.map((subTopic) => (
                <span
                  key={subTopic}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                >
                  {subTopic}
                  <button
                    onClick={() => onUnsubscribe(subTopic)}
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
  );
};

export default MqttSubscribe;