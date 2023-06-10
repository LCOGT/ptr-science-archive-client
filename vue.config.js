const path = require('path');

module.exports = {
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'Datalab Archive | Las Cumbres Observatory | Photon Ranch';
      return args;
    });
  },
  configureWebpack: () => {
    return {
      resolve: {
        alias: {
          // This is needed for jquery-file-download/src/Scripts/jquery.fileDownload.js to work
          jquery: path.join(__dirname, 'node_modules/jquery/src/jquery')
        }
      }
    };
  }
};
