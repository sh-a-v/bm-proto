'use strict';

var
  express = require('express'),
  router = express.Router(),
  apiRouter = express.Router(),
  path = require('path');

var config = {
  client: {
    staticFilesPath: path.join(__dirname, ''),
    baseTemplatePath: path.join(__dirname, 'build/templates/server-side.html')
  },

  server: {
    port: 1339
  }
};

var app = express();

router
  .get('*', function (req, res) {
    res.sendfile(config.client.baseTemplatePath);
  });

app.use(express.static(config.client.staticFilesPath));
app.use('*', router);

app.listen(config.server.port, function () {
  console.log('Express server listening on port ' + config.server.port);
});
