/// <binding ProjectOpened='Watch - Development' />
"use strict";
const webpack = require("webpack");
const path = require("path");
const _ = require("lodash");
module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'Scripts'),
    cache: true,
    entry: {
        OpenSEE: "./TSX/OpenSEE/openSEE.tsx",
        PQDashboard: "./TSX/PQDashboard/PQDashboard.tsx",

    },
    output: {
        path: path.resolve(__dirname, 'Scripts'),
        filename: "[name].js"
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css"]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader"
            },
            { test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=100000" }
        ]
    },
    externals: {
        //lodash: _,
        jquery: 'jQuery',
        react: 'React',
        'react-dom': 'ReactDOM',
        moment: 'moment'

    },
    plugins: [
        new webpack.ProvidePlugin({
            //$: 'jquery',
            //jQuery: 'jquery',
            //'window.jQuery':'jquery',
            Map: 'core-js/es/map',
            Set: 'core-js/es/set',
            requestAnimationFrame: 'raf',
            cancelAnimationFrame: ['raf', 'cancel'],
        }),
    ]
};