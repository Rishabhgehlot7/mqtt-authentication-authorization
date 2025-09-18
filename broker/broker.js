require('dotenv').config();
const aedes = require('aedes')();
const net = require('net');
const bcrypt = require('bcryptjs');
const http = require('http');
const ws = require('websocket-stream');

const tcpPort = process.env.BROKER_PORT || 1883;
const wsPort = process.env.WS_PORT || 8888;

function topicMatch(topic, rule) {
    if (rule === '#') return true;
    const regex = new RegExp(
        '^' +
            rule
                .replace(/\+/g, '[^/]+')
                .replace(/#/g, '.*') +
            '$'
    );
    return regex.test(topic);
}

const users = {};

function addUser(username, plainPassword, pubRules, subRules) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plainPassword, salt);
    users[username] = {
        passwordHash: hash,
        pubRules,
        subRules,
    };
}

const usernames = (process.env.USERS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

const passwords = (process.env.PASSWORDS || "")
    .split(",")
    .map((p) => p.trim());

for (let i = 0; i < usernames.length; i++) {
    const u = usernames[i];
    const p = passwords[i] || "";

    const pubRules = (process.env[`${u.toUpperCase()}_PUB`] || "#")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

    const subRules = (process.env[`${u.toUpperCase()}_SUB`] || "#")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

    addUser(u, p, pubRules, subRules);
}

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

aedes.on("client", (c) => console.log(`[event] Client connected: ${c.id}`));
aedes.on("clientDisconnect", (c) =>
    console.log(`[event] Client disconnected: ${c.id}`)
);
aedes.on("publish", (pkt, c) => {
    if (c) console.log(`[event] ${c.user} -> ${pkt.topic}: ${pkt.payload.toString()}`);
});
aedes.on("subscribe", (subs, c) => {
    if (c) console.log(`[event] ${c.user} subscribed: ${subs.map((s) => s.topic).join(", ")}`);
});

const server = net.createServer(aedes.handle);
server.listen(tcpPort, () => {
    console.log(`[broker] TCP running on port ${tcpPort}`);
});

const httpServer = http.createServer();
ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(wsPort, () => {
    console.log(`[broker] WebSocket running on ws://localhost:${wsPort}`);
});