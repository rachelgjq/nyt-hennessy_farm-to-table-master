define('scrollmagicmanager',['jquery','TweenMax','ScrollMagic','ScrollMagicAddIndicators','ScrollMagicJquery','utils','ScrollMagicGSAP'],
	function($,TweenMax,ScrollMagic,ScrollMagicAddIndicators,ScrollMagicJquery,utils){

	var Scheme = function scrollmagicmanager() {},
	proto = Scheme.prototype;

	var controller = new ScrollMagic.Controller({});

	var needUpdateSecneArr = [];
	var pinScene = [];

	Scheme.addScrollMagic = function(data,eventHandle){
		var tmpSceneEnter = new ScrollMagic.Scene({
			triggerElement: data.triggerDom,
			triggerHook:data.triggerPlay,
			offset:data.triggerOffset,
		})
		.addTo(controller);

		var tmpSceneReset = new ScrollMagic.Scene({
			triggerElement: data.triggerDom,
			triggerHook:data.triggerReset,
			offset:data.triggerOffset,
		})
		.addTo(controller);

		if(data.debug){
			tmpSceneEnter.addIndicators({'name':'Enter'});
			tmpSceneReset.addIndicators({'name':'Reset'});
		}

		tmpSceneEnter.on('progress',function(e){
			if(e.progress === 1){
				if(data.debug){
					console.log('-----enter-----'+data.triggerDom);
					console.log(e);
				}

				eventHandle.playAni(data);
			}
		});
		tmpSceneReset.on('progress',function(e){
			if(e.progress === 0){
				if(data.debug){
					console.log('-----reset-----'+data.triggerDom);
					console.log(e);
				}
				eventHandle.resetAni(data);
			}
		});
	};

	Scheme.addParallaxScrollMagic = function(data,varsObj,targetDom){
		var tmpScene = new ScrollMagic.Scene({
			triggerElement: data.triggerElement, 
			duration: data.durationDom.outerHeight()
		})
		// .setTween(tween)
		.addTo(controller);

		if(data.debug){
			tmpScene.addIndicators({'name':'parallax'});
		}

		varsObj.overwrite = true;
		varsObj.force3D = true;
		tmpScene.on('progress',function(e){
			this.extendVarsObj = varsObj;
			this.extendTarget = targetDom;
			this.extendProgress = e.progress;

			throttle(playParallax.bind(this),200,200)();
			
		});

		var tmpSceneObj = {
        	'scenes':[tmpScene],
        	'data':data,
        	'durationDom':data.durationDom
        };
        needUpdateSecneArr.push(tmpSceneObj);
	};

	function playParallax(){
		var tmpVars = {};

		for(var key in this.extendVarsObj){
			tmpVars[key] = this.extendVarsObj[key] * this.extendProgress;
		}

		TweenMax.to(this.extendTarget,0.4,tmpVars);
	}

	function throttle(func, wait, mustRun) {
		var timeout,
			startTime = new Date();
	 
		return function() {
			var context = this,
				args = arguments,
				curTime = new Date();
	 
			clearTimeout(timeout);
			if(curTime - startTime >= mustRun){
				func.apply(context,args);
				startTime = curTime;
			}else{
				timeout = setTimeout(func, wait);
			}
		};
	}

	Scheme.addFixScrollMagic = function(data){
		data.fixDom = $(data.fixDom);
		data.contentDom = $(data.contentDom);
		var tmpScene = new ScrollMagic.Scene({
            triggerElement: data.triggerDom,
            triggerHook:data.triggerPlay,
            duration:utils.getVerticalPinDuration(data.fixDom,data.contentDom),
            offset:data.triggerOffset
        })
        .setPin(data.fixDom)
        .addTo(controller);

        if(data.debug){
        	tmpScene.addIndicators();
        }

        var tmpSceneObj = {
        	'scene':tmpScene,
        	'data':data
        };
        pinScene.push(tmpSceneObj);

        //return tmpScene;
	};

	Scheme.addClassToggleScrollMagic = function(data){
		data.toggleDom = $(data.toggleDom);
		var tmpScene = new ScrollMagic.Scene({
            triggerElement: data.triggerDom,
            triggerHook:data.triggerPlay,
            offset:data.triggerOffset
        })
		.setClassToggle(data.toggleDom,data.classDom)
        .addTo(controller);

		if(data.debug){
        	tmpScene.addIndicators();
        }
	};

	Scheme.addEdgeDetectScrollMagic = function(data,$dom,eventHandle){
		var tmpSceneDown = new ScrollMagic.Scene({
            triggerElement: data.triggerDom,
            triggerHook:1,
            duration:$dom.outerHeight(),
            offset:0
        })
        .addTo(controller);

        var tmpSceneUp = new ScrollMagic.Scene({
            triggerElement: data.triggerDom,
            triggerHook:0,
            duration:$dom.outerHeight(),
            offset:'-118px'
        })
        .addTo(controller);

        if(data.debug){
			tmpSceneDown.addIndicators();
			tmpSceneUp.addIndicators();
		}

	    tmpSceneDown.on('progress',function(e){
	    	// console.log(data.triggerDom+'-----down secne progress: '+e.progress);
	        if(e.progress>0){
	        	//in to view
	        	if(!data.inViewport){
	        		data.inViewport = true;
	        		eventHandle.intoViewport();
	        	}
	        }
	        if(e.progress<=0){
	        	//out of view
	        	if(data.inViewport){
	        		data.inViewport = false;
	        		eventHandle.outofViewport();
	        	}
	        }
	    });
	    tmpSceneUp.on('progress',function(e){
	    	// console.log(data.triggerDom+'-----up secne progress: '+e.progress);
	    	if(e.progress<0.98){
	    		//in to view
	    		if(!data.inViewport){
	    			data.inViewport = true;
	    			eventHandle.intoViewport();
	    		}
	    	}
	    	if(e.progress>=0.98){
	    		//out of view
	    		if(data.inViewport){
	    			data.inViewport = false;
	    			eventHandle.outofViewport();
	    		}
	    	}
	    });

        var tmpEdgeDetectObj = {
        	'scenes':[tmpSceneUp,tmpSceneDown],
        	'data':data,
        	'durationDom':$dom
        };
        needUpdateSecneArr.push(tmpEdgeDetectObj);

        return [tmpSceneUp,tmpSceneDown];
	};

	Scheme.removeScene = function(sceneArr){
		controller.removeScene(sceneArr);
		controller.update(true);
	};
	Scheme.addScene = function(sceneArr){
		controller.addScene(sceneArr);
		controller.update(true);
		controller.updateScene(sceneArr,true);
	};

	Scheme.disableAllScene = function(){
		controller.enabled(false);
		controller.update(true);
	};
	Scheme.enableAllScene = function(){
		controller.enabled(true);
		controller.update(true);
	};

	// Scroll Tracking
	var getCombinedFurnitureHeight =  function(offset) {
		offset = offset || 0;
		return $("#masthead").height() + $("#paid-top-bar-container").height() + offset;
	};
	Scheme.trackScroll = function(metrics) {
		var scrollOffset = getCombinedFurnitureHeight();
		$.each(metrics, function(k, v) {
			(function(key, obj) {
				new ScrollMagic.Scene({
					triggerElement: obj.trigger,
					// offset: 0
					offset: -scrollOffset
				})
				.on("enter", function(e) {
					G.track("Scrolled", key + " " + obj.section);
					e.target.destroy();
				})
				// .addIndicators({"name": obj.section})
				.addTo(controller);
			})(k, v);
		});
	};


	Scheme.update = function(tmpW,tmpH){
		for(var i = 0,l = needUpdateSecneArr.length;i<l;i++){
			for(var m = 0,n = needUpdateSecneArr[i].scenes.length;m<n;m++){
				needUpdateSecneArr[i].scenes[m].duration(needUpdateSecneArr[i].durationDom.outerHeight());
			}
		}

		for(var j = 0,k = pinScene.length;j<k;j++){
			pinScene[j].scene.duration(utils.getVerticalPinDuration(pinScene[j].data.fixDom,pinScene[j].data.contentDom));
		}


	};
	return Scheme;
});