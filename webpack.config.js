const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        test6: './scripts/test6.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};