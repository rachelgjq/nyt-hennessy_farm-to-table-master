require(['jquery','singleSection','scrollmagicmanager'],
	function($,singleSection,smm) {
		var nowW = 0,nowH = 0;
		var $window = $(window);

		// pre-process html dom according to platform
		// ---------------------------------------------------------------
		if(platform.isMobile){
		}
		if(platform.isTablet){
		}
		if(platform.isDesktop){
		}
		// ---------------------------------------------------------------
		var sectionInstanceArr = [];
		startPage();
		// begin instance each section base on it's [date-type]
		function startPage(){
			$(window).on('beforeunload', function() {
			    $(window).scrollTop(0);
			});



			var sectionDoms = $('.need-init');
			for(var i = 0,l = sectionDoms.length;i<l;i++){
				var singleSectionIns,
				    $tmpTargetDom = $(sectionDoms[i]);

				singleSectionIns = new singleSection();

				var smdConfigKey = platform.isMobile?'mobile':'desktop';
				singleSectionIns.init($tmpTargetDom,smdConfig[smdConfigKey][$tmpTargetDom.data('smd')]);
				$tmpTargetDom.data('instance',singleSectionIns);
				sectionInstanceArr.push(singleSectionIns);
			}
			if(sectionInstanceArr.length>0){
				loadSections(0);
			}else{
				afterPageLoad();
			}
			requestAnimationFrame(resizeHandle);
		}
		// load single sections one by one
		// once a section is loaded, all the animations it contains will play immediately
		function loadSections(index){
			// console.log('begin load section '+index);
			var dtd = $.Deferred();
			dtd.promise(sectionInstanceArr[index].preLoadSelf);

			sectionInstanceArr[index].preLoadSelf.done(function(){
				//console.log('complete load section '+index);
				index++;
				if(index<sectionInstanceArr.length){
				    loadSections(index);
				}else{
				    afterPageLoad();
				}
			});

			sectionInstanceArr[index].preLoadSelf(dtd);
		}
		function afterPageLoad(){
			initScrollTrack();
			initOtherTrack();
			$('.paid-bottom-border').appendTo($('.swiper-wrapper .swiper-slide:last-child .footer'));
            $('#site-index').appendTo($('.swiper-wrapper .swiper-slide:last-child .footer'));
            $('.page-footer').appendTo($('.swiper-wrapper .swiper-slide:last-child .footer'));
		}

		// window resize handle based on requestAnimationFrame
		// each sections' instance also implements a update method and will be called at this point

		function resizeHandle(){
			var tmpH = window.innerHeight ? window.innerHeight : $window.height();
			var tmpW = window.innerWidth ? window.innerWidth : $window.width();

			if(nowW !== tmpW || nowH !== tmpH){
				for(var i = 0,l = sectionInstanceArr.length;i<l;i++){
					if(sectionInstanceArr[i].update){
						sectionInstanceArr[i].update(tmpW,tmpH);
					}
				}
				nowW = tmpW;
				nowH = tmpH;

				smm.update(nowW,nowH);
			}
			requestAnimationFrame(resizeHandle);
		}
		// ---------------------------------------------------------------

		// tracking
		// ---------------------------------------------------------------
		function initScrollTrack(){
			var deviceMetrics = {};
			var sectionCount = 1;

			$('.tracking-block').each(function(index){
				var tracking = $(this).data("tracking");

				if(typeof tracking !== "undefined" && $(this).is(':visible')){
					deviceMetrics[""+sectionCount] = { "section" : tracking, "trigger" : $(this) };
					sectionCount++;
				}
			});
			smm.trackScroll(deviceMetrics);
		}
		function initOtherTrack(){
		}
		// ---------------------------------------------------------------
	}
);
