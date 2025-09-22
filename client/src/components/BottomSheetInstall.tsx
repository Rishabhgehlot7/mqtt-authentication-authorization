import { useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

const BottomSheetInstall = () => {
  const { deferredPrompt, promptInstall } = useInstallPrompt();
  const [isOpen, setIsOpen] = useState(true);

  if (!deferredPrompt || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl shadow-xl p-5 animate-slide-up">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
          Install MQTT App
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
          Get the app on your mobile for a better experience.
        </p>

        {/* Actions */}
        <div className="mt-5 flex justify-center gap-4">
          <button
            onClick={promptInstall}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition"
          >
            Install
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomSheetInstall;
