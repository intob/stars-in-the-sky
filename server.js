let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://iamastar:15QckoMU8KsC@ds219983.mlab.com:19983/stars-in-the-sky";

MongoClient.connect(url, { useNewUrlParser: true }, function(err, dbClient) {
  if(err) throw err;

  let db = dbClient.db('stars-in-the-sky')
  let starCollection = db.collection('stars');
  let clientCollection = db.collection('clients');

  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', function(socket) {
    console.log('user connected');
    // get all stars
    findAll(starCollection, function(starsFound) {
      let starsToSend = [];
      // check life of each
      for(let star of starsFound) {
        if(isStarAlive(star) === true) {
          starsToSend.push(star);
        } else {
          starCollection.deleteOne(star);
        }
      }
      createClient(clientCollection, function(client) {
        socket.emit('init', { clientId: client._id, color: client.color, stars: starsToSend });
      });

    });


    socket.on('star', function(star) {
      // insert new star
      starCollection.insertOne(star, function(err, res) {
        if(err) throw err;
        star._id = res.insertedId;
        // push star to clients
        io.emit('star', star);
      });
    });

    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
  });

  http.listen(3000, function() {
    console.log('listening on *:3000');
  });

});

function createClient(collection, callback) {
  let newClient = { color: getRandomColor() };
  collection.insertOne(newClient, function(err, res) {
    if(err) throw err;
    newClient._id = res.insertedId;
    callback(newClient);
  });
}

function findAll(collection, callback) {
  collection.find({}).toArray(function(err, docs) {
    if(err) throw err;
    callback(docs);
  });
}

function isStarAlive(star) {
  // check if lifespan has elapsed
  let date = new Date(star.date);
  return date.setMilliseconds(date.getMilliseconds() + star.lifespan) > Date.now();
}

function hslToHex(h, s, l) { // taken from https://stackoverflow.com/a/44134328
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if(s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1 / 6) return p + (q - p) * 6 * t;
      if(t < 1 / 2) return q;
      if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
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
