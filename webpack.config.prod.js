const path = require('path')
    , HtmlWebpackPlugin = require('html-webpack-plugin')
    , CopyPlugin = require("copy-webpack-plugin");

const webpack = require('webpack')
    , { homepage } = require('./package.json');

module.exports = {
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new CopyPlugin({
            patterns: [
                { from: "./public/data", to: "./data" },
                { from: "./public/assets", to: "./assets" },
                { from: "./public/thumbnails", to: "./thumbnails" }
            ],
        }),
        new webpack.DefinePlugin({
            'process.env.BASE_PATH': JSON.stringify(homepage)
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
                        presets: [['@babel/preset-react', {"runtime": "automatic"}]]
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
    mode: 'production'
};