var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var TapWebpackPlugin = require('tap-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'browser'),
  build: path.join(__dirname, 'browser') //path.join(__dirname, 'build')
};

console.log(PATHS.app);

module.exports = [
{
  devtool: 'source-map',
  context: PATHS.app,
  entry: {
    //html: './index.html',
    js: './src/index.js' //,
    // vendor: [ // List vendor libraries that will show up in vendor.bundle.js
    //   "number-to-locale-string",
    //   "redux",
    //   "redux-thunk"
    // ]
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader'
        ]
      }
    ],
  }
},
{
  //target: 'node',

  entry: glob.sync('./browser/test/**/*.js'),

  output: {
    path: 'browser',
    filename: 'tests.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader'
        ]
      }
    ]
  },
  externals: {
    fs: '{}',
    tls: '{}',
    net: '{}',
    console: '{}'
  }
  ,
  plugins: [
    new TapWebpackPlugin()
  ]
}
]
