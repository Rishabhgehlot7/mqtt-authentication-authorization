// Run Command:
//   node subscriber.js rishabh rishabh "sensors/+/status"

const mqtt = require('mqtt');

const args = process.argv.slice(2);
const username = args[0] || null;
const password = args[1] || null;
const topic = args[2] || 'sensors/#';

const options = {};
if (username) options.username = username;
if (password) options.password = password;

const client = mqtt.connect('mqtt://localhost:1883', options);

client.on('connect', function () {
  console.log(`Subscriber connected as ${username || 'anonymous'}. Subscribing to: ${topic}`);
  client.subscribe(topic, { qos: 0 }, (err, granted) => {
    if (err) {
      console.error('Subscribe error:', err.message);
      client.end();
      return;
    }
    console.log('Granted:', granted);
  });
});

client.on('message', function (t, payload) {
  console.log(`Message on ${t}:`, payload.toString());
});

client.on('error', (err) => {
  console.error('Subscriber error', err.message);
});
