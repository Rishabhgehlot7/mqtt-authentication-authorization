// Run Command:
//   node publisher.js rishabh rishabh "sensors/rishabh/status" '{"Hello":"World"}'


const mqtt = require('mqtt');

const args = process.argv.slice(2);
const username = args[0] || null;
const password = args[1] || null;
const topic = args[2] || 'sensors/demo';
const message = args[3] || JSON.stringify({ ts: Date.now(), msg: 'hello from publisher' });

const options = {};
if (username) options.username = username;
if (password) options.password = password;

const client = mqtt.connect('mqtt://localhost:1883', options);

client.on('connect', function () {
  console.log(`Publisher connected as ${username || 'anonymous'}. Publishing to ${topic}`);
  client.publish(topic, message, { qos: 0, retain: false }, (err) => {
    if (err) {
      console.error('Publish error:', err.message);
    } else {
      console.log('Published:', message);
    }
    client.end();
  });
});

client.on('error', (err) => {
  console.error('Publisher error', err.message);
});
