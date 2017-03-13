define('preloadAssets',['jquery'],function($){
	var Scheme = function preloadAssets() {},
	proto = Scheme.prototype;

	Scheme.preloadImgs =  function($targetdom){
		var dtd = $.Deferred();
		var imgs;
		if($targetdom.hasClass('preload')){
			imgs = $targetdom;
		}else{
			imgs = $targetdom.find('.preload');
		}
		if(imgs.length !== 0){
			startPreload(imgs);
		}else{
			dtd.resolve();
		}
		function startPreload(arr){
			var newimages = [],
			loadedimages = 0,
			imgLen = 0,
			ratio = 0;
			arr = (typeof arr !== "object") ? [arr] : arr;
			imgLen = arr.length;
			function imageloadpost() {
				loadedimages++;
				ratio = loadedimages / imgLen;
				if (arr[loadedimages - 1] === null) {
					//console.log('nothing here');
				}
				if (loadedimages === imgLen) {
					ratio = 1;
					for (var j = 0, len = imgLen; j < len; j++) {
						$(arr[j]).append(newimages[j]);
					}
				}
				updateLoading(ratio);
			}
			var img;
			for (var i = 0, len = imgLen; i < len; i++) {
				img = new Image();
				newimages.push(img);
				img.addEventListener("load", imageloadpost);
				img.addEventListener("error", imageloadpost);
			    if (arr[i].getAttribute('data-src') !== null) {
			    	var url = arr[i].getAttribute('data-src');
			        img.src = url;
			        img.alt = "";
			    }
			}
		}
		function updateLoading(r){
			if(r >= 1){
				dtd.resolve();
			}
		}
		return dtd.promise();
	};

	return Scheme;
});