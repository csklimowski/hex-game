require('path');

module.exports = {
    mode: 'development',
    entry: './src/game.ts',
    output: {
        filename: "game.js",
    },
    module: {
        rules: [
            {
                test: /\.ts|\.js$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        contentBase: __dirname,
        watchContentBase: true,
        publicPath: '/dist/',
        port: 8000
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}