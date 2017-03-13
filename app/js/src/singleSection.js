define('singleSection',['jquery','TweenMax','preloadAssets','scrollmagicmanager','cjsLoader','utils'],
	function($,TweenMax,preload,smm,cjsLoader,utils){
	var Scheme = function singleSection() {},
	proto = Scheme.prototype;

	proto.init = function($dom,smd){
		this.$dom = $dom;
		this.smd = smd;
		this.nowW = window.innerWidth ? window.innerWidth : $window.width();

		this.modules = [];

		this.smdNeedReset = [];
	};

	/**
	 * Load all assets that current section need, include images, cjs animation assets, assets in modules(if there has)
	 *
	 * ##### Options:
	 * - `dtd` -- Deferred object, call resolve on it once all work complete
	**/
	proto.preLoadSelf = function(dtd){
		var tmpSelf = this;
		$.when(preload.preloadImgs(tmpSelf.$dom)).done(function(){

			$.when(tmpSelf.requestAddSMM(),tmpSelf.checkModules()).done(function(){
				// tmpSelf.$dom.css('display','block');
				tmpSelf.$dom.removeClass('need-init');
				dtd.resolve();
			});
		});
	};

	// handle scrollmagic based animtion
	// ------------------------------------------------------------------------------------
	proto.requestAddSMM = function(){
		var dtd = $.Deferred();

		var dtdArr = [];
		for(var singleSmd in this.smd){

			var singleDtd = $.Deferred();
			this.initAni(this.smd[singleSmd],singleDtd);
			dtdArr.push(singleDtd);
		}

		// wait for all scrollmagic based animations' init function complete
		$.when.apply($, dtdArr).done(function(){
			dtd.resolve();
		});


		return dtd.promise();
	};
	/**
	 * Distribute scrollmagic based animation init function according to its type
	**/
	proto.initAni = function(singleSmd,dtd){
		if(!singleSmd.inited){
			singleSmd.inited = true;

			this['init_'+singleSmd.ani_type](singleSmd,dtd);
		}
	};

	/**
	 * Base type of scrollmagic based animation, no need load extra files, so deffer will resolve immediately.
	**/
	proto.init_base = function(smd,dtd){
		var aniTL = new TimelineMax(),
			tweenArr = [];

		for(var key in smd.ani){
			var tmpAniObj = smd.ani[key],singleTween;
			tmpAniObj.dom = $(tmpAniObj.dom);

			var resetObj = {}, toObj = {};
			for(var i = 0,l = tmpAniObj.change.length;i<l;i++){
				resetObj[tmpAniObj.change[i].proper] = tmpAniObj.change[i].from;
				toObj[tmpAniObj.change[i].proper] = tmpAniObj.change[i].to;
				if(tmpAniObj.change[i].onComplete){
					toObj.onComplete = this.onAniComplete.bind(this);
					toObj.onCompleteParams = [tmpAniObj.change[i].onComplete];
				}
			}
			TweenMax.set(tmpAniObj.dom,resetObj);
			singleTween = TweenMax.to(tmpAniObj.dom,tmpAniObj.duration,toObj);
			tweenArr.push(singleTween);
			tmpAniObj = null;
		}


		/* 04/29/2016
		 * ( value:*, position:*, align:String, stagger:Number )
		 * align:"sequence"/"start"/"normal"
		 * refer: http://greensock.com/docs/#/HTML5/GSAP/TimelineLite/add/
		*/

		aniTL.add(tweenArr,"+=0",smd.ani_align,smd.ani_stagger_t?smd.ani_stagger_t:0);
		aniTL.pause();

		dtd.resolve();

		smd.aniObj = aniTL;
		smm.addScrollMagic(smd,this);
	};
	proto.init_cjsAni = function(smd,dtd){
		var tmpSelf = this;
		cjsLoader.loadCjsAni(smd.ani_name,$(smd.ani_container),function(aniObj){
			dtd.resolve();
			smd.aniObj = aniObj;

			if(smd.ani_scope){
				smd.aniObj.seek(smd.ani_scope[0]);
			}

			smm.addScrollMagic(smd,tmpSelf);
		});
	};

	proto.init_parallax = function(smd,dtd){
		smd.durationDom = $(smd.durationDom);
		for(var key in smd.ani){
			var tmpAniObj = smd.ani[key],singleTween;
			tmpAniObj.dom = $(tmpAniObj.dom);

			var varsObj = {};
			for(var i = 0,l = tmpAniObj.change.length;i<l;i++){
				varsObj[tmpAniObj.change[i].proper] = tmpAniObj.change[i].to;
				
			}
			smm.addParallaxScrollMagic(smd,varsObj,tmpAniObj.dom);
			tmpAniObj = null;
		}
		dtd.resolve();
	};
	proto.init_pin = function(smd,dtd){
		smd.durationDom = $(smd.durationDom);
		smm.addFixScrollMagic(smd);
		dtd.resolve();
	};
	proto.init_classToggle = function(smd,dtd){
		smm.addClassToggleScrollMagic(smd);
		dtd.resolve();
	};


	proto.playAni = function(singleSmd){
		if(singleSmd.needbroadcast){
			for(var singleModule in this.modules){
				if(this.modules[singleModule] && this.modules[singleModule].broadcastListener){
					this.modules[singleModule].broadcastListener('intoviewport');
				}
			}
		}

		if(singleSmd.aniObj){
			if(singleSmd.ani_scope){
				if(singleSmd.enable && singleSmd.reset && this.nowW<=singleSmd.widthScope[1] && this.nowW>=singleSmd.widthScope[0]){
					singleSmd.aniObj.playFromTo(singleSmd.ani_scope);
					singleSmd.reset = false;
				}
			}else{
				if(singleSmd.enable && singleSmd.reset){
					if(this.nowW<=singleSmd.widthScope[1] && this.nowW>=singleSmd.widthScope[0]){
						singleSmd.aniObj.play();
					}else{
						this.smdNeedReset.push(singleSmd);
					}
					singleSmd.reset = false;
				}
			}
		}
	};
	/**
	 * Reset a smd once current section out of viewport along with page scroll up.
	 *
	 * ##### Options:
	 * - `singleSmd` -- A smd need to reset
	**/
	proto.resetAni = function(singleSmd){
		if(singleSmd.needbroadcast){
			for(var singleModule in this.modules){
				if(this.modules[singleModule] && this.modules[singleModule].broadcastListener){
					this.modules[singleModule].broadcastListener('outofviewport');
				}
			}
		}
		if(singleSmd.aniObj){
			singleSmd.aniObj.pause();
			singleSmd.reset = true;
			if(singleSmd.ani_scope){
				singleSmd.aniObj.resetAni(singleSmd.ani_scope[0]);
			}else{
				singleSmd.aniObj.seek(0);
			}
		}
	};
	/**
	 * A TimeLine type animation will call this function once complete, to do this, a 'complete' attr need be set
	 * in the corrsepond smd with a value of another smd in same section.
	 *
	 * ##### Options:
	 * - `smdNeedPlay` -- target smd
	**/
	proto.onAniComplete = function(smdNeedPlay){
		// console.log('onAniComplete');
		if(smdNeedPlay === 'videoslider'){
			if(this.modules[smdNeedPlay].specBaseAniComplete){
				this.modules[smdNeedPlay].specBaseAniComplete();
			}
		}else{
			// the smd in smdNeedPlay has enable attr with value 'false',it can't be play within playAni function
			// this function called here just for check broadcast if needed.
			this.playAni(this.smd[smdNeedPlay]);

			// play this smd directly
			if(this.smd[smdNeedPlay].ani_scope){
				// this smd is a cjs_ani type
				try{
					if(this.smd[smdNeedPlay].aniObj.reset){
						this.smd[smdNeedPlay].aniObj.playFromTo(this.smd[smdNeedPlay].ani_scope);
					}
				}catch(e){
					console.log(e);
				}
			}else{
				// this smd is a timeline type
				this.smd[smdNeedPlay].aniObj.play();
			}
		}
	};

	// handle extend modules
	// ------------------------------------------------------------------------------------
	proto.checkModules = function(){
		var tmpSelf = this;
		var dtd = $.Deferred();

		var dtdArr = [];
		var attrs = this.$dom[0].attributes,
			moduleArr = [];
		for(var i = 0,l = attrs.length;i<l;i++){
			if(attrs[i].name.indexOf('module')!==-1){
				// this section has a module,named module-xxxxx
				moduleArr.push(PaidPost.assets+'js/lib/'+attrs[i].name.substr(7)+'.js');
			}
		}
		if(moduleArr.length>0){
			require(moduleArr,function(){
				for(var i = 0,l = arguments.length;i<l;i++){
					var tmpDtd = $.Deferred();
					tmpSelf.modules.push(tmpSelf.initModule(arguments[i],tmpDtd));
					dtdArr.push(tmpDtd);
				}
				$.when.apply($, dtdArr).done(function(){
					dtd.resolve();
				});
			});
		}else{
			dtd.resolve();
		}

		return dtd.promise();
	};
	proto.initModule = function(constructor,dtd){
		var tmpModule = new constructor();
		tmpModule.init(this.$dom,dtd);

		return tmpModule;
	};

	// ------------------------------------------------------------------------------------
	proto.afterPageLoad = function(){
		for(var module in this.modules){
			if(this.modules[module] && this.modules[module].afterPageLoad){
				this.modules[module].afterPageLoad();
			}
		}
	};
	proto.update = function(tmpW,tmpH){
		for(var singleSmd in this.smd){
			if(this.smd[singleSmd].aniObj){
				if(this.smd[singleSmd].aniObj.update){
					this.smd[singleSmd].aniObj.update(tmpW,tmpH);
				}
			}
		}
		for(var module in this.modules){
			if(this.modules[module] && this.modules[module].update){
				this.modules[module].update(tmpW,tmpH);
			}
		}

		var tmpShiftArr = [];
		for(var i = 0,l = this.smdNeedReset.length;i<l;i++){

			if(tmpW>=this.smdNeedReset[i].widthScope[0] && tmpW<=this.smdNeedReset[i].widthScope[1]){

				if(this.smdNeedReset[i].aniObj){
					this.smdNeedReset[i].aniObj.pause();
					this.smdNeedReset[i].aniObj.seek(this.smdNeedReset[i].aniObj.endTime());
				}
				tmpShiftArr.push(this.smdNeedReset[i]);
			}
		}

		for(i = 0,l = tmpShiftArr.length;i<l;i++){
			this.smdNeedReset = utils.removeFromArray(this.smdNeedReset, tmpShiftArr[i]);
		}

		this.nowW = tmpW;
	};

	return Scheme;
});
