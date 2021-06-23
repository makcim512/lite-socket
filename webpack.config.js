const path = require('path');

var config = {
    mode: 'none',
    entry: {
        main: path.resolve(__dirname, './src/index.js'),
    },
    output: { 
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js',
        library: 'LiteSocket',
        libraryTarget: 'var'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    }
};

module.exports = (env, arg) => {
    
    // Production mode
    if (arg.mode === 'production') {
        config.mode = 'production';
    }

    // Development mode
    if (arg.mode === 'development') {
        config.mode = 'development';
        config.devtool = 'source-map';
    }

    return config;
}