
var canvas = document.getElementById('cv');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
var context = canvas.getContext('2d');
var focallength = 250;
var list = [
    {
        "info" : "I",
        "type" : "string"
    },
    {
        "info" : "love.png",
        "type" : "image"
    },
    {
        "info" : "U",
        "type" : "string"
    },
    {
        "info" : "杜晨",
        "type" : "string"
    }
];

window.onresize = function() {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}

var Dot = function (centerX, centerY, centerZ, radius, color) {
    this.dx = centerX; //保存原位置
    this.dy = centerY;
    this.dz = centerZ;
    this.tx = 0;       //保存粒子聚合又飞散开的位置
    this.ty = 0;
    this.tz = 0;
    this.z = centerZ;
    this.x = centerX;
    this.y = centerY;
    this.radius = radius;
    this.color = color;
}
Dot.prototype.paint = function () {
    context.save();
    context.beginPath();
    var scale = focallength/(focallength - this.z);
    context.arc(canvas.width / 2 + (this.x - canvas.width / 2) * scale, canvas.height / 2 + (this.y - canvas.height / 2) * scale, this.radius * scale, 0, 2 * Math.PI);
    context.fillStyle = 'rgba('+this.color.r+','+this.color.g+','+this.color.b+',' + scale + ')';
    context.fill();
    context.restore();
}

var dots = getImgData();
var pause = false;
var lastTime;
var derection = true;

var img = new Image();
var curIndex = 0;

var RAF = (function() {
    return window.requestAnimationFrame|| function(callback) {
        return window.setTimeout(callback,1000/60);
    }
})();

function scroll() {
    context.clearRect(0,0,canvas.width,canvas.height);
    if(list[curIndex]) {
        if(list[curIndex].type == 'string') {
            drawText(list[curIndex].info);
            dots = getImgData();
            initAnimate();
        }else if(list[curIndex].type == 'image') {
            drawImage(list[curIndex].info,function() {
               dots = getImgData(); 
               initAnimate();
            });
        }
    }
    curIndex<(list.length-1)? curIndex++: curIndex = 0;
}
scroll();

function initAnimate() {
    dots.forEach(function (item) {
        item.x = Math.random() * canvas.width;
        item.y = Math.random() * canvas.height;
        item.z = Math.random() * focallength * 2 - focallength;

        item.tx = Math.random() * canvas.width;
        item.ty = Math.random() * canvas.height;
        item.tz = Math.random() * focallength * 2 - focallength;
        item.paint();
    });

    animate();
}

function animate() {
    var t = +new Date();
    context.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(function (item) {
        if (derection) {
            if (Math.abs(item.dx - item.x) < 0.1 && Math.abs(item.dy - item.y) < 0.1 && Math.abs(item.dz - item.z) < 0.1) {
                item.x = item.dx;
                item.y = item.dy;
                item.z = item.dz;
                if (t - lastTime > 300) derection = false;
            } else {
                item.x = (item.dx - item.x) * 0.1 + item.x;
                item.y = (item.dy - item.y) * 0.1 + item.y;
                item.z = (item.dz - item.z) * 0.1 + item.z;
                lastTime = +new Date();
            }
        } else {
            if (Math.abs(item.tx - item.x) < 0.1 && Math.abs(item.ty - item.y) < 0.1 && Math.abs(item.tz - item.z) < 0.1) {
                item.x = item.tx;
                item.y = item.ty;
                item.z = item.tz;
                pause = true;
            } else {
                item.x = (item.tx - item.x) * 0.1 + item.x;
                item.y = (item.ty - item.y) * 0.1 + item.y;
                item.z = (item.tz - item.z) * 0.1 + item.z;
                pause = false;
            }
        }
        item.paint();
    });
    if (!pause) {
        // RAF(animate);
        requestAnimationFrame(animate);
    }else {
        context.clearRect(0,0,canvas.width,canvas.height);
        derection = true;
        pause = false;
        scroll();
    }
}

function getImgData() {
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    var arr = [];
    for (var x = 0; x < imgData.width; x += 6) {
        for (var y = 0; y < imgData.height; y += 6) {
            var i = (y * imgData.width + x) * 4;
            if (imgData.data[i + 3] >= 128) {
                var dot = new Dot(x - 3, y - 3, 0, 3, {
                    r:imgData.data[i],
                    g:imgData.data[i+1],
                    b:imgData.data[i+2]
                });
                arr.push(dot);
            }
        }
    }
    return arr;
}

function drawImage(src,cb) {
    img.src = src;
    img.onload = function() {
        context.drawImage(img,canvas.width/2 - img.width/2, canvas.height/2 - img.height/2);
        if(cb) cb();
    }
}

function drawText(text) {
    context.save();
    context.font = "150px microsoftyahei bold";
    var r = parseInt(Math.random()*125+130);
    var g = parseInt(Math.random()*125+130);
    var b = parseInt(Math.random()*125+130);
    context.fillStyle = 'rgba('+r+','+g+','+b+',1)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    context.restore();
}