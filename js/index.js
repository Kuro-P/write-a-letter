var canvasWidth = Math.min(600,$(window).width()-20);
var canvasHeight = canvasWidth;
$(".controller").width(canvasWidth);
//或者只改动css:controller {width: 100%; max-width: 800px;}

var isMouseDown = false;
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
var bbox = canvas.getBoundingClientRect();

var lastloc = {x:0,y:0};
var curloc = {x:0,y:0};
var curTimeStamp = 0;
var lastTimeStamp = 0;
var curWidth = 30;
var lastWidth = 30;

var lineColor = "black";

drawGrid();

/*开始绘制*/
function beginStroke(point){
	isMouseDown = true;
	lastTimeStamp = new Date().getTime();
	lastloc = windowToCanvas(point.x,point.y);
}

/*结束绘制*/
function endStroke(){
	isMouseDown = false;
}

/*绘制中*/
function moveStroke(point){
	if(isMouseDown){
		curloc = windowToCanvas(point.x,point.y);
		context.beginPath();
		context.moveTo(lastloc.x,lastloc.y);
		context.lineTo(curloc.x,curloc.y);
		context.strokeStyle = lineColor;
		context.lineWidth = curWidth;
		context.lineCap = "round"; //解决组线条锯齿问题
		context.lineJoin = "round"; //使线条看起来更平滑
		context.stroke();

		curTimeStamp = new Date().getTime();
		var timediffer = curTimeStamp - lastTimeStamp;
		var distance = calcuDistance(lastloc,curloc);
		//var lineWidth = calcuLineWidth(distance,timediffer);
		calcuLineWidth(distance,timediffer);
		lastloc = {x:curloc.x,y:curloc.y};
		lastTimeStamp = curTimeStamp;
	}	
}

canvas.onmousedown = function(e){
	beginStroke( { x:e.clientX , y:e.clientY } );
	e.preventDefault(); //阻止默认事件，防止浏览器滚动
};
canvas.onmouseup = function(e){
	endStroke();
	e.preventDefault();
};
canvas.onmouseout = function(e){
	endStroke();
	e.preventDefault();
};
canvas.onmousemove = function(e){
	moveStroke( { x:e.clientX , y:e.clientY } );
	e.preventDefault();
};
canvas.addEventListener("touchstart",function(e){
	e.preventDefault();
	var touch = e.touches[0];
	beginStroke( { x:touch.pageX , y:touch.pageY } );
});
canvas.addEventListener("touchend",function(e){
	e.preventDefault();
	endStroke();
});
canvas.addEventListener("touchmove",function(e){
	e.preventDefault();
	var touch = e.touches[0];
	moveStroke( { x:touch.pageX , y:touch.pageY } );
});
$(".clear").click(function(){
	context.clearRect(0,0,canvas.width,canvas.height);
	drawGrid();
});

$(".color_btn").click(function(){
	$(this).addClass("color_btn_selected").siblings().removeClass("color_btn_selected");
	lineColor = $(this).css("background-color");
});

/*计算笔画粗细*/
function calcuLineWidth(s,t){
	var speed = parseInt(s)/parseInt(t);
	//lineWidth最大值为30，最小值为1
	if(speed<=0.1){
		curWidth = 30;
	}else if(speed>=10){
		curWidth = 1+1/6*lastWidth;
	}else{
		curWidth = 2/3*(30 - speed*(30-1)/(10-0.1))+1/3*(lastWidth);
	}
	lastWidth = curWidth;
}

function calcuDistance(last,cur){
	return Math.sqrt((last.x-cur.x)*(last.x-cur.x)+(last.y-cur.y)*(last.y-cur.y));
} 

/*绘制米字格函数*/
function drawGrid(){

	context.save(); //将以下区域操作限定，防止影响其他区域操作

	context.beginPath();
	context.strokeStyle = "rgba(225,0,0,.7)";
	context.moveTo(0,0);
	context.lineTo(canvasWidth,0);
	context.lineTo(canvasWidth,canvasHeight);
	context.lineTo(0,canvasHeight);
	context.closePath();
	
	context.lineWidth = 6;
	context.stroke();
	
	context.beginPath();
	context.strokeStyle = "rgba(225,0,0,.5)";
	context.moveTo(0,0);
	context.lineTo(canvasWidth,canvasHeight);
	
	context.moveTo(0,canvasWidth);
	context.lineTo(canvasHeight,0);
	
	context.moveTo(canvasWidth/2,0);
	context.lineTo(canvasWidth/2,canvasHeight);
	
	context.moveTo(0,canvasHeight/2);
	context.lineTo(canvasWidth,canvasHeight/2);
	
	context.setLineDash([70,10]);
	context.lineWidth = 3;
	context.stroke();

	context.restore(); //与context.save()呼应
}

/*转换坐标系函数*/
function windowToCanvas(mx,my){
	return {x : Math.round(mx-bbox.left) , y : Math.round(my-bbox.top+$("body").scrollTop())}; 
	//用ele.getBoundingClientRect();获取的是浮点数，故用Math.round()转化
}

