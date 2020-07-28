const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var dataP = null;

// Create circle
const circle = new Path2D();
circle.arc(150, 75, 50, 0, 0.8 * Math.PI);
circle.lineTo(150, 75);
circle.closePath();
//ctx.fillStyle = "red";
ctx.stroke(circle);
const crc2 = new Path2D();
crc2.arc(350, 75, 50, 0, 0.8 * Math.PI);
crc2.lineTo(350, 75);
crc2.closePath();
//ctx.fillStyle = "red";
ctx.stroke(crc2);

var arr = [
	{obj: circle, str: "first"},
	{obj: crc2, str: "second"},
];

// Listen for mouse moves
canvas.addEventListener("mousemove", function (event) {
	// Check whether point is inside circle
	for (var i = 0; i < 2; i++) {
		if (ctx.isPointInPath(arr[i].obj, event.offsetX, event.offsetY)) {
			console.log("true    +    " + arr[i].str);
		} else {
			console.log("false");
		}
	}
});
