import React, { useState } from 'react';
import type { MqttClientProps } from '../types/mqtt';

const MqttPublish: React.FC<MqttClientProps> = ({ onPublish, connected }) => {
  const [topic, setTopic] = useState('device/data');
  const [message, setMessage] = useState('');

  const handlePublish = () => {
    if (topic && message.trim()) {
      onPublish(topic, message);
      setMessage('');
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-3 text-lg">Publish Message</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Publish Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
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
            onKeyPress={(e) => e.key === 'Enter' && handlePublish()}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePublish}
            disabled={!connected || !message.trim() || !topic}
            className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send Message
          </button>
          <button
            onClick={() => setMessage('')}
            disabled={!message.trim()}
            className="px-4 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default MqttPublish;