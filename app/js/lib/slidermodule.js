define(['jquery', 'TweenMax', 'utils', 'swiper'], function ($, TweenMax, utils, Swiper) {
    var Scheme = function sliderModule() {},
        proto = Scheme.prototype;
    var self;


    proto.init = function ($dom, dtd) {
        self = this;
        this.$dom = $dom;
        self.swiperContainer = this.$dom.find('.swiper-container');
        var $window = $(window);
        var body = document.body;

        var swiperSlide = $('.swiper-slide');
        var swiperSlideM = $('.swiper-slide-m');
        var placeholder = $('.placeholder');
        var heroText = $('.swiper-slide1').find('.hero-container');
        var indicator1 = $('.indicator1');
        var indicator2 = $('.indicator2');
        var topBtn = $('.top-btn');
        var brandFooter = $('.brand-footer');
        var footer = brandFooter.find('.footer');
        var footerH;


        var circle_box = self.$dom.find('.swiper-slide .circle-box');
        var lineLeft = self.$dom.find('.swiper-slide .lineLeft');
        var lineRight = self.$dom.find('.swiper-slide .lineRight');
        var left_box = circle_box.find('.left .img-box');
        var right_box = circle_box.find('.right .img-box');


        var displayD = $('.display-d');
        var lineObj = ['.lineLeft', '.lineRight', '.line'];
        var circleObj = $('.circle');

        var time = 0.4;
        var canSlide = true;
        var resizeST;
        var ignoreList = [4, 9, 14];

        var prevTimeStamp = Date.now();
        // var flagFromWheel = false;


        // if(platform.isTablet){
        //     swiperSlideM.remove();
        // }
        //


        for (var i = 0; i < swiperSlide.length; ++i) {
            $('<li>').appendTo(placeholder);
        }

        var placeholderItems = placeholder.children();

        window.swiper = self.swiper = new Swiper('.swiper-container', {
            direction: 'vertical',
            effect: 'fade',
            speed: 600,
            loop: false,
            simulateTouch: false,
            onInit: function (swiper) {
                dtd.resolve();
                heroText.addClass('show');
            },
            onSlideChangeStart: function (swiper) {
                // if (platform.isDesktop) {
                //     if ((platform.isSafari || platform.isIE || platform.isEdge) && (swiper.previousIndex < swiper.activeIndex)) {
                //         textAni();
                //     }
                // } else {
                //     if (platform.isSafari) {
                //         if (swiper.previousIndex === 0 && swiper.activeIndex === 1) {
                //             textAni();
                //         }
                //     }
                // }


                if (swiper.activeIndex >= 1) {
                    topBtn.addClass('show');
                } else {
                    topBtn.removeClass('show');
                }

                circleAni();

                if (brandFooter.hasClass('swiper-slide-active')) {
                    topBtn.css('bottom', footer.height());
                } else {
                    topBtn.css('bottom', 0);
                }


                var prevItem = swiperSlideM.prev();
                if (swiperSlideM.hasClass('swiper-slide-prev')) {
                    prevItem.addClass('descpre');
                } else {
                    prevItem.removeClass('descpre');
                }

                topBtnStyle();

            },
            onSlideChangeEnd: function (swiper) {
                // if (platform.isSafari || platform.isIE || platform.isEdge) {
                //     if (swiper.previousIndex > swiper.activeIndex) {
                //         textAni();
                //     }
                // } else {
                    textAni();
                // }

            },

        });




        function topBtnStyle() {
            if (brandFooter.hasClass('swiper-slide-active')) {
                topBtn.css('bottom', footer.height());
            } else {
                topBtn.css('bottom', 0);
            }
        }

        function textAni() {
            $('.swiper-slide.active').removeClass('active');
            $('.swiper-slide.swiper-slide-active').addClass('active');
        }

        /////////resize circle animation
        function circleAni() {
            if (inBigSize()) {
                if ([2, 7, 12].indexOf(swiper.activeIndex) !== -1) {
                    StartCirlrAni();
                } else {
                    killCirleAni();
                }
            } else {
                if ([3, 8, 13].indexOf(swiper.activeIndex) !== -1) {
                    StartCirlrAni();
                } else {
                    killCirleAni();
                }
            }
        }

        /////////// new circle animation
        function StartCirlrAni() {
            var currentSwiper = swiper.slides[swiper.activeIndex];
            var currentCirle = currentSwiper.querySelectorAll('.circle')[0];

            $(currentSwiper).addClass('circle-done');

            if (platform.isIE || platform.isEdge) {
                TweenMax.fromTo(circleObj, 0.6, {
                    'stroke-dashoffset': 300
                }, {
                    'stroke-dashoffset': 0,
                    ease: Linear.easeInOut,
                    delay: 0.4,
                });
            } else {
                setTimeout(function () {
                    currentCirle.addClass('active');
                }, 400);
            }

            TweenMax.set(lineObj, {
                scaleX: 0
            });
            if (platform.isIE || platform.isEdge) {
                TweenMax.set(circleObj, {
                    'stroke-dashoffset': 300,
                    delay: 0.4,
                });
            }

            TweenMax.fromTo(lineObj, 0.4, {
                scaleX: 0,
                force3D: platform.isSafari,
            }, {
                scaleX: 1,
                ease: Linear.easeInOut,
                delay: 0.9
            });
        }

        function killCirleAni() {
            var currentSwiper = swiper.slides[swiper.activeIndex];

            $(currentSwiper).removeClass('circle-done');

            TweenMax.killAll();
            TweenMax.set(lineObj, {
                scaleX: 0,
                delay: 0.4,
            });
            if (platform.isIE || platform.isEdge) {
                TweenMax.set(circleObj, {
                    'stroke-dashoffset': 300,
                    delay: 0.4,
                });
            }
            var previouSwiper = swiper.slides[swiper.previousIndex];
            var previousCirle = previouSwiper.querySelectorAll('.circle')[0];

            if (!!previousCirle) {
                setTimeout(function () {
                    previousCirle.removeClass('active');
                }, 400);

            }
        }
        ///////////
        ///
        indicator1.on('click', function () {
            jumpTo(swiper.activeIndex + 1);
            swiper.slideTo(swiper.activeIndex + 1);
            G.track('Header arrow indicator');
        });

        indicator2.on('click', function () {
            jumpTo(swiper.activeIndex + 1);
            swiper.slideTo(swiper.activeIndex + 1);
            G.track('Second arrow indicator');
        });



        topBtn.on('click', function () {
            jumpTo(0);
            swiper.slideTo(0);
            G.track('Back to top');
        });

        $('.footer-container').on('click', function () {
            if (brandFooter.hasClass('swiper-slide-active')) {
                window.open('http://www.hennessy.com/us/collection/vsop-privilege/');
                return false;
            }
        });

        $('.swiper-button-next').on('click', function () {
            jumpTo(swiper.activeIndex + 1);
        });

        $('.swiper-button-prev').on('click', function () {
            jumpTo(swiper.activeIndex - 1);
        });


        $window.on('scroll', function (e) {
            if (platform.isMobile) return;

            var targetIndex;
            for (var i = 0; i < placeholderItems.length; ++i) {
                var rect = placeholderItems[i].getBoundingClientRect();

                if (rect.top <= 118 && rect.bottom > 118) {
                    targetIndex = i;
                    break;
                }
            }

            if (needIgnore(targetIndex)) return;


            if (canSlide && swiper.activeIndex !== targetIndex) {
                // console.log('?????');

                swiper.slideTo(targetIndex);
            }
        });

        $window.on('resize', function () {
            topBtnStyle();

            canSlide = false;

            var targetTop = placeholderItems.eq(swiper.activeIndex).offset().top - 118;
            $window.scrollTop(targetTop);

            clearTimeout(resizeST);

            resizeST = setTimeout(function () {
                canSlide = true;
            }, 500);


            if (!platform.isDesktop) return;

            if (swiperSlideM.hasClass('swiper-slide-active') && displayD.css('display') == 'block') {
                swiper.slideTo(swiper.activeIndex - 1);
                $('.swiper-slide-active').addClass('active');

                var previouSwiper = swiper.slides[swiper.activeIndex - 1];
                var previousCirle = previouSwiper.querySelectorAll('.circle')[0];

                previousCirle.removeClass('active');
            }

            var currentSlide = $(swiper.slides[swiper.activeIndex]);
            var circleBox = $(currentSlide).find('.circle-box');

            if (circleBox.length > 0) {
                if (inBigSize()) {
                    if (!currentSlide.hasClass('circle-done')) {
                        StartCirlrAni();
                    }
                } else {
                    if (currentSlide.hasClass('circle-done')) {
                        killCirleAni();
                    }
                }
            }

            if (swiperSlideM.hasClass('swiper-slide-next') && displayD.css('display') == 'none') {
                jumpTo(swiper.activeIndex + 1);
                swiper.slideTo(swiper.activeIndex + 1);
            }
        });

        var freezeTime = 500;
        /*if (platform.isFirefox) {
            freezeTime = 20000;
        }*/
        $window.on('mousewheel DOMMouseScroll', function (e) {
            e.preventDefault();
            if (!canSlide) return;

            var delta = e.originalEvent.detail ? e.originalEvent.detail * 90 : (-e.originalEvent.wheelDelta) * 0.75;

            var currentTimeStamp = Date.now();
            var diff = currentTimeStamp - prevTimeStamp;

            if (diff < freezeTime){
                // console.log('freeze!');
                return;
            }

            // console.log(diff);

            var targetIndex;

            if (delta > 0) targetIndex = swiper.activeIndex + 1; // down
            if (delta < 0) targetIndex = swiper.activeIndex - 1; // up

            prevTimeStamp = currentTimeStamp;


            if (needIgnore(targetIndex)) {
                if (delta > 0) {
                    ++targetIndex;
                }

                if (delta < 0) {
                    --targetIndex;
                }
            }

            // flagFromWheel = true;
            jumpTo(targetIndex);
        });

        function jumpTo(index) {
            if (swiper.animating) return;
            // console.log('====', index);
            if (index < 0) index = 0;
            if (index === swiperSlide.length) index = swiperSlide.length - 1;

            var targetTop = placeholderItems.eq(index).offset().top - 118;
            $window.scrollTop(targetTop);
        }

        function needIgnore(index) {
            if (inBigSize()) {
                return ignoreList.indexOf(index) !== -1;
            }
        }

        function inBigSize(){
            return displayD.is(':visible');
        }
    }

    proto.update = function (tmpW, tmpH) {};

    return Scheme;
});
