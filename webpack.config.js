const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        network: './src/build/network.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};