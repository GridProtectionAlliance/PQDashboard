"use strict";
const webpack = require("webpack");

module.exports = {
    mode: 'development',
    entry: {
        OpenSEE: "./Scripts/TSX/OpenSEE/openSEE.tsx",

    },
    output: {
        filename: "./Scripts/[name].js"
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
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery':'jquery',
            Map: 'core-js/es6/map',
            Set: 'core-js/es6/set',
            requestAnimationFrame: 'raf',
            cancelAnimationFrame: ['raf', 'cancel'],
        }),
        //new webpack.DefinePlugin({
        //    'process.env.NODE_ENV': JSON.stringify('production')
        //}),
        //new webpack.optimize.UglifyJsPlugin()
    ]
};