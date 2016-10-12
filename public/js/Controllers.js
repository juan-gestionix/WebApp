$.urlParam = function (name) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results == null ? null : results[1] || 0;
};
var CustomGeneral = {
    RegexRFC: "^(([A-Z]|[a-z]|\s){1})(([A-Z]|[a-z]){3})([0-9]{6})((([A-Z]|[a-z]|[0-9]){3}))"

}
//COI -> 1
var $coi = {
    html: {
        data: {
            xhrUpload: null,
            xhrMigration: null,
            companyId: $.urlParam('companyId') == null ? null : $.rc4DecryptStr($.urlParam('companyId'), 'company'),
            userId: $.urlParam('userId') == null ? null : $.rc4DecryptStr($.urlParam('userId'), 'user'),
            systemMigration: 1,
            responsePending: false,
            response: null,
            init: {
                rfc: null,
                textRFC: null,
                businessName: null,
                country: null
            },
            loadFile: {
                file: null,
                base64: null,
                name: null,
            },
            migrating: {
                accounts: null,
                periods: null,
                polizas: null,
                additionalData: null
            }
        },
        components: {
            container: null,
            init: {
                container: null,
                validRFC: null,
                validBusinessName: null,
                buttonInit: null,
                buttonInitCOI: null
            },
            loadFile: {
                container: null,
                buttonUpload: null,
                loading: null,
                trash: null,
                buttonContinue: null,
                message: null,
                linkBack: null
            },
            loadingFile: {
                container: null,
                loading: null,
                message: null,
                buttonCancel: null
            },
            migrating: {
                container: null,
                estimatedTime: null,
                accounts: null,
                loadingAccounts: null,
                loadingPeriods: null,
                loadingPoliza: null,
                loadingAdditional: null,
                buttonCancel: null
            }
        },
        get: function () {
            var html = $coi.html;

            html.components.container = $('.container');
            html.components.init.container = $('.content-start', html.components.container);
            html.data.init.rfc = $('#inputRFC', html.components.init.container);
            html.data.init.businessName = $('#inputBusinessName', html.components.init.container);
            html.data.init.country = $('#inputCountry', html.components.init.container);
            html.components.init.validRFC = $('#validRFC', html.components.init.container);
            html.components.init.validBusinessName = $('#validBusinessName', html.components.init.container);
            html.components.init.buttonInit = $('#buttonInit', html.components.init.container);
            html.components.init.buttonInitCOI = $('#buttonInitCOI', html.components.init.container);
            html.components.loadFile.container = $('.content-upload', html.components.container);
            html.data.loadFile.file = $('#backupCOI', html.components.loadFile.container);
            html.components.loadFile.buttonUpload = $('#buttonUpload', html.components.loadFile.container);
            html.components.loadFile.loading = $('#progressReadFile', html.components.loadFile.container);
            html.components.loadFile.trash = $('#trashFile', html.components.loadFile.container);
            html.components.loadFile.buttonContinue = $('#buttonContinue', html.components.loadFile.container);
            html.components.loadFile.linkBack = $('#linkBackStart', html.components.loadFile.container);
            html.components.loadFile.message = $('#messageFileEmpty', html.components.loadFile.container);
            html.components.loadingFile.container = $('.content-uploading', html.components.loadingFile.container);
            html.components.loadingFile.loading = $('#loadingUploadFile', html.components.loadingFile.container);
            html.components.loadingFile.message = $('#errorFileUpload', html.components.loadingFile.container);
            html.components.loadingFile.buttonCancel = $('#buttonCancelUploadFile', html.components.loadingFile.container);
            html.components.migrating.container = $('.content-migrating', html.components.container);
            html.components.migrating.estimatedTime = $('#EstimatedTime', html.components.migrating.container);
            html.components.migrating.loadingAccounts = $('#migrationAccount', html.components.migrating.container);
            html.components.migrating.loadingPeriods = $('#migrationPeriods', html.components.migrating.container);
            html.components.migrating.loadingPoliza = $('#migrationPolizas', html.components.migrating.container);
            html.components.migrating.loadingAdditional = $('#migrationAdditonals', html.components.migrating.container);
            html.components.migrating.buttonCancel = $('#buttonCancelMigration', html.components.migrating.container);
        }
    },
    init: function () {
        var coi = $coi;
        var html = coi.html;

        html.get();
        coi.events();
        html.data.init.rfc.focus();
        html.data.init.rfc.val('XAXX010101000'); //$.rc4DecryptStr($.urlParam('rfc'), 'rfc')
        html.data.init.businessName.val($.rc4DecryptStr($.urlParam('businessName'), 'businessName'));
        if (!$coi.validRFC()) $coi.html.data.init.rfc.val('').focus();
        else $coi.html.data.init.businessName.val('').focus();
    },
    events: function () {
        var html = $coi.html;
        html.data.init.rfc.bind('keyup', $coi.validRFC);
        html.data.init.businessName.bind('keyup', $coi.validBusinessName);
        html.components.init.buttonInit.bind('click', $coi.ShowWizard);
        html.components.init.buttonInitCOI.bind('click', $coi.start);
        html.data.loadFile.file.parent().draganddrop({ dropZone: html.data.loadFile.file.parent() }, {
            loaded: $coi.loadedFile,
            progress: $coi.progress,
            dragLeave: $coi.dragLeave,
            drop: $coi.drop,
            started: $coi.startedReadFile,
            error: $coi.errorFile
        });
        html.components.loadFile.buttonUpload.bind('click', $coi.openFiledialog);
        html.components.loadFile.trash.bind('click', $coi.trashFile);
        html.components.loadFile.buttonContinue.bind('click', $coi.sendFile);
        html.components.loadFile.linkBack.bind('click', $coi.backStart);
        html.components.loadingFile.buttonCancel.bind('click', $coi.cancelUploadFile);
        html.components.migrating.buttonCancel.bind('click', $coi.cancelMigration);
        //html.components.migrating.btn_AcceptAnswer.bind('click', $coi.acceptAnswer);

    },
    validRFC: function () {
        var html = $coi.html;
        var Regex = new RegExp(CustomGeneral.RegexRFC);

        html.data.init.textRFC = $.trim(html.data.init.rfc.val()).split(' ').join('');
        html.data.init.textRFC = html.data.init.textRFC.split('-').join('');
        html.data.init.textRFC = html.data.init.textRFC.toUpperCase();
        if (html.data.init.rfc.val() == "") {
            html.components.init.validRFC.text('*');
            html.components.init.validRFC.removeClass('validate validate_true validate_false');
            html.components.init.validRFC.addClass('required');
            return false;
        } else if (html.data.init.textRFC.match(Regex)) {
            html.components.init.validRFC.text('');
            html.components.init.validRFC.removeClass('required validate_false');
            html.components.init.validRFC.addClass('validate validate_true');
            return true;
        } else {
            html.components.init.validRFC.text('');
            html.components.init.validRFC.removeClass('required validate_true');
            html.components.init.validRFC.addClass('validate validate_false');
            return false;
        }
    },
    validBusinessName: function () {
        var html = $coi.html;
        if (html.data.init.businessName.val() == "") {
            html.components.init.validBusinessName.text('*');
            html.components.init.validBusinessName.removeClass('validate validate_true validate_false');
            html.components.init.validBusinessName.addClass('required');
            return false;
        } else {
            html.components.init.validBusinessName.text('');
            html.components.init.validBusinessName.removeClass('required validate_false');
            html.components.init.validBusinessName.addClass('validate validate_true');
            return true;
        }
    },
    validInit: function () {
        return $coi.validRFC() && $coi.validBusinessName();
    },
    start: function () {
        var html = $coi.html.components;
        if ($coi.validInit()) {
            html.loadFile.container.removeClass('hidden');
            html.init.container.addClass('hidden');
            html.init.container.jAnimateOnce('fadeOutRight');
            html.loadFile.container.jAnimateOnce('fadeInLeft');
        } else {
            if (!$coi.validRFC()) $coi.html.data.init.rfc.val('').focus();
            else $coi.html.data.init.businessName.val('').focus();
        }
    },
    openFiledialog: function () {
        $coi.html.data.loadFile.file.parent().draganddrop('openFileDialog');
    },
    errorFile: function (event, data) {
        $coi.html.components.loadFile.message.removeClass('hidden');
        $coi.html.components.loadFile.message.jAnimateOnce('fadeInUp');
        $coi.html.components.loadFile.message.html('<div class="alert alert-danger" role="alert"><button type= "button" class="close" data- dismiss="alert" aria- label="Close"><span aria-hidden="true">&times; </span></button ><strong>Error</strong> Archivo no válido</div>');
        $coi.html.components.loadFile.message.find('.close').bind('click', function () {
            $coi.html.components.loadFile.message.html('');
        });
    },
    loadedFile: function (event, data) {
        var html = $coi.html;

        html.components.loadFile.trash.removeClass('hidden');
        html.components.loadFile.trash.parent().find('label').text(data.name);
        html.data.loadFile.base64 = data.base64;
        html.data.loadFile.name = data.name;
        html.components.loadFile.loading.addClass('hidden');
        html.components.loadFile.message.addClass('hidden');
        html.components.loadFile.buttonContinue.removeClass('hidden animated fadeOutDown');
        html.components.loadFile.buttonContinue.jAnimateOnce('fadeInUp', function () {
            html.components.loadFile.buttonContinue.removeClass('hidden');
        });
    },
    progress: function (event, data) {
        var html = $coi.html;
        html.components.loadFile.loading.find('.progress-bar').css('width', data.progress + '%');
        html.components.loadFile.loading.find('.progress-bar').text(data.progress + '%');
    },
    dragLeave: function (event, data) {
        $coi.html.data.loadFile.file.parent().addClass('animated bounce');
    },
    drop: function (event, data) {
        $coi.html.data.loadFile.file.parent().removeClass('animated bounce');
    },
    startedReadFile: function (event, data) {
        var html = $coi.html;

        html.components.loadFile.buttonUpload.addClass('hidden');
        html.components.loadFile.loading.removeClass('hidden');
    },
    trashFile: function () {
        var html = $coi.html;

        html.components.loadFile.buttonUpload.removeClass('hidden');
        html.components.loadFile.loading.addClass('hidden');
        html.components.loadFile.loading.text('10%');
        html.components.loadFile.trash.addClass('hidden');
        html.components.loadFile.trash.parent().find('label').text('');
        html.data.loadFile.file.parent().draganddrop('reset');
        html.components.loadFile.buttonContinue.jAnimateOnce('fadeOutDown', function () {
            html.components.loadFile.buttonContinue.addClass('hidden');
        });
        html.components.loadFile.message.addClass('hidden');
        html.data.loadFile.base64 = null;
    },
    sendFile: function () {
        var html = $coi.html;

        html.components.loadingFile.message.html('');
        html.components.loadingFile.message.addClass('hidden');
        if (html.data.loadFile.base64 == null) {
            if ($.trim(html.components.loadFile.message.html()) == "") html.components.loadFile.message.html('<div class="alert alert-danger" role="alert"><button type= "button" class="close" data- dismiss="alert" aria- label="Close"><span aria-hidden="true">&times; </span></button ><strong>Error</strong> Selecciona tu archivo</div >');
            html.components.loadFile.message.removeClass('hidden');
            html.components.loadFile.message.jAnimateOnce('fadeInUp');
        } else {
            html.components.loadFile.container.addClass('hidden');
            html.components.loadingFile.container.removeClass('hidden');
            html.components.loadFile.container.jAnimateOnce('fadeOutRight');
            html.components.loadingFile.container.jAnimateOnce('fadeInLeft');
            html.components.loadingFile.loading.find('.status-text').text('Cargando archivo ' + (html.data.loadFile.name.length <= 22 ? html.data.loadFile.name : html.data.loadFile.name.substring(0, 18) + '...'));
            //send data 
            var _data = html.data;
            var url = ''

            html.data.xhrUpload = $.ajax({
                dataType: 'json',
                type: 'POST',
                url: 'http://localhost:22222/api/ExtractionInformation/PostInformation',//'http://192.168.15.102/Middleware/api/ExtractionInformation/PostInformation'
                data: {
                    _paramCompany: _data.companyId,
                    _paramUser: _data.userId,
                    _paramRFCCompany: _data.init.textRFC,
                    _paramFileBase64: _data.loadFile.base64//,
                    //_paramTypeSystem: _data.systemMigration
                },
                success: $coi.successUploaded,
                error: $coi.erroUploaded,
                xhr: function () {
                    // get the native XmlHttpRequest object
                    var xhr = $.ajaxSettings.xhr();
                    // set the onprogress event handler
                    xhr.upload.onprogress = function (evt) {
                        html.components.loadingFile.loading.find('.progress-bar').css('width', Math.floor(evt.loaded / evt.total * 100) + '%');
                    };
                    // set the onload event handler
                    xhr.upload.onload = function () {
                        html.components.loadingFile.loading.find('.progress-bar').css('width', '100%')
                        ProgressMigrationShow();
                    };
                    // return the customized object
                    return xhr;
                }
                //xhrFields: {
                //    onprogress: function (progress) {
                //        var percentage = Math.floor((progress.total / progress.loaded) * 100);
                //        html.components.loadingFile.loading.find('.progress-bar').css('width', Math.floor((100 * progress.loaded) / progress.total) + '%');
                //        if (percentage === 100) html.components.loadingFile.loading.find('.progress-bar').css('width', '100%');
                //    }
                //},

            });
            //saveTextAsFile(_data.loadFile.base64);
        }
    },
    backStart: function () {
        var html = $coi.html.components;

        html.loadFile.container.addClass('hidden');
        html.init.container.removeClass('hidden');
        html.init.container.jAnimateOnce('fadeInRight');
        html.loadFile.container.jAnimateOnce('fadeOutLeft');
        html.loadFile.buttonContinue.addClass('hidden animated fadeOutDown');
        $coi.trashFile();
    },
    cancelUploadFile: function () {
        var html = $coi.html.components;

        html.loadingFile.container.addClass('hidden');
        html.loadFile.container.removeClass('hidden');
        html.loadFile.container.jAnimateOnce('fadeInRight');
        html.loadingFile.container.jAnimateOnce('fadeOutLeft');
        html.loadingFile.loading.find('.progress-bar').css('width', '0%');
        if ($coi.html.data.xhrUpload && $coi.html.data.xhrUpload.readyState != 4) $coi.html.data.xhrUpload.abort();
    },
    successUploaded: function (data) {
        var html = $coi.html.components;

        html.loadingFile.container.addClass('hidden');
        html.migrating.container.removeClass('hidden');
        html.loadingFile.container.jAnimateOnce('fadeOutRight');
        html.migrating.container.jAnimateOnce('fadeInLeft');
    },
    erroUploaded: function (xhr, testStatus, errorMessage) { //pending Message
        var html = $coi.html.components;
        html.loadingFile.message.removeClass('hidden');
        html.loadingFile.message.html('<div class="alert alert-danger padding10" role="alert"><button type= "button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times; </span></button ><strong>Error</strong> ocurrio un error al intentar subir el archivo</div>');
        html.loadFile.message.find('.close').bind('click', function () {
            html.loadingFile.message.addClass('hidden');
            html.loadingFile.message.html('');
        });
        html.loadingFile.message.jAnimateOnce('fadeInUp');
    },
    statusMigration: function (progress, data) {
        var html = $coi.html.components.migrating;
        var TypeProgress = "";
        switch (progress.catalog) {
            case 'general':
                $("#MessageGeneral").html("<strong id=\"EstimatedTime\" class=\"text-coi\">" + progress.element + "</strong>");
                break;
            case 'extractionjson':
                TypeProgress = "extractionjson";
                break;
            case 'account':
                TypeProgress = "account";
                break;
            case 'period':
                TypeProgress = "period";
                break;
            case 'policy':
                TypeProgress = "policy";
                break;
            case 'additional':
                TypeProgress = "additional";
                break;
            case 'message-dialog':
                $coi.messageDialog(progress);
                break;
        }
        if (TypeProgress != "") {
            $(".glyphicon").addClass("hidden");
            $("#glyph-" + TypeProgress).removeClass("hidden");
            $("#progress-bar-" + TypeProgress).width(progress.data.percentage + "%");;
            $("#progress-span-" + TypeProgress).html(progress.data.item + " / " + progress.data.total_item + ": " + (TypeProgress == "extractionjson" ? "Recuperando información del archivo" : TypeProgress == "account" ? "Cuentas migradas" : TypeProgress == "period" ? "Periodos migrados" : TypeProgress == "policy" ? "Pólizas migradas" : progress.data.percentage + "%"));
            if (progress.element.length > 70)
                $("#title-progress-" + TypeProgress).html((progress.element).substring(0, 70) + "...");
            else
                $("#title-progress-" + TypeProgress).html(progress.element);
            if (progress.data.percentage == 100) {
                $("#progress-span-" + TypeProgress).css({ 'color': '#FFFFFF' });
                $("#progress-bar-" + TypeProgress).css({ 'background-color': '#72d672' });
                $("#title-progress-" + TypeProgress).html(("Proceso completo."));
            }
            else {
                $("#progress-span-" + TypeProgress).css({ 'color': '#79A4D8' });
                $("#progress-bar-" + TypeProgress).css({ 'background-color': '#45C8DC' });
            }
        }
    },
    resetMigration: function () {
        var html = $coi.html.components.migrating;

        html.loadingAccounts.find('i').removeClass('hidden');
        html.loadingAccounts.find('.loading').addClass('text-center blue-color');
        html.loadingAccounts.find('.loading').removeClass('white-color blue-bg-correct text-left');
        html.loadingAccounts.find('.loading').text('migrando cuentas');
        html.loadingPeriods.find('i').addClass('hidden');
        html.loadingPeriods.find('.loading').addClass('text-center blue-color');
        html.loadingPeriods.find('.loading').removeClass('white-color blue-bg-correct text-left');
        html.loadingPeriods.find('.loading').text('Periodos');
        html.loadingPeriods.find('.col-md-11').text('En espera');
        html.loadingPoliza.find('i').addClass('hidden');
        html.loadingPoliza.find('.loading').addClass('text-center blue-color');
        html.loadingPoliza.find('.loading').removeClass('white-color blue-bg-correct text-left');
        html.loadingPoliza.find('.loading').text('Pólizas');
        html.loadingPoliza.find('.col-md-11').text('En espera');
        html.loadingAdditional.find('i').addClass('hidden');
        html.loadingAdditional.find('.loading').addClass('text-center blue-color');
        html.loadingAdditional.find('.loading').removeClass('white-color blue-bg-correct text-left');
        html.loadingAdditional.find('.loading').text('Datos adicionales');
        html.loadingAdditional.find('.col-md-11').text('En espera');
    },
    cancelMigration: function () {
        var data = $coi.html.data;
        $coi.reset();
        $coi.resetMigration();
        if (data.xhrMigration && data.xhrMigration.readyState != 4) data.xhrMigration.abort();
    },
    reset: function () {
        var html = $coi.html;

        $coi.trashFile();
        html.components.init.container.removeClass('hidden animated fadeOutRight');
        html.data.init.rfc.val('').focus();
        html.data.init.textRFC = null;
        html.data.init.businessName.val('');
        html.data.init.country.val('Afganistán').trigger('change');
        html.components.loadFile.container.removeClass('animated fadeOutRight');
        html.components.loadFile.container.addClass('hidden');
        html.data.loadFile.base64 = null;
        html.data.loadFile.name = null;
        html.components.loadingFile.container.removeClass('animated fadeOutRight');
        html.components.loadingFile.container.addClass('hidden');
        html.components.migrating.container.removeClass('animated fadeOutRight');
        html.components.migrating.container.addClass('hidden');
        html.components.loadingFile.loading.find('.progress-bar').css('width', '0%');

    },
    //acceptAnswer: function () {
    //    socket.emit('answer', { key: data.key, status: 200, detail: 'Ok', companyId: $coi.html.data.companyId, ask: data.ask, answer: $coi.html.data.response });
    //    $coi.html.data.responsePending = false;
    //    $coi.html.data.response = null;
    //},
    workerLoop: function (data) {
        setTimeout(function () {
            if ($coi.html.data.responsePending && $coi.html.data.response == null)
                $(".container-notification").Modal('hide');
            socket.emit('answer', { key: data.key, status: 408, detail: 'Request Timeout', companyId: $coi.html.data.companyId, ask: null, answer: null, });
            $coi.html.data.responsePending = false;
        }, 280000);//300000
    },
    messageDialog: function (data) {
        if ($(".container-notification").is(":visible"))
            $(".container-notification").Modal('hide');
        var title = "";
        var modal = "";
        if (data.element == "Success") {
            title = "<div class=\"title-notification-finally-success\">¡ Información migrada exitosamente!</div>";
            modal = ".success";
            $("#p-accounts").html(data.data.totalaccount);
            $("#p-periods").html(data.data.totalperiods);
            $("#p-policies").html(data.data.totalpolicies);
            $("#p-costumers").html(data.data.totalcostumers);
            $("#p-suppliers").html(data.data.totalsupplier);
        } else {
            title = "<div class=\"title-notification-finally-failure\">¡ El proceso de migración no se completo!</div>";
            modal = ".failure";
            $(".message-finally-errors").html(data.data.error);
        }
        $(modal).Modal({
            title: title, simpleModal: false, width: 500, height: (modal == ".success" ? 345 : 295), keyEsc: false, btnclose: false
        });
        $(modal).Modal('show');
        $('body').on("click", "[id^='btn_Finally_']", function (evt) {
            evt.preventDefault();
            var id = $(this).attr("id");
            id = id.replace("btn_Finally_", "");
            if (id == "S")
                $coi.ReloadPageAccounting();
            else
                window.location.reload();
        });
    },
    ShowWizard: function (data) {
        window.parent.postMessage({ NotificationIframe: 'ShowWizard' }, 'http://localhost/');
    },
    ReloadPageAccounting: function () {
        window.parent.postMessage({ NotificationIframe: 'GoToHomeAccountig' }, 'http://localhost/');
    }

}
//=============================================================================================================
socket = io.connect('http://' + location.host, { transports: ['websocket', 'polling', 'flashsocket'] });
socket.on('connected', function (data) { //user connected
    if ($coi.html.data.companyId == null) return;
    console.log($coi.html.data.companyId);
    socket.emit('suscription', { companyId: $coi.html.data.companyId });
});
socket.on('disconneted', function (msg) { });
socket.on('ask', function (data) { //ask
    var answer = "";
    $coi.html.data.responsePending = true;
    $coi.workerLoop(data);
    ModelNotification(data);
    $("#btn_AcceptAnswer").off().on("click", function () {
        if (!$(".select-list-multiple-option").hasClass("hidden")) {
            if ($("#cmb_List option:selected").val() != "0") {
                answer = $("#cmb_List option:selected").val();
            }
            else
                $("#cmb_List").focus();
        }
        else {
            if (!$(".textbox-response").hasClass("hidden")) {
                if ($.trim($("#txt_answer").val()) != "" && fn_ValidationText() == true) {
                    answer = $("#txt_answer").val();
                }
                else {
                    $("#txt_answer").focus();
                }
            }
        }
        if (answer != "") {
            socket.emit('answer', { key: data.key, status: 200, detail: 'Ok', companyId: $coi.html.data.companyId, ask: data.ask, answer: answer, response_repeat: ($("#chk_response_repeat").is(':checked') == true ? "1" : "0") });
            $coi.html.data.responsePending = false;
            $coi.html.data.response = null;
            $(".container-notification").Modal('hide');
        }
    });
    $('body').on("click", "[id^='option_']", function (evt) {
        evt.preventDefault();
        var id = $(this).attr("id");
        id = id.replace("option_", "");
        answer = $("#option-value" + id).val();

        if (answer != "") {
            socket.emit('answer', { key: data.key, status: 200, detail: 'Ok', companyId: $coi.html.data.companyId, ask: data.ask, answer: answer, response_repeat: ($("#chk_response_repeat").is(':checked') == true ? "1" : "0") });
            $coi.html.data.responsePending = false;
            $coi.html.data.response = null;
            $(".container-notification").Modal('hide');
        }
    });
    $("#btn_CancelAnswer").off().on("click", function () {
        socket.emit('answer', { key: data.key, status: 408, detail: 'cancelprocess', companyId: $coi.html.data.companyId, ask: null, answer: null, });
        $coi.html.data.responsePending = false;
        $coi.html.data.response = null;
        $(".container-notification").Modal('hide');
    });
});
socket.on('progressMigration', function (data) {
    console.log(data);
    $coi.statusMigration(data.progress, null);
});
//=============================================================================================================



function saveTextAsFile(textToWrite) {
    // grab the content of the form field and place it into a variable
    //var textToWrite = document.getElementById("inputTextToSave").value;
    //var textToWrite2 = document.getElementById("inputTextToSave2").value;
    //  create a new Blob (html5 magic) that conatins the data from your form feild
    var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
    // Specify the name of the file to be saved
    var fileNameToSaveAs = "myNewFile.txt";

    // Optionally allow the user to choose a file name by providing 
    // an imput field in the HTML and using the collected data here
    // var fileNameToSaveAs = txtFileName.text;

    // create a link for our script to 'click'
    var downloadLink = document.createElement("a");
    //  supply the name of the file (from the var above).
    // you could create the name here but using a var
    // allows more flexability later.
    downloadLink.download = fileNameToSaveAs;
    // provide text for the link. This will be hidden so you
    // can actually use anything you want.
    downloadLink.innerHTML = "My Hidden Link";

    // allow our code to work in webkit & Gecko based browsers
    // without the need for a if / else block.
    window.URL = window.URL || window.webkitURL;

    // Create the link Object.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    // when link is clicked call a function to remove it from
    // the DOM in case user wants to save a second file.
    downloadLink.onclick = destroyClickedElement;
    // make sure the link is hidden.
    downloadLink.style.display = "none";
    // add the link to the DOM
    document.body.appendChild(downloadLink);

    // click the new link
    downloadLink.click();
}

function destroyClickedElement(event) {
    // remove the link from the DOM
    document.body.removeChild(event.target);
}

function ProgressMigrationShow(evt) {
    setTimeout(function () {
        $("#div_UploadFile").addClass("hidden");
        $("#div_ProgressMigration").removeClass("hidden");
    }, 1100);

}
function ModelNotification(data) {
    $("#paragraph1").html(data.ask);
    $(".type-notification").addClass("hidden");
    switch (data.typecontrol) {
        case "box-option":
            $(".box-multiple-option").removeClass("hidden");
            $(".action-response").addClass("hidden");
            fn_FillBoxOption(data.options);
            break;
        case "select-option":
            $("#title-select").html(data.title)
            $("#cmb_List").html("<option value=\"0\" selected>Selecione una opción</option>" + fn_FillSelect(data.options, 0));
            $("#cmb_List").focus();
            $(".select-list-multiple-option").removeClass("hidden");
            $(".action-response").removeClass("hidden");
            break;
        case "text-option":
            $("#title-textbox").html(data.title)
            $(".textbox-response").removeClass("hidden");
            $("#txt_answer").focus();
            $(".action-response").removeClass("hidden");
            $("#txt_answer").attr('maxlength', (($.contains($("#title-textbox").val(), "Nombre para la cuenta") == true ? "200" : "50")));
            break;
    }
    $(".container-notification").Modal({
        title: "<div class=\"title-notification\">¡ Encontramos un problema !</div>", simpleModal: false, width: 400, height: (data.typecontrol == "select-option" ? 255 : 210), keyEsc: false, btnclose: false
    });
    $(".container-notification").Modal('show');
}
function fn_FillSelect(lst_Element, Level) {
    var Options = "";
    var Level = Level + 1;
    $.each(lst_Element, function (index, element) {
        if (element.children == null && Level == 1) {
            Options += "<option value=\"" + element.value + "\">" + element.text + "</option>";
        }
        else {
            if (element.children.length > 0 || Level == 1) {
                Options += "<optgroup label=\"" + element.text + "\">";
                if (element.children.length > 0)
                    Options += fn_FillSelect(element.children, Level);
                else
                    Options += fn_FillSelect(new Array(element), Level);
                Options += "</optgroup>";
            } else {
                Options += "<option value=\"" + element.value + "\">" + element.text + "</option>";
            }
        }
    });
    return Options;
}
function fn_FillBoxOption(lst_Element) {
    $.each(lst_Element, function (index, element) {
        $("#option-value" + (index + 1)).val(element.value);
        $("#option_" + (index + 1)).html(element.text);
    });
}
function fn_ValidationText() {
    $(".message-validation").addClass("hidden");
    if ($.contains($("#title-textbox").val(), "Numero de cuenta")) {
        if ($.trim($("#txt_answer").val()).length > 50) {
            $("#message-error").html("La numero identificador de la cuenta no puede ser mayor a 50 caracteres.");
            $(".message-validation").removeClass("hidden");
            return false;
        } else if (isNaN($("#txt_answer").val())) {
            $("#message-error").html("Error de formato en \"Número\".");
            $(".message-validation").removeClass("hidden");
            return false;
        }
    } else if ($.contains($("#title-textbox").val(), "Nombre para la cuenta")) {
        if ($.trim($("#txt_answer").val()).length > 200) {
            $("#message-error").html("El nombre de la cuenta no puede ser mayor a 200 caracteres.");
            $(".message-validation").removeClass("hidden");
            return false;
        }
    }
    return true;
}
