var Chart = function (input) {
	function setupCanvas(canvas) {
		var dpr = window.devicePixelRatio || 1;
		var rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		var ctx = canvas.getContext("2d");
		//ctx.scale(dpr, dpr);
		return ctx;
	}
	var context,
		canvasHeight,
		canvasWidth,
		canvasMiddle = {},
		coordinates = [],
		colors = [],
		arrOfPieParts = [],
		inputObject = {},
		cursorIsOverLegend = null,
		mouseIsOverPieChart = false,
		originalColors = Array.from(input.colors),
		originalDataY,
		isMouseOverChartPart,
		legendCoordinates = {firstRow: {x: [], y: 0}, secondRow: {x: [], y: 0}},
		originalCoordinates,
		render = function (input) {
			var canvas = document.getElementById(input.canvasID);
			inputObject = getInputObj(input);
			context = setupCanvas(canvas);
			canvasHeight = canvas.height;
			canvasWidth = canvas.width;
			canvasMiddle = {x: canvasWidth / 2, y: canvasHeight / 2};
			toggleArray = new Array(inputObject.dataY.length).fill(null);
			isMouseOverChartPart = new Array(inputObject.dataY.length).fill(null);
			originalDataY = originalYData();
			colors = getColors(input.colors);
			drawChartParts(input);
			canvas.addEventListener("mousemove", mouseMove, false);
			canvas.addEventListener("click", mouseClick, false);
			canvas.addEventListener("mousemove", cursorChange, false);
		},
		getColors = function (colors) {
			var array = colors;
			return array;
		},
		getInputObj = function (input) {
			var inputObj = input;
			var limit = canvasHeight * 0.29;
			var fallBack = canvasHeight * 0.2;
			if (inputObj.radius > limit) {
				inputObj.radius = fallBack;
			}
			return inputObj;
		},
		drawChartParts = function (input) {
			drawChartBackground();
			drawChartTitle(inputObject.title);
			drawChartSubtitle(inputObject.subtitle);
			drawYAxisTitle(inputObject.dataYLabel);
			drawLegend();
			drawPieChart(inputObject.radius);
		},
		mouseClick = function (event) {
			var r = canvas.getBoundingClientRect();
			var topLeftCornerPosition = {x: r.x, y: r.y};
			var posX = event.clientX; // Get the horizontal coordinate
			var posY = event.clientY; // Get the vertical coordinate
			var relativeX = posX - topLeftCornerPosition.x;
			var relativeY = posY - topLeftCornerPosition.y;
			var currentXCoordinates = Array.from(legendCoordinates.firstRow.x);
			var currentYCoordinate = legendCoordinates.firstRow.y;
			var lastItem = currentXCoordinates[inputObject.dataY.length - 1];
			if (currentXCoordinates.length == inputObject.dataY.length) {
				currentXCoordinates.push(lastItem + 50);
			}

			for (var i = 0; i < inputObject.dataY.length; i++) {
				if (
					relativeX > currentXCoordinates[i] &&
					relativeX < currentXCoordinates[i + 1] &&
					relativeY > currentYCoordinate - 10 &&
					relativeY < currentYCoordinate + 10 &&
					toggleArray[i] == null
				) {
					clearChart();
					inputObject.dataY[i].data = null;
					inputObject.colors.splice(i, 1, "gray");
					drawChartParts();
					drawPieChart();
					toggleArray[i] = true;
				} else if (
					relativeX > currentXCoordinates[i] &&
					relativeX < currentXCoordinates[i + 1] &&
					relativeY > currentYCoordinate - 10 &&
					relativeY < currentYCoordinate + 10 &&
					toggleArray[i] == true
				) {
					clearChart();
					inputObject.colors.splice(i, 1, originalColors[i]);
					inputObject.dataY[i].data = originalDataY[i];
					drawChartParts();
					drawPieChart();
					toggleArray[i] = null;
				}
			}
		},
		cursorChange = function () {
			var r = canvas.getBoundingClientRect();
			var topLeftCornerPosition = {x: r.x, y: r.y};
			var posX = event.clientX; // Get the horizontal coordinate
			var posY = event.clientY; // Get the vertical coordinate
			var relativeX = posX - topLeftCornerPosition.x;
			var relativeY = posY - topLeftCornerPosition.y;
			var currentXCoordinates = Array.from(legendCoordinates.firstRow.x);
			var currentYCoordinate = legendCoordinates.firstRow.y;
			var lastItem = currentXCoordinates[inputObject.dataY.length - 1];
			if (currentXCoordinates.length == inputObject.dataY.length) {
				currentXCoordinates.push(lastItem + 50);
			}

			if (
				relativeX > currentXCoordinates[0] &&
				relativeX < currentXCoordinates[inputObject.dataY.length - 1] + 50 &&
				relativeY > currentYCoordinate - 10 &&
				relativeY < currentYCoordinate + 10 &&
				cursorIsOverLegend === null
			) {
				document.body.style.cursor = "pointer";
				cursorIsOverLegend = true;
			} else if (
				(relativeX < currentXCoordinates[0] ||
					relativeX > currentXCoordinates[inputObject.dataY.length - 1] + 50 ||
					relativeY < currentYCoordinate - 10 ||
					relativeY > currentYCoordinate + 10) &&
				cursorIsOverLegend === true
			) {
				document.body.style.cursor = "default";
				cursorIsOverLegend = null;
			}
		},
		originalYData = function () {
			var data = [];
			inputObject.dataY.forEach((el) => {
				data.push(el.data);
			});
			return data;
		},
		drawChartBackground = function () {
			context.fillStyle = inputObject.backgroundColor;
			context.fillRect(0, 0, canvasWidth, canvasHeight);
		},
		drawPiePart = function (x, y, radius, startAng, endAng, color) {
			var startAngle = startAng * Math.PI;
			var endAngle = endAng * Math.PI;
			const piePart = new Path2D();
			context.beginPath();
			piePart.arc(x, y, radius, endAngle, startAngle, true);
			piePart.lineTo(x, y);
			context.closePath();
			context.fillStyle = color;
			context.fill(piePart);
			arrOfPieParts.push(piePart);
		},
		drawPieChart = function (radius) {
			var angles = calculatePercentage();
			var currentAngle = 0;
			for (var i = 0; i < inputObject.dataY.length; i++) {
				drawPiePart(
					canvasMiddle.x,
					canvasMiddle.y,
					radius,
					currentAngle,
					currentAngle + 0.005 + angles[i],
					inputObject.colors[i]
				);

				currentAngle = currentAngle + angles[i];
			}
		},
		drawLegend = function () {
			if (inputObject.dataY.length < 18) {
				drawLegendItems();
			}
		},
		getCharacterNumbers = function () {
			var names = [];
			var letterCount = [];
			for (var i = 0; i < inputObject.dataY.length; i++) {
				names.push(inputObject.dataY[i].title);
			}
			names.forEach((name) => {
				var currentLength = name.length;
				letterCount.push(currentLength);
			});

			return letterCount;
		},
		clearCircle = function (x, y, radius) {
			context.fillStyle = inputObject.backgroundColor;
			context.beginPath();
			context.arc(x, y, radius, 0, 2 * Math.PI);
			context.fill();
		},
		drawLegendItems = function () {
			var reducer = function (acc, num) {
				acc += num;
				return acc;
			};
			var letterCount = getCharacterNumbers();
			var numOfElements = inputObject.dataY.length;
			var legendSymbolWidth = 10;
			var insidePadding = legendSymbolWidth / 2;
			var textAndSymbolWidth =
				letterCount.reduce(reducer) * 8 +
				legendSymbolWidth * numOfElements +
				insidePadding * numOfElements;
			var legendWidth = textAndSymbolWidth;
			var margin = (canvasWidth - legendWidth) / 2;
			var legendYPos = canvasHeight - canvasHeight / 17;
			var legendHeight = canvasHeight / 20;
			var xcoordinates = [margin];
			var counter = letterCount[0] * 8;

			var breakPoint = Math.round(numOfElements / 2);

			var drawingCounter = breakPoint;

			for (var i = 0; i < numOfElements - 1; i++) {
				xcoordinates.push(
					margin +
						(legendSymbolWidth / 2) * (i + 2) +
						insidePadding * (i + 2) +
						counter
				);
				counter += letterCount[i + 1] * 8;
			}
			if (legendWidth < canvasWidth * 0.9) {
				for (var i = 0; i < numOfElements; i++) {
					var counter = 0;

					drawCircle(
						xcoordinates[i],
						legendYPos + legendHeight / 2,
						legendSymbolWidth / 2,
						inputObject.colors[i]
					);
					drawText(
						inputObject.dataY[i].title,
						xcoordinates[i] + legendSymbolWidth / 2 + insidePadding,
						legendYPos + legendHeight / 2 + 4
					);
				}
				legendCoordinates.firstRow.x = xcoordinates;
				legendCoordinates.firstRow.y = legendYPos + legendHeight / 2;
			} else if (legendWidth > canvasWidth * 0.9) {
				var newLegendWidth = textAndSymbolWidth / 2;
				var newMargin = (canvasWidth - newLegendWidth) / 2;
				var firstRowCoordinates = [newMargin];
				var firstRowCounter = letterCount[0] * 8;
				for (var i = 0; i < breakPoint; i++) {
					firstRowCoordinates.push(
						newMargin +
							(legendSymbolWidth / 2) * (i + 2) +
							insidePadding * (i + 2) +
							firstRowCounter
					);
					firstRowCounter += letterCount[i + 1] * 8;
				}

				for (var i = 0; i < breakPoint; i++) {
					drawCircle(
						firstRowCoordinates[i],
						legendYPos + legendHeight / 2 - canvasWidth / 30,
						legendSymbolWidth / 2,
						inputObject.colors[i]
					);
					drawText(
						inputObject.dataY[i].title,
						firstRowCoordinates[i] + legendSymbolWidth / 2 + insidePadding,
						legendYPos + legendHeight / 2 + 4 - canvasWidth / 30
					);
				}
				var secondRowCoordinates = [newMargin];
				var secondRowCounter = letterCount[breakPoint] * 8; // sedmi element
				for (var i = 0; i < numOfElements - breakPoint - 1; i++) {
					secondRowCoordinates.push(
						newMargin +
							(legendSymbolWidth / 2) * (i + 2) +
							insidePadding * (i + 2) +
							secondRowCounter
					);
					secondRowCounter += letterCount[breakPoint + i + 1] * 8;
					//secondCoordinateCounter++;
				}
				for (var i = 0; i < numOfElements - breakPoint; i++) {
					drawCircle(
						secondRowCoordinates[i],
						legendYPos + legendHeight / 2,
						legendSymbolWidth / 2,
						inputObject.colors[drawingCounter]
					);
					drawText(
						inputObject.dataY[drawingCounter].title,
						secondRowCoordinates[i] + legendSymbolWidth / 2 + insidePadding,
						legendYPos + legendHeight / 2 + 4
					);
					drawingCounter++;
				}
			}
		},
		drawText = function (text, x, y, maxWidth) {
			context.fillStyle = inputObject.layoutColor;
			context.font = inputObject.chartText.fontStyle;
			context.textAlign = "left";
			context.fillText(text, x, y, maxWidth);
		},
		drawCircle = function (x, y, radius, color) {
			context.fillStyle = color;
			context.beginPath();
			context.arc(x, y, radius, 2 * Math.PI, false);
			context.fill();
		},
		calculatePercentage = function () {
			var vals = [];
			var angles = [];
			var total = [];
			var reducer = (accumulator, currentValue) => accumulator + currentValue;
			for (var i = 0; i < inputObject.dataY.length; i++) {
				vals.push(inputObject.dataY[i].data);
			}
			total = vals.reduce(reducer);
			for (var i = 0; i < inputObject.dataY.length; i++) {
				var currentPercent = (vals[i] * 100) / total;
				angles.push((2.0 / 100) * currentPercent);
			}
			return angles;
		},
		clearChart = function () {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
		},
		drawOverlayBox = function (
			x,
			y,
			width,
			height,
			strokeColor,
			fillColor,
			firstText,
			secondText
		) {
			var overlayBoxCorners = {
				topLeft: {x: x - width / 2, y: y - height - 18},
				bottomLeft: {x: x - width / 2, y: y - 18},
			};
			context.beginPath();
			context.fillStyle = strokeColor;
			context.fillRect(
				overlayBoxCorners.topLeft.x,
				overlayBoxCorners.topLeft.y,
				width,
				height
			);
			context.beginPath();
			context.fillStyle = fillColor;
			context.fillRect(
				overlayBoxCorners.topLeft.x + 1,
				overlayBoxCorners.topLeft.y + 1,
				width - 2,
				height - 2
			);
			context.beginPath();
			context.moveTo(
				overlayBoxCorners.bottomLeft.x + width / 2 - width / 15,
				overlayBoxCorners.bottomLeft.y
			);
			context.lineTo(
				overlayBoxCorners.bottomLeft.x + width / 2 + width / 15,
				overlayBoxCorners.bottomLeft.y
			);
			context.lineTo(
				overlayBoxCorners.bottomLeft.x + width / 2,
				overlayBoxCorners.bottomLeft.y + height / 5
			);
			context.closePath();
			context.fillStyle = strokeColor;
			context.fill();
			context.textAlign = "left";
			context.font = inputObject.chartText.fontStyle;
			context.fillText(
				firstText.toUpperCase(),
				overlayBoxCorners.topLeft.x + 5,
				overlayBoxCorners.topLeft.y + (height / 5) * 2,
				width - 5
			);
			context.textAlign = "left";
			context.fillText(
				secondText.toUpperCase(),
				overlayBoxCorners.topLeft.x + 5,
				overlayBoxCorners.topLeft.y + (height / 5) * 4,
				width - 25
			);
		},
		clearPieChart = function (radius) {
			context.clearRect(
				(canvasWidth - radius * 2) / 2,
				(canvasHeight - radius * 2) / 2,
				radius * 2,
				radius * 2
			);
			context.fillStyle = inputObject.backgroundColor;
			context.fillRect(
				(canvasWidth - radius * 2) / 2,
				(canvasHeight - radius * 2) / 2,
				radius * 2,
				radius * 2
			);
			context.fillStyle = inputObject.colors[0];
		},
		mouseMove = function (event) {
			var centerY = canvasHeight / 2;
			var centerX = canvasWidth / 2;
			var radius = inputObject.radius;
			var r = canvas.getBoundingClientRect();
			var topLeftCornerPosition = {x: r.x, y: r.y};
			var posX = event.clientX; // Get the horizontal coordinate
			var posY = event.clientY; // Get the vertical coordinate
			var relativeX = posX - r.x;
			var relativeY = posY - r.y;
			var distanceFromCenter = Math.sqrt(
				Math.pow(centerX - relativeX, 2) + Math.pow(centerY - relativeY, 2)
			);
			var angles = calculatePercentage();

			if (distanceFromCenter < radius) {
				for (let i = 0; i < arrOfPieParts.length; i++) {
					if (
						context.isPointInPath(
							arrOfPieParts[i],
							event.offsetX,
							event.offsetY
						) &&
						isMouseOverChartPart[i] === null &&
						distanceFromCenter < radius
					) {
						clearPieChart(radius + 30);
						let angles = calculatePercentage();
						let currentAngle = 0;
						let n = 0;
						let opacity = 0.2;
						for (var k = 0; k < inputObject.dataY.length; k++) {
							if (i === k) {
								n = radius / 12;
								opacity = 1;
							} else {
								n = 0;
								opacity = 0.2;
								angleFix = 0.008;
							}
							drawPiePart(
								canvasMiddle.x,
								canvasMiddle.y,
								radius + n,
								currentAngle + angleFix / 2,
								currentAngle + 0.005 + angles[k] - angleFix,
								inputObject.colors[k]
							);

							currentAngle = currentAngle + angles[k];
						}
						clearCircle(canvasMiddle.x, canvasMiddle.y, radius + 2);
						drawPieChart(radius);
						isMouseOverChartPart[i] = arrOfPieParts[i];
					} else if (
						!context.isPointInPath(
							arrOfPieParts[i],
							event.offsetX,
							event.offsetY
						) &&
						isMouseOverChartPart[i] === arrOfPieParts[i] &&
						distanceFromCenter < radius
					) {
						isMouseOverChartPart[i] = null;
					}
				}
			} else {
				clearPieChart(radius + 30);
				drawPieChart(radius);
				isMouseOverChartPart.fill(null);
			}
		},
		drawYAxisTitle = function (label) {
			context.save();
			context.fillStyle = inputObject.textColor;
			context.font = inputObject.subtitle.fontStyle;
			context.translate(0, canvasHeight);
			context.rotate(-Math.PI / 2);
			context.fillText(label.toUpperCase(), canvasHeight / 2, canvasWidth / 30);
			context.textAlign = "center";
			context.restore();
		},
		changeColorOpacity = function (color, opacity) {
			let newOpacity = color.slice(0, -2);
			newOpacity = newOpacity + opacity + ")";
			return newOpacity;
		},
		drawChartTitle = function (title) {
			context.textAlign = "center";
			context.font = title.fontStyle;
			context.fillStyle = title.textColor;
			context.fillText(
				title.text.toUpperCase(),
				canvasWidth / 2,
				30,
				canvasWidth
			);
		},
		drawChartSubtitle = function (subtitle) {
			context.textAlign = "center";
			context.font = subtitle.fontStyle;
			context.fillStyle = subtitle.textColor;
			context.fillText(
				subtitle.text.toUpperCase(),
				canvasWidth / 2,
				50,
				canvasWidth
			);
		};

	render(input);
};

var exampleData2 = {
	canvasID: "canvas",
	textColor: "#E0E0E3",
	backgroundColor: "#343436",
	chartText: {
		fontStyle: "10px Montserrat",
	},
	title: {
		text: "SOLAR EMPLOYMENT GROWTH, 2019",
		fontStyle: "bold 18px Montserrat",
		textColor: "#E0E0E3",
	},
	subtitle: {
		text: "SOLAR EMPLOYMENT GROWTH, 2019",
		fontStyle: "12px Montserrat",
		textColor: "#E0E0E3",
	},
	dataYLabel: "This is an example label text",
	dataY: [
		{title: "Asia", data: 245},
		{title: "Africa", data: 145},
		{title: "South America", data: 345},
		{title: "Europe", data: 545},
		{title: "North America", data: 225},
		{title: "Australia", data: 215},
		{title: "Antarctica", data: 15},
	],
	radius: 180,

	colors: [
		"rgb(43, 144, 143,1)",
		"rgb(144, 238, 126,1)",
		"rgb(244, 91, 91,1)",
		"rgb(119, 152, 191,1)",
		"rgb(170, 238, 238,1)",
		"rgb(255, 0, 102,1)",
		"rgb(238, 170, 238,1)",
		"rgb(85, 191, 59,1)",
		"rgb(223, 83, 83,1)",
		"rgb(119, 152, 191,1)",
		"rgb(170, 238, 238,1)",
	],
};
Chart(exampleData2);
