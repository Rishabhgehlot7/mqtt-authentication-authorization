module.exports = {
  apps: [
    {
      name: "mqtt-fcm-broker",
      script: "./broker/broker.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
        BROKER_PORT: 1883,
        WS_PORT: 8888,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
        FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
        FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
        FIREBASE_AUTH_PROVIDER_X509_CERT_URL: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        FIREBASE_CLIENT_X509_CERT_URL: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        FIREBASE_UNIVERSE_DOMAIN: process.env.FIREBASE_UNIVERSE_DOMAIN,
        USERS: process.env.rishabh,
        PASSWORDS: process.env.rishabh,
        RISHABH_PUB: "#",
        RISHABH_SUB: "#",
      },
      env_production: {
        NODE_ENV: "production",
        BROKER_PORT: process.env.BROKER_PORT || 1883,
        WS_PORT: process.env.WS_PORT || 8888
      }
    },
    {
      name: "client",
      cwd: "./client",         // set working directory to client
      script: "npm",
      args: "run dev",         // start Vite dev server
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 5173
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5173
      }
    }
  ]
};
