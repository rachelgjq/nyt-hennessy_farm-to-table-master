define(['jquery','TweenMax','utils'],function($,TweenMax,utils){
	var Scheme = function testModule() {},
	proto = Scheme.prototype;

	proto.init = function($dom,dtd){
		this.$dom = $dom;
		console.log('testModule init...');

		dtd.resolve();
	}

	proto.update = function(tmpW,tmpH){
	};

	return Scheme;
});
