const path = require('path')
    , HtmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].bundle.js',
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new webpack.DefinePlugin({
            'process.env.BASE_PATH': JSON.stringify('.')
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-react', { "runtime": "automatic" }]]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
            {
                test: /\.mdx$/,
                use: [
                    {
                        loader: '@mdx-js/loader',
                        /** @type {import('@mdx-js/loader').Options} */
                        options: {}
                    }
                ]
            },
            {
                test: /\.ya?ml$/,
                use: 'yaml-loader'
            }
        ]
    },
    devServer: {
        static: path.join(__dirname, 'public'),
        open: true,
        port: 9000
    },
    mode: 'development'
};