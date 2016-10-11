(function ($) {
    $.widget('ionix.Modal', {
        options: {
            title: 'Modal 1',
            simpleModal: false,
            footer: false,
            width: null,
            height: null,
            top: null,
            left: null,
            contextWidth: null,
            clearBoth: false,
            verticalCenter: false,
            keyEsc: true,
            btnclose: true
        },
        overlay: null,
        modal: null,
        modalDialog: null,
        modalContent: null,
        modaldialog: null,
        _create: function () {
            this.modaldialog = this.element;
            this._build();
            if (this.options.keyEsc) $(document).bind('keydown', $.proxy(this._keyEsc, this));
        },
        _setOption: function (key, value) {
            switch (key) {
                case 'title': this.options.title = value;
                    break;
                case 'displayTitle': this.options.displayTitle = value;
                    break;
                case 'simpleModal': this.options.simpleModal = value;
                    break;
                case 'width': this.options.width = value;
                    break;
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _build: function () {
            this.modal = $($.parseHTML('<div class="modal fade" id="MyModal" aria-hidden="true"></div>'));
            this.modalDialog = $($.parseHTML('<div class="modal-dialog"></div>'));//<div class="modal-footer"></div>
            this.modalContent = $($.parseHTML('<div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" ' + (this.options.btnclose == true ? '' : 'style="display:none;"') + ' aria-hidden="true">×</button><h4 class="modal-title">' + this.options.title + '</h4></div><div class="container"></div><div class="modal-body"></div></div>'));
            this.modaldialog.before(this.modal);
            $(".modal-body", this.modalContent).html(this.modaldialog);
            if (this.options.clearBoth) $('.modal-body', this.modalContent).append('<div style="clear:both;"></div>');
            this.modalDialog.html(this.modalContent);
            this.modal.html(this.modalDialog);
            $('.close', this.modalContent).eq(0).bind('click', $.proxy(this.hide, this));
            this.modaldialog.show();
            //css
            if (this.options.simpleModal) {
                this.modalContent.css('background-color', 'transparent');
                $('.modal-header', this.modalContent).eq(0).addClass('element-hidden');
                $(".modal-body", this.modalContent).eq(0).css('padding', '0px');
            }
        },
        _resize: function () {
            //this.modalDialog.css('min-heght', this.modaldialog.height);
        },
        show: function () {
            var zIndex = 10040 + (10 * $('.modal-stack:visible').length);
            if (this.overlay == null) {
                this.overlay = $($.parseHTML('<div class="modal-backdrop fade in modal-stack"></div>'));
                this.modal.before(this.overlay);
            }
            this.overlay.css('z-index', zIndex - 1);
            $(".modal-body", this.modalContent).css('min-height', this.options.height == null ? this.modaldialog.height() : this.options.height);
            this.modalDialog.css('width', this.options.width == null ? (parseInt(this.modaldialog.width()) + 30) + 'px' : this.options.width);
            $('body').addClass('modal-open');
            var control = this;
            setTimeout(function () { control.modal.css('overflow', ''); }, 400);
            this.modal.show();
            this.modal.css({
                'z-index': zIndex,
                'left': $('.modal-stack:visible').length == 1 ? $('.navbar-default.navbar-static-side').width() + 'px' : '',
                'overflow': 'hidden',
                'top': $('.modal-stack:visible').length == 1 ? $(window).height() >= this.modalDialog.height() ? ((($(window).height() / 2) - 30) - (this.modalDialog.height() / 2)) + 'px' : '' : '',
            });
            //context < content  Subniveles
            if (this.options.contextWidth != null || $('.modal-stack:visible').length > 1) {
                if (this.options.contextWidth == null) this.options.contextWidth = $('.modal:visible .modal-dialog').eq($('.modal-stack:visible').length - 2).width();
                if (this.options.width == null) this.options.width = this.modalDialog.width();
                if (this.options.contextWidth < this.options.width) {
                    var left = -((this.modaldialog.width() - this.options.contextWidth)) / 2
                    this.modal.css({
                        'width': this.options.width,
                        'left': left < 0 ? left : ''
                    });
                } else {
                    var parentContext = $('.modal:visible').eq($('.modal-stack:visible').length - 2);
                    if ($('.modal-stack:visible', parentContext).length == 0) this.modal.css('left', $('.navbar-default.navbar-static-side').width());
                }
                if ($('.modal-dialog', parentContext).height() > this.modalDialog.height()) {
                    var marginTop = ($('.modal-dialog', parentContext).height() - this.modalDialog.height()) / 2;
                    this.modal.css('margin-top', marginTop - 40 < 0 ? marginTop : marginTop - 40);
                }
            }
            this.modal.removeClass('zoomOut');
            this.modal.addClass('in animated slideInDown');
            this.overlay.show();
        },
        hide: function () {
            var control = this;
            if (this.overlay != null) { this.overlay.remove(); this.overlay = null; }
            this.modal.removeClass('in slideInDown');
            this.modal.addClass('zoomOut');
            setTimeout(function () { control.modal.hide(); }, 300);
            if ($('.modal-stack:visible').length == 0) $('body').removeClass('modal-open');
        },
        _keyEsc: function (event) {
            if ($('.modal-stack:visible').length > 0 && event.which == 27) {
                if ($('.modal-stack:visible').length == 1) this.hide();
                else if (this.overlay != null)
                    if ($('.modal-stack:visible').eq($('.modal-stack:visible').length - 1).attr('id') == this.overlay.attr('id')) {
                        this.hide();
                        event.stopImmediatePropagation();
                    }
            }
        },
        setTitle: function (title) {
            $('.modal-title', this.modalDialog).html(title);
        }
    });
})(jQuery)