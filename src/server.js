import keys from 'keys.json'


var io = require('socket.io-client')
const stream_url = 'https://stream.automatic.com?token='+keys['client_id']+':'+keys['client_secret']
var socket = io(stream_url)

// Listen for `trip:finished` event
socket.on('trip:finished', function(eventJSON) {
  console.log('Trip Finished', eventJSON);
});

// Handle `error` messages
socket.on('error', function(errorMessage) {
    console.log('Error', errorMessage);
  });
  