
const HtmlWebpackPlugin =  require('html-webpack-plugin');
const config = require('./common.js');
const codeResource = config.codeResouce;
const htmlPages = config.htmlPages;

function getHtmlPlugins(htmlPages){//函数的作用就是处理多入口文件时的
    if(htmlPages.length == 0) return [];
    let plugins = [];
    for(var i = 0;i<htmlPages.length;i++){
        if(config.commonChunkConfig.isCommonChunk) {
			//如果抽取了chunk,添加到前面
			htmlPages[i].chunks.unshift(config.commonChunkConfig.chunkName);
			htmlPages[i].chunks.unshift(config.commonChunkConfig.manifestName);
		}
        plugins.push(new HtmlWebpackPlugin({
			template: codeResource +'/'+ htmlPages[i].template,
			filename: htmlPages[i].template,
			chunks: htmlPages[i].chunks,
			minify: {
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeComments: true,
				removeEmptyAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				minifyJS: true,
				minifyCSS: true
			}
		}));
    }
    return plugins;
}
module.exports = {
    plugin: getHtmlPlugins(htmlPages)
}

// 作用：负责html-webpack-plugin的实例化，这里单独出来主要是为多入口文件的html创建。