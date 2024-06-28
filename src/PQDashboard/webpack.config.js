"use strict";
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { WhiskerLine } = require("@gpa-gemstone/react-graph");

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'Scripts'),
    cache: true,
    entry: {
        //PQDashboard: "./TSX/PQDashboard/PQDashboard.tsx",
        MeterEventsByLine: "./TSX/MeterEventsByLine.tsx",
        MagDurChart: "./TSX/MagDurChart.tsx",
        NavBar: "./TSX/NavBar.tsx",
        BarChart: "./TSX/BarChart.tsx",
        WhiskerLine: "./TSX/WhiskerLineChart.tsx"
    },
    output: {
        path: path.resolve(__dirname, 'Scripts'),
        publicPath: 'Scripts/',
        filename: "[name].js",
        library: {
            type: 'module'
        }
    },
    experiments: {
        outputModule: true,
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "inline-source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css"]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.tsx?$/,
                include: [path.resolve(__dirname, "Scripts")],
                loader: "ts-loader", options: { transpileOnly: true }
            },
            {
                test: /\.css$/,
                include: path.resolve(__dirname, 'wwwroot', "Content"),
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
            },
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader"
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 100000
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new NodePolyfillPlugin(),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
        })
    ],
    externals: {},
    optimization: {
        minimizer: [
            new TerserPlugin({ extractComments: false })
        ],
    },
};