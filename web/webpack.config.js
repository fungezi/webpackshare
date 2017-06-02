const path = require('path');
const HtmlWebpackPlugin =  require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const htmlPagePluginConfig = require('./config/htmlPagePluginConfig.js').plugin;
const webpack = require('webpack');
const publicPath = require('./config/common.js').publicPath;
const config = require('./config/common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var plugins = htmlPagePluginConfig.concat(
    new ExtractTextWebpackPlugin(config.isRelease?'[name]-[contenthash].css':'[name].css'),
    
    // 复制静态资源
	new CopyWebpackPlugin([{ 
		from: config.codeResouce +'/static',
		//默认已经是 buildPath 输出目录了
		to:'static'
	}]));
if(config.isRelease){
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        // 压缩JS
		compress: {
			warnings: false
		},
        //排除关键字
		except: ['exports', 'require']
	}));
}else{
    plugins.push(new webpack.HotModuleReplacementPlugin());
}
let entry = {
    'js/entry1': path.resolve('./src','js/index.js'),
    'js/entry2': path.resolve('./src','js/index1.js'),
    'js/entry3': path.resolve('./src','js/test2.js'),
};

if(config.commonChunkConfig.isCommonChunk){
    plugins.push(
		// 抽取公用模块
		new webpack.optimize.CommonsChunkPlugin({
			name: config.commonChunkConfig.chunkName,
			// 至少出现三次以上才抽取
			minChunks: config.commonChunkConfig.minChunks
		}),
		new webpack.optimize.CommonsChunkPlugin({
            //因为在webpack打包是会有一段runtime的代码在内存中，所以当每次发生改变的时候就会被打包到第三方文件中。
            // 所以hash就会被改变，所以就会被反复的打包。
            // 这段代码就是将这段runtime的代码给提取出来。
			// https://www.zhihu.com/question/31352596/answer/127369675?from=profile_answer_card
			name: config.commonChunkConfig.manifestName,
			chunks: [config.commonChunkConfig.chunkName]
		})
    );
}

module.exports = {
    entry: entry,
    output:{
        // 用来解决css中的路径引用问题
		publicPath: config.publicPath,
		path: path.resolve(__dirname, 'dist'),
		// 注意要使用chunkhash
		filename: config.isRelease?'[name]-[chunkhash].js':'[name].js'
    },
    resolve:{//这下面的字段还可以设置文件的快捷访问路径、扩展名补充、路径别名
        alias:{//在这里你可以写上需要替换的路径别名。

        }
    },
    module: {
		loaders: [{
				// 分为压缩的和非压缩的，不会重复，否则可能会报错
				// 包含css 但却不包含.min.css的
				test: /^((?!\.min\.css).)*\.css/,
				loader: ExtractTextWebpackPlugin.extract({
					fallback: "style-loader",
					// 压缩css
					use: "css-loader?minimize&-autoprefixer"
				})
			}, {
				// 包含css 包含.min.css的
				test: /\.min\.css$/,
				loader: ExtractTextWebpackPlugin.extract({
					fallback: "style-loader",
					// 不压缩css
					use: "css-loader"
				})
			}, {
				test: /\.(png|jpg|gif)$/,
				//小于1k的会默认用b64实现
				loader: 'url-loader?limit=1024&name=img/[name][hash].[ext]'
			}, {
				test: /\.woff$/,
				loader: 'file-loader?prefix=font/&limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]'
			}, {
				test: /\.(ttf|svg|eot)$/,
				loader: 'file-loader?prefix=font/&name=fonts/[name].[ext]'
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
                query: { presets: ['es2015'] }
			}, {
				// html-loader,专门替换html里的资源-比如替换图片资源，可以和HtmlWebpackPlugin以前使用的
				test: /\.html$/,
				use: [{
					loader: 'html-loader',
					options: {
						minimize: false,
						attrs: ['img:src', 'link:href']
					}
				}],
			}
		],
	},
    plugins: plugins,
    devServer: {
		historyApiFallback: true,
		hot: false,
        // port:3000,
        // host:'0.0.0.0',
		//不使用inline模式,inline模式一般用于单页面应用开发，会自动将socket注入到页面代码中
		inline: false,
		//content-base就是 codeResource -需要监听源码
		contentBase: path.resolve(__dirname, './dist'),
		watchContentBase: true,
		// 默认的服务器访问路径，这里和配置中一致，需要提取成纯粹的host:ip
		// public: 'http://localhost:8080',
        publicPath: 'http://localhost:8080/dist'
	},
}




// 1.首先配置基本的entry|output|module|plugins|devServer
// 2.entry可以配置单入口文件也可以是多入口文件，多入口文件的时候属性值就是一个对象其中的key就是文件的名字name，value就是对应的文件名filename。
// 3.module主要是loaders。（后面详解）
// 4.plugins就是html-webpack-plugin以及extract-text-webpack-plugin，第一个可以用来生成html（其中可以配置js和css的引入以及压缩选项），
//   第二个的作用就是将在js中引入的css进行打包成css文件。
// 5.devServer用于对页面的实时刷新，只需要简单的配置一下port|host|inline|contentBase|watchContentBase等参数就可以了。
//   需要注意的就是devServer监听编译的代码是保存在内存里的本地的代码并没有改变，还需要 webpack --watch。
