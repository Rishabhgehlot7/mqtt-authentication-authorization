// broker.js
require('dotenv').config();
const aedes = require('aedes')();
const net = require('net');
const bcrypt = require('bcryptjs');

const TCP_PORT = process.env.BROKER_PORT || 1883;

// topic matching 
function topicMatch(topic, rule) {
    if (rule === '#') return true;
    const regex = new RegExp('^' +
        rule
            .replace(/\+/g, '[^/]+')
            .replace(/#/g, '.*') +
        '$'
    );
    return regex.test(topic);
}


const users = {};


// Add a user with hashed password and rules
function addUser(username, plainPassword, pubRules, subRules) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plainPassword, salt);
    users[username] = {
        passwordHash: hash,
        pubRules,
        subRules
    };
}

// Load users from environment variables
const usernames = (process.env.USERS || "").split(",").map(u => u.trim()).filter(Boolean);
const passwords = (process.env.PASSWORDS || "").split(",").map(p => p.trim());


// Example env:
// USERS=rishabh,rahul
// PASSWORDS=rishabh,rahul-pass
for (let i = 0; i < usernames.length; i++) {
    const u = usernames[i];
    const p = passwords[i] || "";

    const pubRules = (process.env[`${u.toUpperCase()}_PUB`] || "#")
        .split(",").map(r => r.trim()).filter(Boolean);
    const subRules = (process.env[`${u.toUpperCase()}_SUB`] || "#")
        .split(",").map(r => r.trim()).filter(Boolean);

    addUser(u, p, pubRules, subRules);
}

// Authentication
aedes.authenticate = (client, username, password, cb) => {
    if (!username || !password) {
        const err = new Error('Auth failed: missing credentials');
        err.returnCode = 4;
        return cb(err, false);
    }

    const user = users[username];
    if (!user) {
        const err = new Error('Auth failed: unknown user');
        err.returnCode = 4;
        return cb(err, false);
    }

    const ok = bcrypt.compareSync(password.toString(), user.passwordHash);
    if (!ok) {
        const err = new Error('Auth failed: bad password');
        err.returnCode = 4;
        return cb(err, false);
    }

    client.user = username;
    console.log(`[auth] ${client.id} authenticated as ${username}`);
    cb(null, true);
};

// Authorization
aedes.authorizePublish = (client, packet, cb) => {
    const user = users[client.user];
    if (!user) return cb(new Error('Publish denied: no user'));

    const allowed = user.pubRules.some(r => topicMatch(packet.topic, r));
    if (!allowed) {
        console.log(`[authz] DENY publish by ${client.user} -> ${packet.topic}`);
        return cb(new Error('Publish denied'));
    }

    cb(null);
};


// Authorization for subscribe
aedes.authorizeSubscribe = (client, sub, cb) => {
    const user = users[client.user];
    if (!user) return cb(new Error('Subscribe denied: no user'), null);

    const allowed = user.subRules.some(r => topicMatch(sub.topic, r));
    if (!allowed) {
        console.log(`[authz] DENY subscribe by ${client.user} -> ${sub.topic}`);
        return cb(new Error('Subscribe denied'), null);
    }

    cb(null, sub);
};

// Envent logging
aedes.on('client', c => console.log(`[event] Client connected: ${c.id}`));
aedes.on('clientDisconnect', c => console.log(`[event] Client disconnected: ${c.id}`));
aedes.on('publish', (pkt, c) => {
    if (c) console.log(`[event] ${c.user} -> ${pkt.topic}: ${pkt.payload.toString()}`);
});
aedes.on('subscribe', (subs, c) => {
    if (c) console.log(`[event] ${c.user} subscribed: ${subs.map(s => s.topic).join(', ')}`);
});


// Start server
const server = net.createServer(aedes.handle);
server.listen(TCP_PORT, () => {
    console.log(`[broker] running on port ${TCP_PORT}`);
});
