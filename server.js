var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const starCheckInterval = 500; // interval between checking life of stars in ms
let stars = [];
let nextClientId = 1;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function hslToHex(h, s, l) { // taken from https://stackoverflow.com/a/44134328
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getRandomColor() {
  let hue = Math.floor((Math.random() * 360));
  return hslToHex(hue, 100, 50);
}

function isStarAlive(star) {
  // check if lifespan has elapsed
  let date = new Date(star.date);
  return date.setMilliseconds(date.getMilliseconds() + star.lifespan) > Date.now();
}

// periodically remove dead stars
setInterval(function() {
  for(let star of stars) {
    if (isStarAlive(star) === false) {
      stars.splice(star, 1);
    }
  }
}, starCheckInterval);

io.on('connection', function(socket){
  console.log('user #' + nextClientId + ' connected');
  socket.emit('init', { clientId: nextClientId, color: getRandomColor(), stars: stars });
  nextClientId += 1;

  socket.on('star', function(star){
    io.emit('star', star);
    stars.push(star);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
