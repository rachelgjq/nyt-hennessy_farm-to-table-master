define(['jquery'],function($){
	var Scheme = function cjsLoader() {},
	proto = Scheme.prototype;

	var aniScheme = function aniObj() {},
		aniProto = aniScheme.prototype;

	var singleCjsLoader = new Scheme();

	proto.loadCjsAni = function(aniName,aniContainer,completeCallback){
		require([aniName],function(){
			var aniCanvasArr = [];
			for(var i = 0,l = aniContainer.length;i<l;i++){
				var $tmpCanvas = $('<canvas>').addClass('cjsani-'+aniName).appendTo($(aniContainer[i]));
				aniCanvasArr.push($tmpCanvas);
			}
			var tmpExportRootArr = [],tmpStageArr = [];
			
			createjs.MotionGuidePlugin.install();

			window['images_'+aniName] = window['images_'+aniName]||{};
			window['ss_'+aniName] = window['ss_'+aniName]||{};

			var tmpLoader = new createjs.LoadQueue(false);

			
			if(window["lib_"+aniName].properties.manifest.length <= 0){
				//tmpLoader.loadFile({src: PaidPost.assets + "images/animation/"+aniName+"_atlas_.json", type:"spritesheet", id:aniName+"_atlas_"}, true);
				handleComplete()
			}else{
				tmpLoader.addEventListener("fileload", handleFileLoad);
				tmpLoader.addEventListener("complete", handleComplete);
				tmpLoader.loadManifest(window["lib_"+aniName].properties.manifest);
			}
			
			function handleFileLoad(evt) {
				if (evt.item.type === "image") { window['images_'+aniName][evt.item.id] = evt.result; }
			}

			function handleComplete(evt) {
				//tmpExportRoot = new window["lib_"+aniName][aniName]();

				for(i = 0,l = aniCanvasArr.length;i<l;i++){
					aniCanvasArr[i].attr({'width':window["lib_"+aniName].properties.width,'height':window["lib_"+aniName].properties.height});
					

					var queue = evt.target;
					var ssMetadata = window["lib_"+aniName].ssMetadata;
					for(m=0; m<ssMetadata.length; m++) {
						window["ss_"+aniName][ssMetadata[m].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[m].name)], "frames": ssMetadata[m].frames} )
					}


					var tmpRoot = new window["lib_"+aniName][aniName]();

					var tmpStage = new createjs.Stage(aniCanvasArr[i][0]);

					tmpStage.addChild(tmpRoot);
					//tmpStage.tickOnUpdate = false;
					tmpStage.update();

					tmpStageArr.push(tmpStage);
					tmpExportRootArr.push(tmpRoot);
				}

				createjs.Ticker.setFPS(window["lib_"+aniName].properties.fps);

				var tmpAni = new aniScheme();
				tmpAni.init(aniCanvasArr, tmpStageArr,tmpExportRootArr,true,aniName);
				completeCallback(tmpAni);
			}
		});
	}
	aniProto.init = function(domArr, stageArr, rootArr, reset, aniName){
		this.domArr = domArr;
		this.aniStageArr = stageArr;
		this.aniRootArr = rootArr;
		this.aniReset = reset;
		this.aniName = aniName;
		this.reset = true;

		//this.tf = this.aniRoot.totalFrames;
		this.cf = 0;

		this.animating = false;
		this.needPlay = false;
	}
	aniProto.play = function(){
		if(!this.animating){
			this.animating = true;
			this.needPlay = true;
			requestAnimationFrame(playAni.bind(this));
		}
	}
	function playAni (){
		if(this.needPlay){
			// if infinite the animation
			if(this.cf >= this.tf-1){
				this.animating = false;
			}else{
				this.seek(this.cf+1);
				requestAnimationFrame(playAni.bind(this));
			}
		}
	}
	aniProto.pause = function(){
		this.needPlay = false;
		this.animating = false;
	};
	aniProto.seek = function(frame){
		this.cf = frame;
		
		for(var i = 0,l = this.aniStageArr.length;i<l;i++){
			this.aniRootArr[i].gotoAndStop(frame);
			this.aniStageArr[i].update();
		}
	};
	aniProto.resetAni = function(frame){
		this.seek(frame);
		this.reset = true;
	};


	// spec ani funcs
	// ------------------------------------------------------------
	aniProto.playFromTo = function(aniRange,anicomcallback){
		if(!this.animating){
			this.startF = aniRange[0];
			this.endF = aniRange[1];

			if(anicomcallback){
				this.anicomcallback = anicomcallback;
			}
			

			this.animating = true;
			this.needPlay = true;
			this.reset = false;

			requestAnimationFrame(playAniFT.bind(this));
		}
		
	}
	function playAniFT (){
		if(this.needPlay){
			if(this.startF<this.endF){
				this.seek(this.startF++);
				requestAnimationFrame(playAniFT.bind(this));
			}else{
				this.animating = false;
				if(this.anicomcallback){
					this.anicomcallback();
				}
			}
		}
	}
	return singleCjsLoader;
});