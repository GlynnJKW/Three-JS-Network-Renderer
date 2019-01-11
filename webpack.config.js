const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        pickingtest: './scripts/tests/pickingtest.js',
        stresstest: './scripts/tests/stresstest.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};