var webpack = require('webpack');
var path = require('path');

const PATHS = {
  app: path.join(__dirname, 'browser'),
  build: path.join(__dirname, 'browser') //path.join(__dirname, 'build')
};

console.log(PATHS.app);

module.exports = {
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
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader'
        ]
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
        include: PATHS.app
      }
    ],
  } //,
  // plugins: [
  //   new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  // ]
}
