import React from 'react';

import type { MqttMessage } from '../types/mqtt';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Card from './ui/Card';

interface MqttStatusProps {
  connected: boolean;
  connecting: boolean;
  messages: MqttMessage[];
  subscribedTopics: string[];
  onClearMessages: () => void;
}

const MqttStatus: React.FC<MqttStatusProps> = ({ 
  connected, 
  connecting, 
  messages, 
  subscribedTopics, 
  onClearMessages 
}) => {
  const getStatusColor = () => {
    if (connecting) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (connected) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = () => {
    if (connecting) return 'Connecting...';
    if (connected) return 'Connected';
    return 'Disconnected';
  };

  const statusIcon = () => {
    if (connecting) return (
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
    );
    if (connected) return (
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    );
    return (
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    );
  };

  return (
    <Card className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Status */}
        <div className="md:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor}`}>
                {statusIcon()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Connection</p>
                <p className={`text-sm font-semibold ${connecting ? 'text-yellow-600' : connected ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{subscribedTopics.length}</p>
              <p className="text-sm text-gray-600">Topics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Topics */}
      {subscribedTopics.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Active Subscriptions</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearMessages}
              disabled={messages.length === 0}
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subscribedTopics.map((topic) => (
              <Badge key={topic} variant="default" className="bg-blue-100 text-blue-800">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MqttStatus;