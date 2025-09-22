require('dotenv').config();
const aedes = require('aedes')();
const net = require('net');
const bcrypt = require('bcryptjs');
const http = require('http');
const ws = require('websocket-stream');
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors')

// --- FCM Setup ---
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// --- FCM token storage ---
const fcmTokens = new Set();
function saveToken(token) { fcmTokens.add(token); }
function removeToken(token) { fcmTokens.delete(token); }

// --- FCM send ---
function sendNotification(title, body, data = {}) {
    const message = { notification: { title, body }, data, tokens: Array.from(fcmTokens) };
    if (message.tokens.length === 0) return;
    admin.messaging().sendEachForMulticast(message)
        .then(res => console.log(`[FCM] Sent: ${res.successCount}/${res.successCount + res.failureCount}`))
        .catch(err => console.error('[FCM] Error:', err));
}

// --- Ports ---
const tcpPort = process.env.BROKER_PORT || 1883;
const wsPort = process.env.WS_PORT || 8888;

// --- Topic matching ---
function topicMatch(topic, rule) {
    if (rule === '#') return true;
    const regex = new RegExp('^' + rule.replace(/\+/g, '[^/]+').replace(/#/g, '.*') + '$');
    return regex.test(topic);
}

// --- Users ---
const users = {};
function addUser(username, plainPassword, pubRules, subRules) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plainPassword, salt);
    users[username] = { passwordHash: hash, pubRules, subRules };
}

const usernames = (process.env.USERS || "").split(",").map(u => u.trim()).filter(Boolean);
const passwords = (process.env.PASSWORDS || "").split(",").map(p => p.trim());

for (let i = 0; i < usernames.length; i++) {
    const u = usernames[i];
    const p = passwords[i] || "";

    const pubRules = (process.env[`${u.toUpperCase()}_PUB`] || "#")
        .split(",").map(r => r.trim()).filter(Boolean);

    const subRules = (process.env[`${u.toUpperCase()}_SUB`] || "#")
        .split(",").map(r => r.trim()).filter(Boolean);

    addUser(u, p, pubRules, subRules);
}

// --- Authentication ---
aedes.authenticate = (client, username, password, cb) => {
    if (!username || !password) {
        const err = new Error("Auth failed: missing credentials");
        err.returnCode = 4;
        return cb(err, false);
    }

    const user = users[username];
    if (!user) {
        const err = new Error("Auth failed: unknown user");
        err.returnCode = 4;
        return cb(err, false);
    }

    const ok = bcrypt.compareSync(password.toString(), user.passwordHash);
    if (!ok) {
        const err = new Error("Auth failed: bad password");
        err.returnCode = 4;
        return cb(err, false);
    }

    client.user = username;
    console.log(`[auth] ${client.id} authenticated as ${username}`);
    cb(null, true);
};

// --- Authorization ---
aedes.authorizePublish = (client, packet, cb) => {
    const user = users[client.user];
    if (!user) return cb(new Error("Publish denied: no user"));

    const allowed = user.pubRules.some((r) => topicMatch(packet.topic, r));
    if (!allowed) {
        console.log(`[authz] DENY publish by ${client.user} -> ${packet.topic}`);
        return cb(new Error("Publish denied"));
    }

    cb(null);
};

aedes.authorizeSubscribe = (client, sub, cb) => {
    const user = users[client.user];
    if (!user) return cb(new Error("Subscribe denied: no user"), null);

    const allowed = user.subRules.some((r) => topicMatch(sub.topic, r));
    if (!allowed) {
        console.log(`[authz] DENY subscribe by ${client.user} -> ${sub.topic}`);
        return cb(new Error("Subscribe denied"), null);
    }

    cb(null, sub);
};

// --- Events ---
aedes.on("client", (c) => console.log(`[event] Client connected: ${c.id}`));
aedes.on("clientDisconnect", (c) => console.log(`[event] Client disconnected: ${c.id}`));
aedes.on("publish", (pkt, c) => {
    if (c) {
        console.log(`[event] ${c.user} -> ${pkt.topic}: ${pkt.payload.toString()}`);
        sendNotification('New MQTT Message', `${c.user} -> ${pkt.topic}`);
    }
});
aedes.on("subscribe", (subs, c) => {
    if (c) console.log(`[event] ${c.user} subscribed: ${subs.map((s) => s.topic).join(", ")}`);
});

// --- TCP server ---
const server = net.createServer(aedes.handle);
server.listen(tcpPort, () => console.log(`[broker] TCP running on port ${tcpPort}`));

// --- WebSocket server ---
const httpServer = http.createServer();
ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(wsPort, () => console.log(`[broker] WebSocket running on ws://localhost:${wsPort}`));

// --- Optional HTTP API to save FCM token ---
const api = express();
api.use(express.json());

api.use(cors());

api.post('/token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).send('Token missing');
    saveToken(token);
    res.send('Token saved');
});

api.post('/test-notification', async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).send('title and body required');

    const tokens = Array.from(fcmTokens);
    if (tokens.length === 0) return res.status(400).send('No FCM tokens saved');

    try {
        const message = { notification: { title, body }, tokens };
        const response = await admin.messaging().sendEachForMulticast(message);
        res.send({
            success: response.successCount,
            failure: response.failureCount,
            responses: response.responses.map(r => r.success)
        });
        console.log(`[FCM Test] Sent: ${response.successCount}/${tokens.length}`);
    } catch (err) {
        console.error('[FCM Test] Error:', err);
        res.status(500).send('FCM send failed');
    }
});

api.listen(8051, () => console.log('[API] Token API running on port 8051'));
