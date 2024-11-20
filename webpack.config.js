import path from 'path';

export default {
  mode: 'production', // Production mode for optimized builds
  entry: path.resolve('index.js'), // Full path to your entry point
  output: {
    path: path.resolve('dist'), // Output directory for bundled files
    filename: 'validation-engine.min.js', // Name of the bundled file
    library: 'ValidationEngine', // Global variable for browser environments
    libraryTarget: 'umd', // Universal Module Definition (works in Node.js, AMD, and browsers)
    globalObject: 'this' // Ensures compatibility with various environments
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile all .js files
        exclude: /node_modules/, // Ignore dependencies in node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'] // Transpile ES6+ to ES5
          }
        }
      }
    ]
  }
};
