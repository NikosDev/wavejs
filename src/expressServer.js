const express = require('express');
const http = require('node:http');
const fs = require('node:fs');
const { buildHLSDirPath, buildHLSSegmentPath } = require('./fileControllerstub');


const { expressHttpLogger } = require('./logger');


const contentTypes = {
  '.flv': 'video/x-flv',
  '.mp4': 'video/mp4',
  '.m3u8': 'application/x-mpegURL',
  '.mpd': 'application/dash+xml',
};
const PORT = 3000;

const expressServer = (session) => {
  
  const app = express();

  /* initial config */
  app.disable('x-powered-by');

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(expressHttpLogger);

  app.get('/test', (req, res) => {
    res.status(200).json('recieved!');
  });

  app.get('/streams', (req, res) => {
    res.status(200).json(Object.fromEntries(session.streams));
  });

  //get playlist route
  app.get('/video/:streamId/:m3u8', (req, res) => {
    //this is the area where we need to connect fmpg to the server
    const videoPath = `${buildHLSDirPath(req.params.streamId)}/${req.params.m3u8}`
   //'application/vnd.apple.mpegurl'
    res.status(200).set('Content-Type', contentTypes['.m3u8'])
    fs.createReadStream(videoPath).pipe(res);
  
  });

  app.use((req, res, next) => {
    res.status(404).send("😵 Can't find what you're looking for!");
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('☠️ Something Broke!');
  });

  let server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`🚀 Express blasting off on port ${PORT}`);
  });
};

module.exports = expressServer;
