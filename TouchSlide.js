/**
 * Created by xesamguo@gmail.com
 * 416249980@qq.com
 */

if (TouchSlide) {
    throw new Error('TouchSlide: Duplicate!');
}

var TouchSlide = function (container, options) {
    if (!container) {
        throw new Error('TouchSlide:No container');
    }
    this.orientation = TouchSlide.HORIZONTAL;
    if (options) {
        this.orientation = options['orientation'];
    }

    this.container = this._$(container);
    this.element = this.container.children[0];
    this.slides = this.element.children;
    this.slideLength = this.slides.length;
    this.index = 0;

    this.interval = 250;
    this.slop = 20;
    this.duration = 200;

    this.init();

    var _this = this;

    this.element.addEventListener('touchstart', function (e) {
        _this.touchstart(e);
    }, false);
    this.element.addEventListener('touchmove', function (e) {
        _this.touchmove(e);
    }, false);
    this.element.addEventListener('touchend', function (e) {
        _this.touchend(e);
    }, false);

    window.addEventListener('resize', function (e) {
        _this.init();
    }, false);
};

TouchSlide.VERTICAL = 'vertical';
TouchSlide.HORIZONTAL = 'horizontal';

TouchSlide.prototype = {
    constructor: TouchSlide,
    _$: function (el) {
        return 'string' == el ? document.getElementById(el) : el;
    },
    init: function () {
        this.height = this.container.getBoundingClientRect().height;
        this.width = this.container.getBoundingClientRect().width;
        this.element.style.width = this.slideLength * this.width + 'px';
        var index = this.slideLength;
        while (index--) {
            this.slides[index].style.width = this.width + 'px';
        }
    },
    slideTo: function (index, duration) {
        this.move(0, index, duration);
        this.index = index;
    },
    move: function (delta, index, duration) {
        var style = this.element.style;
        style.webkitTransitionDuration = duration + 'ms';
        style.webkitTransform = this.isVertical() ? 'translate3d(0, ' + ( delta - index * this.height) + 'px,0)'
            : 'translate3d(' + ( delta - index * this.width) + 'px,0,0)';
    },
    isVertical: function () {
        return this.orientation == TouchSlide.VERTICAL;
    },
    isValidSlide: function () {
        var absDelta = Math.abs(this.deltaX);
        var viewSize = this.width;
        if (this.isVertical()) {
            absDelta = Math.abs(this.deltaY);
            viewSize = this.height;
        }
        return (Number(new Date()) - this.start.time < this.interval && absDelta > this.slop) || (absDelta > viewSize / 2);
    },
    isPastBounds: function () {
        var delta = this.deltaX;
        if (this.isVertical()) {
            delta = this.deltaY;
        }
        return this.index == 0 && delta > 0 || this.index == this.slideLength - 1 && delta < 0;
    },
    touchstart: function (e) {
        var touchEvent = e.touches[0];
        this.deltaX = 0;
        this.deltaY = 0;
        this.start = {
            x: touchEvent.pageX,
            y: touchEvent.pageY,
            time: Number(new Date())
        };
        this.originIntent = 0; //0:none; 1:horizontal; 2:vertical
        this.element.style.webkitTransitionDuration = 0;
    },
    touchmove: function (e) {
        var touchPoint = e.touches[0];
        this.deltaX = touchPoint.pageX - this.start.x;
        this.deltaY = touchPoint.pageY - this.start.y;
        if (this.originIntent == 0) {
            this.originIntent = Math.abs(this.deltaY) >= Math.abs(this.deltaX) ? 2 : 1;
        }
        if (this.isVertical() && this.originIntent == 2) {
            e.preventDefault();
            this.deltaY = this.deltaY / (this.isPastBounds() ? 2 : 1);
            this.move(this.deltaY, this.index, 0);
        }
        if ((!this.isVertical()) && this.originIntent == 1) {
            e.preventDefault();
            this.deltaX = this.deltaX / (this.isPastBounds() ? 2 : 1);
            this.move(this.deltaX, this.index, 0);
        }
    },
    touchend: function (e) {
        if ((this.isVertical() && this.originIntent == 2) || (!this.isVertical()) && this.originIntent == 1) {
            var offset = this.isVertical() ? (this.deltaY < 0 ? 1 : -1) : (this.deltaX < 0 ? 1 : -1);
            this.slideTo(this.index + ( this.isValidSlide() && !this.isPastBounds() ? offset : 0 ), this.duration);
        }
    }
};

