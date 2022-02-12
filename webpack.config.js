const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const package = require('./package.json');

module.exports = ({ WEBPACK_SERVE, WEBPACK_WATCH }) => {
	const outputPath = path.resolve(__dirname, 'build');
	const mode = WEBPACK_SERVE ? 'development' : 'production';

	const config = {
		mode,
		entry: {
			content: './src/extension/content/index.js',
			popup: './src/extension/pages/popup.js',
			background: './src/extension/pages/background.js'
		},
		output:{
			filename: `[name].bundle.js`,
			path: outputPath
		},
		module: {
			rules: [
				{
					test:/\.(png|jpg)$/,
					use:[
						'file-loader'
					]
				},
				{
					test:/\.css$/,
					use:[
						'style-loader', 'css-loader'
					]
				},
				{
					test:/\.(scss|sass)$/,
					use:[
						'style-loader', 'css-loader','sass-loader'
					]
				},
				{
					test:/\.js$/,
					exclude:/node_modules/,
					use:{
						loader:'babel-loader',
						options:{
							presets:['@babel/preset-env'],
							plugins:[
								'@babel/plugin-proposal-optional-chaining',
								'@babel/plugin-transform-runtime'
							],
						}
					}
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin({
				root: outputPath
			}),	
			new CopyWebpackPlugin({
				patterns: [
					{
						from: './src/manifest.json',
						transform: content => {							
							/*
								modify manifest
							*/
							const manifest = JSON.parse(content.toString());
							const name = package.name.replace(/[-_]/g, ' ');
							manifest.name = name;
							manifest.browser_action.default_title = name;
							manifest.version = package.version;
							if (WEBPACK_WATCH) {
								manifest.background.scripts.push('hotreload.bundle.js');	
							}
							return Buffer.from(JSON.stringify(manifest));
						}
					},
					{
						from: './src/extension/icons/**/*',
						to: `[name][ext]`
					}
				]
			}),
			new HtmlWebpackPlugin({
				template: './src/extension/pages/popup.html',
				filename: 'popup.html',
				chunks: ['popup']
			})
		]		
	};

	if (WEBPACK_WATCH) {
		config.entry.hotreload = './src/extension/pages/hotreload-extension.js';
		config.plugins[1].patterns.push({
			from: './.gitignore',
			to: `reloader[hash]`
		});
	}
	
	if (WEBPACK_SERVE) {
		config.devServer = {
			historyApiFallback: true,
			open: false,
			hot: true,
			compress: true,
			port: 8080
		};
	}

	return config;
}