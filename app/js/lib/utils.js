define([],function(){
	var Scheme = function loacalUtil() {},
	proto = Scheme.prototype;

	var utils = new Scheme();

	proto.mergeObject = function(obj1,obj2){
		var targetObj = {};
		for(var key in obj2){
			if(obj2[key] !== null && typeof obj2[key] === 'object'){
				//nest object
				if(obj1[key]){
					targetObj[key] = this.mergeObject(obj1[key],obj2[key]);
				}else{
					targetObj[key] = obj2[key];
				}
			}else{
				targetObj[key] = obj2[key];
			}
		}

		return targetObj;
	}

	proto.getNumber = function(num,pos){
		num = Math.floor(Math.abs(num));

		if(num >= pos * 10){
			var str_num = num.toString();
			return str_num[str_num.length-pos-1].valueOf();
		}else{
			return null;
		}
	}

	proto.removeFromArray = function(arr) {
	    var what, a = arguments, L = a.length, ax;
	    while (L > 1 && arr.length) {
	        what = a[--L];
	        while ((ax= arr.indexOf(what)) !== -1) {
	            arr.splice(ax, 1);
	        }
	    }
	    return arr;
	}

	/**
	 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
	 * 
	 * @param {String} text The text to be rendered.
	 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
	 * 
	 * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
	 */
	proto.getTextWidth = function(text, font) {
	    // re-use canvas object for better performance
	    var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
	    var context = canvas.getContext("2d");
	    context.font = font;
	    var metrics = context.measureText(text);
	    return metrics;
	};

	proto.getPointOfALineWithX = function (startP,endP,targetX){
		return ((targetX - endP.x) * (startP.y-endP.y))/(startP.x-endP.x) + endP.y;
	}

	proto.getPointOfALineWithY = function (startP,endP,targetY){
		return ((targetY - endP.y) * (startP.x-endP.x))/(startP.y-endP.y) + endP.x;
	}

	proto.getPageScrollTop = function(){
		return typeof window.pageYOffset !== 'undefined' ? window.pageYOffset: document.documentElement.scrollTop? document.documentElement.scrollTop: document.body.scrollTop? document.body.scrollTop:0;
	}

	

	return utils;
});