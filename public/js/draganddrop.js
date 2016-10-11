(function ($) {
    $.widget("gestionix.draganddrop", {
        options: {
            dropZone: null,
            allowExt: ".zip"
        },
        container: null,
        file: null,
        _setOption: function (key, value) {
            switch (key) {
                case "dropZone": this.options.dropZone = value;
                    break;
                case "allowExt": this.options.allowExt = value;
                    break;
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },
        _create: function () {
            this.container = this.element;
            if (this.options.dropZone == null) this.options.dropZone = $('<div/>');
            this.file = $('input[type=file]', this.container);
            this._events();
        },
        _events: function () {
            this.file.bind('change', $.proxy(this._changeFile, this));
            this.options.dropZone.bind("dragover", $.proxy(this._dragOver, this));
            this.options.dropZone.bind("dragleave", $.proxy(this._dragLeave, this));
            this.options.dropZone.bind("dragenter", $.proxy(this._dragEnter, this));
            this.options.dropZone.bind("drop", $.proxy(this._drop, this));
        },
        openFileDialog: function () {
            this.file.val('');
            this.file.trigger("click");
        },
        _changeFile: function (event) {
            var Control = this;
            var element = event.srcElement == undefined ? event.target : event.srcElement;
            if (element.files == undefined) this._trigger('noSupported', event, null);
            else this._validateFile(element.files[0]);
        },
        _dragOver: function (event) {
            event.preventDefault();
            event.stopPropagation();
            this._trigger('dragLeave', null, null);
        },
        _dragLeave: function (event) {
            event.preventDefault();
            event.stopPropagation();
            this.options.dropZone.addClass("drag-leave");
            this._trigger('dragLeave', null, null);
        },
        _dragEnter: function (event) {
            event.preventDefault();
            event.stopPropagation();
            this.options.dropZone.removeClass("drag-leave");
            this._trigger('drop', null, null);
        },
        _drop: function (event) {
            event.preventDefault();
            event.stopPropagation();

            this.options.dropZone.removeClass("drag-leave");
            this._trigger('drop', null, null);
            var files = event.originalEvent.dataTransfer;
            if (files.files == null || files.files === undefined || files.files.length == 0) return;
            this._validateFile(files.files[0]);
        },
        _validateFile: function (file) {
            if (file === undefined) return;
            var extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
            var extensionStatus = false;
            this._trigger('change', null, null);
            //validate extension
            $.each(this.options.allowExt.split("|"), function (index, _item) { if (extension == _item) { extensionStatus = true; return false; } });
            //file Reader
            if (!extensionStatus) this._trigger('error', null, null);
            else {
                this._loadFileAsURL(file);
            }
        },
        _loadFileAsURL: function (fileToUpload) {
            var control = this;
            var fileReader = new FileReader();
            control._trigger('started', null, null);
            fileReader.onload = function (fileLoadedEvent) {
                control._trigger('loaded', null, { base64: fileLoadedEvent.target.result.split(",")[1], name: fileToUpload.name });
            }
            fileReader.onprogress = function (data) {
                if (data.lengthComputable) {
                    var progress = parseInt(((data.loaded / data.total) * 100), 10);
                    control._trigger('progress', null, { progress: progress });
                }
            }
            fileReader.readAsDataURL(fileToUpload);
        },
        reset: function () {
            this.file.val('');
            this.options.dropZone.removeClass('drag-leave');
        }
    });
})(jQuery);

