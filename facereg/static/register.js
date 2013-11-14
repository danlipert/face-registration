var canvas, cxt, data, image;
var counter = 2;

window.onload = function() {
	canvas = document.getElementById("canvas");
	canvas.addEventListener('click', handle_click);
	cxt = canvas.getContext('2d');
	get_image();
	get_data();
}

function get_image() {
	image = new Image();
	image.onload = function(e) {
		counter--;
		if (counter == 0)
			redraw();
	}
	image.src = image_uri;
}

function get_data() {
	var req = new XMLHttpRequest();
	req.open('GET', data_uri, false);
	req.onload = function(e) {
		if (req.readyState !== 4)
			return;
		if (req.status === 200) {
			data = JSON.parse(req.response);
			counter--;
			if (counter == 0)
				redraw();
		} else {
			console.log("Error!");
		}
	}
	req.send(null);
}

// Matrix math, using 3x2 matrices and homogeneous coordinates.
// A point (x,y) is represented by the column vector [x,y,1].

// Identity matrix
function mat_identity() {
	return [1, 0, 0,
			0, 1, 0];
}

// Rotation matrix
function mat_rotate(a) {
	var u = Math.cos(a), v = Math.sin(a);
	return [u, -v, 0,
			v, u, 0];
}

// Translation matrix
function mat_translate(dx, dy) {
	return [1, 0, dx,
			0, 1, dy];
}

// Scale matrix
function mat_scale(x, y) {
	return [x, 0, 0,
			0, y, 0];
}

// Matrix multiply
function mat_multiply(x, y) {
	var x11 = x[0], x12 = x[1], x13 = x[2], x21 = x[3], x22 = x[4], x23 = x[5];
	var y11 = y[0], y12 = y[1], y13 = y[2], y21 = y[3], y22 = y[4], y23 = y[5];
	return [x11*y11 + x12*y21, x11*y12 + x12*y22, x11*y13 + x12*y23 + x13,
			x21*y11 + x22*y21, x21*y12 + x22*y22, x21*y13 + x22*y23 + x23];
}

// Matrix multiply by vector
function mat_vector(m, v) {
	var m11 = m[0], m12 = m[1], m13 = m[2], m21 = m[3], m22 = m[4], m23 = m[5];
	var v11 = v[0], v21 = v[1];
	return [m11*v11 + m12*v21 + m13,
			m21*v11 + m22*v21 + m23];
}

function Transformation() {
	this.forward = mat_identity();
	this.inverse = mat_identity();
}

Transformation.prototype._apply_matrix = function(mat, inv) {
	this.forward = mat_multiply(this.forward, mat);
	this.inverse = mat_multiply(inv, this.inverse);
};

Transformation.prototype.translate = function(dx, dy) {
	this._apply_matrix(mat_translate(dx, dy), mat_translate(-dx, -dy));
}

Transformation.prototype.rotate = function(a) {
	this._apply_matrix(mat_rotate(a), mat_rotate(-a));
}

Transformation.prototype.scale = function(x, y) {
	this._apply_matrix(mat_scale(x, y), mat_scale(1/x, 1/y));
}

// Transform the image so it is centered and resized correctly.
function transform(obj) {
	var cwidth = canvas.width;
	var cheight = canvas.height;
	var iwidth = image.width;
	var iheight = image.height;
	var swapxy = false;

	obj.translate(cwidth/2, cheight/2);
	switch (data.orientation) {
	case 1:
		obj.rotate(Math.PI);
		break;
	case 3:
		break;
	case 6:
		obj.rotate(Math.PI * 0.5);
		swapxy = true;
		break;
	case 8:
		obj.rotate(Math.PI * +0.5);
		swapxy = true;
		break;
	}
	var scalex, scaley;
	if (swapxy) {
		scalex = cwidth / iheight;
		scaley = cheight / iwidth;
	} else {
		scalex = cwidth / iwidth;
		scaley = cheight / iheight;
	}
	var scale = Math.min(scalex, scaley);
	obj.scale(scale, scale);
	obj.translate(-iwidth/2, -iheight/2);
}

function redraw() {
	cxt.fillStyle = "rgb(40, 40, 40)";
	cxt.fillRect(0, 0, canvas.width, canvas.height);
	cxt.save();
	transform(cxt);
	cxt.drawImage(image, 0, 0);
	cxt.restore();
}

function handle_click(event) {
	var x = event.pageX - canvas.offsetLeft;
	var y = event.pageY - canvas.offsetTop;
	var t = new Transformation();
	transform(t);
	var v = mat_vector(t.inverse, [x, y]);
	console.log(v[0], v[1]);
}
