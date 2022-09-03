var $ = null;
var imageFiles = null, images = [], canvasIndex = 0, randomLongitudes = [], randomLatitudes = [];

var datetimeFormat = 'yyyy/MM/dd HH:mm:ss';
var previewWidth = 480
var fontSize = 84, lineHeight = 56 * 2, paddingLeft = 36 * 2, paddingTop = 48 * 2, shadowOffset = 8, referenceImageWidth = 3072;

var refreshCanvas = function () {
    if (imageFiles) {
        clearGallery();
        drawCanvasSequentially();
    }
}

var clearGallery = function () {
    canvasIndex = 0;
    $('#gallery').html('');
    $('#galleryPreview').html('');
}

var drawCanvasSequentially = function () {
    if (imageFiles && canvasIndex < imageFiles.length) {
        var image = images[canvasIndex];
        if (image) {
            drawCanvas(image);
        } else {
            var file = imageFiles[canvasIndex];
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.fileName = file.name;
            fileReader.addEventListener('loadend', function (e1) {
                var image = document.createElement('img');
                image.id = this.fileName;
                image.src = e1.target.result;
                image.onload = function (e2) {
                    images.push(this);
                    drawCanvas(this);
                }
            });
        }
    }
}

var drawCanvas = function (image) {
    var canvas = document.createElement('canvas');
    canvas.id = image.id;
    canvas.fontZoom = image.width / referenceImageWidth;
    canvas.imageZoom = 1;

    drawWatermark(canvas, image);
    $(canvas).appendTo('#gallery');

    // preview
    var canvasPreview = document.createElement('canvas');
    canvasPreview.fontZoom = previewWidth / referenceImageWidth;
    canvasPreview.imageZoom = previewWidth / image.width;

    drawWatermark(canvasPreview, image);
    $(canvasPreview).appendTo('#galleryPreview');

    // draw next
    canvasIndex++;
    drawCanvasSequentially();
}

var drawWatermark = function (canvas, image) {
    drawImage(canvas, image);
    drawText(canvas);
}


var drawImage = function (canvas, image) {
    canvas.width = image.width * canvas.imageZoom;
    canvas.height = image.height * canvas.imageZoom;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

var drawText = function (canvas) {
    var context = canvas.getContext('2d');

    context.font = (Math.ceil(fontSize * canvas.fontZoom)) + 'px Helvetica';
    context.shadowOffsetX = Math.ceil(shadowOffset * canvas.fontZoom);
    context.shadowBlur = 2;
    context.shadowColor = 'rgb(0, 0, 0, 0.5)';
    context.fillStyle = 'rgb(237, 240, 245)';
    context.textBaseline = 'top';

    var personalCode = $('#personalCode').val();
    var siteName = $('#siteName').val();
    var longitude = $('#longitude').val() ? $('#longitude').val() + randomLongitudes[canvasIndex] : '';
    var latitude = $('#latitude').val() ? $('#latitude').val() + randomLatitudes[canvasIndex] : '';
    var datetime = $('#datetime').val();
    var lines = [personalCode, siteName, (longitude || latitude ? longitude + ' ' + latitude : ''), datetime]
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line) {
            continue;
        }
        var x = paddingLeft * canvas.fontZoom;
        var y = (paddingTop + lineHeight * i) * canvas.fontZoom;
        context.fillText(line, x, y);
    }
}

var randomNumber = function () {
    var number;
    do {
        number = Math.ceil(Math.random() * 999);
    } while (number % 10 == 0)
    var val = '000' + number;
    return val.substring(val.length - 3, val.length);
}

var download = function () {
    if (!imageFiles) {
        return;
    }

    $('#gallery canvas').each(function () {
        var canvas = this;
        var image = canvas.toDataURL("image/png")
        var saveLink = document.createElement('a');
        saveLink.href = image;
        saveLink.download = getDownloadFileName(canvas.id);
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, false);
        saveLink.dispatchEvent(clickEvent);
    });
}

var getDownloadFileName = function (originalFileName) {
    var index = originalFileName.lastIndexOf('.');
    if (index > 0) {
        return originalFileName.substring(0, index) + '-watermark' + originalFileName.substring(index);
    } else {
        return originalFileName + '-watermark';
    }
}

layui.use(['laydate'], function () {
    $ = layui.jquery;
    var upload = layui.upload, laydate = layui.laydate;
    // Listen on input value change
    $('input[type=text]').on('input', function () {
        refreshCanvas();
    });

    $('#upload').on('click', function () {
        document.getElementById("imageDirectory").click();
    });

    // Upload image
    $('#imageDirectory').change(function (e) {
        imageFiles = e.currentTarget.files;
        randomLongitudes = [];
        randomLatitudes = [];
        for (var i = 0; i < imageFiles.length; i++) {
            randomLongitudes.push(randomNumber());
            randomLatitudes.push(randomNumber());
        }
        images = [];
        refreshCanvas();
    });

    $('#download').on('click', function () {
        download();
    });

    laydate.render({
        elem: '#datetime'
        , type: 'datetime'
        , value: (new Date()).format(datetimeFormat)
        , format: datetimeFormat
        , done: function (value, date) {
            refreshCanvas();
        }
    });
});

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}