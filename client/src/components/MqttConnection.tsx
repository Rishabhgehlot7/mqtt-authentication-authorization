import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import toast from "react-hot-toast";
import type { MqttClientProps } from "../types/mqtt";
import Button from "./ui/Button";
import Card from "./ui/Card";

const MqttConnection: React.FC<MqttClientProps> = ({
  onConnect,
  connected,
  connecting,
  authError,
  onDisconnect,
}) => {
  const [username, setUsername] = useState("rishabh");
  const [password, setPassword] = useState("rishabh");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;
    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Username is required");
      toast.error("Username is required");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      toast.error("Password is required");
      isValid = false;
    } else if (password.length < 3) {
      setPasswordError("Password must be at least 3 characters");
      toast.error("Password must be at least 3 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleConnect = () => {
    if (!validateForm()) return;

    toast.loading("Connecting to broker...");
    onConnect(username, password);

    // Simulate delay before success (you can handle with real MQTT callbacks)
    setTimeout(() => {
      if (!authError) {
        toast.dismiss();
        // toast.success("Successfully connected to broker!");
      } else {
        toast.dismiss();
        toast.error(authError);
      }
    }, 1000);
  };

  const handleDisconnect = () => {
    onDisconnect();
    toast("Disconnected from broker", {
      icon: "🔌",
    });
    setUsernameError("");
    setPasswordError("");
  };

  if (connected) {
    return (
      <Card title="Connection Status" className="mb-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Successfully Connected!
          </h3>
          <p className="text-gray-600 mb-4">
            You are connected to the MQTT broker.
          </p>
          <Button variant="danger" size="lg" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Connect to MQTT Broker" className="mb-6">
      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) setUsernameError("");
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              usernameError
                ? "border-red-300 bg-red-50 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter username"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                passwordError
                  ? "border-red-300 bg-red-50 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Error from auth */}
        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{authError}</p>
          </div>
        )}

        {/* Connect Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleConnect}
          fullWidth
          disabled={connecting}
        >
          Connect to Broker
        </Button>
      </div>
    </Card>
  );
};

export default MqttConnection;
