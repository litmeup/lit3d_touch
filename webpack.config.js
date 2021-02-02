//const path = require('path');
 const HtmlWebpackPlugin = require('html-webpack-plugin')

 module.exports = {
   mode: 'development',
   entry: {
     index: './src/app.ts'
   },
   resolve: {
   // Add .ts and .tsx as a resolvable extension.
   extensions: [".ts", ".tsx", ".js"]
   },
   module: {
    rules: [
      // all files with a .ts or .tsx extension will be handled by ts-loader
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
   },
   plugins: [
    new HtmlWebpackPlugin({ template: "./refactor.html" })
   ],
   target: "es2020"
      //,
   // output: {
   //   filename: '[name].bundle.js',
   //   path: path.resolve(__dirname, 'dist'),
   //  publicPath: '/',
   // }
 };