Stars in the Sky - README

Visualisation of randomly generated stars from each connected client. Each star is saved in a MongoDB. On client connection living stars are sent to the client, and dead stars are removed from the DB.

Using NodeJS, Express, Socket.io & MongoDB.

Dependencies:
- Node & npm https://nodejs.org/

Setup:
1. Download files into a single directory.
2. Run 'npm install'. For info, see https://docs.npmjs.com/cli/install/
3. Run 'node server.js'. For info, see https://nodejs.org/en/docs/guides/getting-started-guide/
4. Use the web browser on any number of devices to watch them exchange stars in real-time.

Notes:
- server.js specifies port 3000.
- alternatively, check the deployed version: https://stars-in-the-sky-mbyhmnciug.now.sh
