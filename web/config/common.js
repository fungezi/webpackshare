module.exports = {
    codeResouce: './src',
    publicPath:'http://localhost:8080/dist/',//hbuild服务器，无法自动刷新
    buildPath: 'dist',
    isRelease: true,
    commonChunkConfig:{
        isCommonChunk: true,
		//同时引入超过几次(>=)后就会提取成公告文件
		minChunks: 2,
		// 如果抽取，则抽取的公用文件为
		chunkName: 'common/vendor',
		manifestName: 'common/vendor.bundle'
    },
    htmlPages:[{
        template: 'pages/index.html',
        chunks:['js/entry1']
    },{
        template: 'pages/index1.html',
        chunks: ['js/entry2']
    },{
        template: 'pages/index3.html',
        chunks: ['js/entry3']
    }]
}

// 抽取一些配置变量单独放置便于修改。