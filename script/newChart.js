var Chart = function (input) {
	var context,
		chartWidth,
		chartHeight,
		chartTopLeftCorner = {},
		chartTopRightCorner = {},
		canvasHeight,
		canvasWidth,
		maxY,
		minY,
		topNumber,
		bottomNumber,
		percentTaken,
		percentFromZero,
		incrementX,
		coordinates = [],
		colors = [],
		inputObject = {},
		toggleArray,
		dataPointIsSelected = null,
		cursorIsOverLegend = null,
		margin,
		originalColors = Array.from(input.colors),
		originalDataY = Array.from(input.dataY),
		originalCoordinates,
		render = function (input) {
			var canvas = document.getElementById(input.canvasID);
			canvasHeight = canvas.height;
			canvasWidth = canvas.width;
			margin = {
				top: calculatePercentage(canvasHeight, 15),
				right: calculatePercentage(canvasWidth, 20),
				bottom: calculatePercentage(canvasHeight, 10),
				left: calculatePercentage(canvasWidth, 10),
			};
			canvas.width = 1600; // this is a hardcoded fix for blurry canvas
			canvas.height = 1200; // fixes the problem to some extent
			canvas.style.width = "800"; // should be looked into further
			canvas.style.height = "600px"; //
			chartWidth = canvasWidth - margin.left - margin.right;
			chartHeight = canvasHeight - margin.top - margin.bottom;
			chartTopLeftCorner = {x: margin.left, y: margin.top};
			chartTopRightCorner = {x: canvasWidth - margin.right, y: margin.top};
			colors = getColors(input.colors);
			doCalculation();
			context = canvas.getContext("2d");
			context.scale(2, 2); // scaling the canvas, to fix the blurry canvas
			numberOfVerticalPoints = numberOfVerticalPointsF(input.dataX);
			inputObject = getInputObj(input);

			originalCoordinates = Array.from(coordinates);
			toggleArray = toggleArray = new Array(inputObject.dataY.length).fill(
				null
			);
			drawChartParts(input);
			canvas.addEventListener("mousemove", mouseMove, false);
			canvas.addEventListener("mousemove", cursorChange, false);
			canvas.addEventListener("click", removeOrAddItemFromList, false);
		},
		doCalculation = function () {
			minY = findMinY(input.dataY);
			maxY = findMaxY(input.dataY);
			maxMinDiff = maxY - minY;
			topNumber = calculateTopNumber();
			bottomNumber = calculateBottomNumber();
			percentTaken = 100 - calculatePercentTaken();
			percentFromZero = calculatePercentFromZero();
			coordinates = coordinateSet(input.dataY);
			inputObject = input;
		},
		drawChartParts = function (input) {
			drawChartBackground(), drawChartLayout();
			drawYAxisText(inputObject.numberOfHorizontalLines);
			drawChartBottomBorder(findAnExistingArray());
			drawHorizontalLines(inputObject.numberOfHorizontalLines);
			drawGraphLines(
				inputObject.dataY,
				inputObject.colors,
				inputObject.lineWidth
			);
			drawGraphDataPoints(
				inputObject.dataY,
				inputObject.colors,
				inputObject.dataPointSize
			);
			drawChartTitle(inputObject.title);
			drawChartSubtitle(inputObject.subtitle);
			drawXAxisText(inputObject.dataX, findAnExistingArray());
			drawChartLegend(
				inputObject.dataYNames,
				inputObject.colors,
				inputObject.textColorObject
			);
			drawYAxisTitle(inputObject.dataYLabel);
		},
		cursorChange = function () {
			var r = canvas.getBoundingClientRect();
			var topLeftCornerPosition = {x: r.x, y: r.y};
			var posX = event.clientX; // Get the horizontal coordinate
			var posY = event.clientY; // Get the vertical coordinate
			var relativeX = posX - topLeftCornerPosition.x;
			var relativeY = posY - topLeftCornerPosition.y;
			var legendWidth = calculatePercentage(margin.right, 80);
			var legendHeight = chartHeight / 2;
			var legendPaddingMeasure = legendHeight / 20;
			var legendIncrement = legendHeight / 15;
			var legendPadding = {
				top: legendPaddingMeasure * 2,
				left: legendPaddingMeasure,
				right: legendPaddingMeasure / 2,
			};
			var legendMargin = {
				left: calculatePercentage(margin.right, 10),
				top: margin.top,
			};
			var legendCorners = {
				topLeft: {
					x: chartTopRightCorner.x + legendMargin.left,
					y: margin.top + chartHeight / 4,
				},
				topRight: {
					x: chartTopRightCorner.x + legendMargin.left + legendWidth,
					y: margin.top + chartHeight / 4,
				},
				bottomleft: {
					x: chartTopRightCorner.x + legendMargin.left,
					y: margin.top + chartHeight / 4 + legendHeight,
				},
				bottomRight: {
					x: chartTopRightCorner.x + legendMargin.left + legendWidth,
					y: margin.top + chartHeight / 4 + legendHeight,
				},
			};

			if (
				relativeX > legendCorners.topLeft.x &&
				relativeX < legendCorners.topRight.x &&
				relativeY > legendCorners.topLeft.y &&
				relativeY < legendCorners.bottomRight.y &&
				cursorIsOverLegend === null
			) {
				document.body.style.cursor = "pointer";
				cursorIsOverLegend = true;
			} else if (
				(relativeX < legendCorners.topLeft.x ||
					relativeX > legendCorners.topRight.x ||
					relativeY < legendCorners.topLeft.y ||
					relativeY > legendCorners.bottomRight.y) &&
				cursorIsOverLegend === true
			) {
				document.body.style.cursor = "default";
				cursorIsOverLegend = null;
			}
		},
		removeOrAddItemFromList = function () {
			var r = canvas.getBoundingClientRect();
			var topLeftCornerPosition = {x: r.x, y: r.y};
			var posX = event.clientX; // Get the horizontal coordinate
			var posY = event.clientY; // Get the vertical coordinate
			var relativeX = posX - topLeftCornerPosition.x;
			var relativeY = posY - topLeftCornerPosition.y;
			var legendWidth = calculatePercentage(margin.right, 80);
			var legendHeight = chartHeight / 2;
			var legendPaddingMeasure = legendHeight / 20;
			var legendIncrement = legendHeight / 15;
			var legendPadding = {
				top: legendPaddingMeasure * 2,
				left: legendPaddingMeasure,
				right: legendPaddingMeasure / 2,
			};
			var legendMargin = {
				left: calculatePercentage(margin.right, 10),
				top: margin.top,
			};
			var legendCorners = {
				topLeft: {
					x: chartTopRightCorner.x + legendMargin.left,
					y: margin.top + chartHeight / 4,
				},
				topRight: {
					x: chartTopRightCorner.x + legendMargin.left + legendWidth,
					y: margin.top + chartHeight / 4,
				},
				bottomleft: {
					x: chartTopRightCorner.x + legendMargin.left,
					y: margin.top + chartHeight / 4 + legendHeight,
				},
				bottomRight: {
					x: chartTopRightCorner.x + legendMargin.left + legendWidth,
					y: margin.top + chartHeight / 4 + legendHeight,
				},
			};
			var legendItemsCoordinates = [];

			for (var i = 0; i < inputObject.dataY.length; i++) {
				var currentObj = {
					width: {
						x1: legendCorners.topLeft.x - 5 + legendPadding.left,
						x2: legendCorners.topRight.x - legendPaddingMeasure,
					},
					height: {
						y1:
							legendCorners.topLeft.y +
							legendPadding.top +
							i * legendIncrement -
							legendIncrement / 3,
						y2:
							legendCorners.topLeft.y +
							legendPadding.top +
							i * legendIncrement -
							legendIncrement / 3 +
							6,
					},
				};
				legendItemsCoordinates.push(currentObj);
			}
			for (var i = 0; i < legendItemsCoordinates.length; i++) {
				if (
					relativeX > legendItemsCoordinates[i].width.x1 &&
					relativeX < legendItemsCoordinates[i].width.x2 &&
					relativeY > legendItemsCoordinates[i].height.y1 &&
					relativeY < legendItemsCoordinates[i].height.y2 &&
					toggleArray[i] == null
				) {
					clearChart();
					inputObject.dataY.splice(i, 1, null);
					inputObject.colors.splice(i, 1, "gray");
					coordinates.splice(i, 1);
					doCalculation();
					drawChartParts();
					toggleArray[i] = true;
				} else if (
					relativeX > legendItemsCoordinates[i].width.x1 &&
					relativeX < legendItemsCoordinates[i].width.x2 &&
					relativeY > legendItemsCoordinates[i].height.y1 &&
					relativeY < legendItemsCoordinates[i].height.y2 &&
					toggleArray[i] == true
				) {
					clearChart();
					inputObject.colors.splice(i, 1, originalColors[i]);
					inputObject.dataY.splice(i, 1, originalDataY[i]);
					coordinates.splice(i, 1, originalCoordinates[i]);
					doCalculation();
					//coordinates = coordinateSet(inputObject.dataY);
					drawChartParts();
					toggleArray[i] = null;
				}
			}
		},
		getColors = function (colors) {
			var array = colors;
			return colors;
		},
		getInputObj = function (input) {
			var inputObj = input;
			return inputObj;
		},
		drawChartBackground = function () {
			context.fillStyle = inputObject.backgroundColor;
			context.fillRect(0, 0, canvasWidth, canvasHeight);
		},
		findAnExistingArray = function () {
			var currentArr;
			originalDataY.forEach((element) => {
				if (element !== null) {
					currentArr = element;
				}
			});
			return currentArr;
		},
		drawGraphDataPoints = function (arr, color, dataPointSize) {
			for (var i = 0; i < arr.length; i++) {
				var currentSetArray = createCoordinateSet(arr[i]);
				if (arr[i] !== null) {
					for (var k = 0; k < currentSetArray.length; k++) {
						context.save();
						drawCircle(
							currentSetArray[k].x,
							currentSetArray[k].y,
							dataPointSize,
							color[i]
						);
						context.fill();
						context.restore();
					}
				}
			}
		},
		coordinateSet = function (arr) {
			var array = [];
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] !== null) {
					var currentSetArray = createCoordinateSet(arr[i]);
					array.push(currentSetArray);
				}
			}

			return array;
		},
		clearChart = function () {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
		},
		drawCircle = function (x, y, radius, color) {
			context.fillStyle = color;
			context.beginPath();
			context.arc(x, y, radius, 2 * Math.PI, false);
			context.fill();
		},
		createCoordinateSet = function (arr) {
			if (arr !== null) {
				var posY;
				var setOfCoordinates = new Set();
				var arrLength = arr.length;
				incrementX = chartWidth / (arr.length - 1);

				for (var k = 0; k < arrLength; k++) {
					var percentage = ((arr[k] - minY) * percentTaken) / maxMinDiff;
					posY =
						chartHeight -
						(chartHeight / 100) * percentFromZero -
						(chartHeight / 100) * percentage;
					setOfCoordinates.add({
						x: chartTopLeftCorner.x + k * incrementX,
						y: posY + margin.top,
						currY: canvasHeight - margin.bottom,
					});
				}
				return Array.from(setOfCoordinates);
			}
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
		mouseMove = function (event) {
			var r = canvas.getBoundingClientRect();
			var topLeftCornerPosition = {x: r.x, y: r.y};
			var posX = event.clientX; // Get the horizontal coordinate
			var posY = event.clientY; // Get the vertical coordinate
			var relativeX = posX - topLeftCornerPosition.x;
			var relativeY = posY - topLeftCornerPosition.y;

			for (var i = 0; i < coordinates.length; i++) {
				var currentArr = coordinates[i];

				var radius = inputObject.dataPointSize;

				for (var k = 0; k < currentArr.length; k++) {
					var nonNullArrays = inputObject.dataY.filter((el) => {
						if (el !== null) {
							return el;
						}
					});
					var nonNullColors = inputObject.colors.filter((el) => {
						if (el !== "gray") {
							return el;
						}
					});
					var currentItem = currentArr[k];
					var currentX = currentArr[k].x;
					var currentY = currentArr[k].y;

					if (
						dataPointIsSelected === null &&
						relativeX >= currentX - inputObject.dataPointSize &&
						relativeX <= currentX + inputObject.dataPointSize &&
						relativeY <= currentY + inputObject.dataPointSize &&
						relativeY >= currentY - inputObject.dataPointSize
					) {
						drawCircle(currentX, currentY, radius * 1.3, nonNullColors[i]);
						drawCircle(currentX, currentY, radius * 0.8, "white");
						drawOverlayBox(
							currentX,
							currentY,
							chartWidth / 6,
							chartHeight / 12,
							nonNullColors[i],
							inputObject.backgroundColor,
							inputObject.dataX[k],
							inputObject.dataYNames[i] + ": " + nonNullArrays[i][k]
						);

						dataPointIsSelected = currentItem;
						break;
					} else if (
						dataPointIsSelected === currentItem &&
						(relativeX <= currentX - inputObject.dataPointSize ||
							relativeX >= currentX + inputObject.dataPointSize ||
							relativeY <= currentY - inputObject.dataPointSize ||
							relativeY >= currentY + inputObject.dataPointSize)
					) {
						clearChart();
						drawChartParts(inputObject);
						dataPointIsSelected = null;
					}
				}
			}
		},
		drawYAxisTitle = function (label) {
			context.save();
			context.fillStyle = inputObject.textColor;
			context.font = inputObject.subtitle.fontStyle;
			context.translate(0, canvasHeight);
			context.rotate(-Math.PI / 2);
			context.fillText(label.toUpperCase(), chartHeight / 2, canvasWidth / 30);
			context.textAlign = "center";
			context.restore();
		},
		calculatePercentTaken = function () {
			var percentNumber = (100 * (topNumber - maxMinDiff)) / topNumber;
			return percentNumber;
		},
		calculatePercentFromZero = function () {
			var zeroPercentNum = (100 * minY) / topNumber;
			return zeroPercentNum;
		},
		calculateTopNumber = function () {
			var numberSize = maxY.toString().length;
			var topNumber = Math.pow(10, numberSize);

			if (topNumber / 2 - maxY > 0) {
				topNumber /= 2;
				if (topNumber / 2 - maxY >= 0) {
					topNumber /= 2;
				}
			} else if (maxY >= topNumber / 2 && maxY < 3 * (topNumber / 4)) {
				topNumber = (topNumber / 4) * 3;
			}
			return topNumber;
		},
		calculateBottomNumber = function () {
			return 0;
		},
		drawYAxisText = function (numberOfHorizontalLines) {
			var verticalIncrement = chartHeight / (numberOfHorizontalLines - 1);
			var numberIncrement = topNumber / (numberOfHorizontalLines - 1);
			for (var i = 0; i < numberOfHorizontalLines; i++) {
				context.fillStyle = inputObject.textColor;
				context.font = inputObject.chartText.fontStyle;
				context.fillText(
					Math.round(topNumber - i * numberIncrement),
					margin.left - 30,
					margin.top + i * verticalIncrement + 3,
					40
				);
			}
		},
		drawHorizontalLines = function (numberOfHorizontalLines) {
			var verticalIncrement = chartHeight / (numberOfHorizontalLines - 1);

			for (var i = 1; i <= numberOfHorizontalLines - 1; i++) {
				context.strokeStyle = inputObject.layoutColor;
				context.beginPath();
				context.lineTo(
					chartTopLeftCorner.x,
					chartTopRightCorner.y + i * verticalIncrement
				);
				context.lineTo(
					chartTopRightCorner.x,
					chartTopRightCorner.y + i * verticalIncrement
				);
				context.lineWidth = 0.5;
				context.stroke();
			}
		},
		drawChartBottomBorder = function (arr) {
			if (arr !== null) {
				for (var i = 1; i < arr.length - 1; i++) {
					var horizontalPointXCoordinateArr = createCoordinateSet(arr);
					context.beginPath();
					context.lineTo(
						horizontalPointXCoordinateArr[i].x,
						margin.top + chartHeight
					);
					context.lineTo(
						horizontalPointXCoordinateArr[i].x,
						margin.top + chartHeight + 8
					);
					context.strokeStyle = inputObject.layoutColor;
					context.lineWidth = 2;
					context.stroke();
				}
				context.beginPath();
				context.lineTo(chartTopLeftCorner.x, margin.top + chartHeight);
				context.lineTo(chartTopRightCorner.x, margin.top + chartHeight);
				context.strokeStyle = inputObject.layoutColor;
				context.lineWidth = 2;
				context.stroke();
			}
		},
		drawChartLegend = function (arr, color, textColor) {
			var legendWidth = calculatePercentage(margin.right, 80);
			var legendHeight = chartHeight / 2;
			var legendPaddingMeasure = legendHeight / 20;
			var legendIncrement = legendHeight / 15;
			var symbolWidth = legendWidth / 10;
			var legendPadding = {
				top: legendPaddingMeasure * 2,
				left: legendPaddingMeasure,
				right: legendPaddingMeasure / 2,
			};
			var legendMargin = {
				left: calculatePercentage(margin.right, 10),
				top: margin.top,
			};
			var legendCorners = {
				topLeft: {
					x: chartTopRightCorner.x + legendMargin.left,
					y: margin.top + chartHeight / 4,
				},
				topright: {
					x: chartTopRightCorner.x + legendMargin.left + legendWidth,
					y: margin.top + chartHeight / 4,
				},
				bottomleft: {
					x: chartTopRightCorner.x + legendMargin.left,
					y: margin.top + chartHeight / 4 + legendHeight,
				},
				bottomRight: {
					x: chartTopRightCorner.x + legendMargin.left + legendWidth,
					y: margin.top + chartHeight / 4 + legendHeight,
				},
			};

			context.strokeStyle = "rgba(184,184,184, 1)";
			context.lineWidth = 0.8;
			context.strokeRect(
				legendCorners.topLeft.x,
				legendCorners.topLeft.y,
				legendWidth,
				legendHeight
			);

			for (var i = 0; i < inputObject.dataYNames.length; i++) {
				context.textAlign = "left";
				context.beginPath();
				context.strokeStyle = color[i];
				context.lineTo(
					legendCorners.topLeft.x - 5 + legendPadding.left,
					legendCorners.topLeft.y +
						legendPadding.top +
						i * legendIncrement -
						legendIncrement / 3
				);
				context.lineTo(
					legendCorners.topLeft.x - 5 + legendPadding.left + symbolWidth,
					legendCorners.topLeft.y +
						legendPadding.top +
						i * legendIncrement -
						legendIncrement / 3
				);
				context.fillStyle = color[i];
				context.fillRect(
					legendCorners.topLeft.x - 5 + legendPadding.left + symbolWidth / 3,
					legendCorners.topLeft.y +
						legendPadding.top +
						i * legendIncrement -
						legendIncrement / 3 -
						3,

					6,
					6
				);
				var currentName = arr[i];
				if (currentName === undefined) {
					currentName = "Item Not Defined";
				}
				context.stroke();
				context.font = inputObject.chartText.fontStyle;
				context.fillStyle = textColor;
				context.fillText(
					currentName.toUpperCase(),
					legendCorners.topLeft.x + legendPadding.left + symbolWidth,
					legendCorners.topLeft.y + legendPadding.top + i * legendIncrement,
					legendWidth - legendPadding.left - legendPadding.right - symbolWidth
				);
			}
		},
		drawGraphLines = function (arr, color, lineWidth) {
			for (var i = 0; i < arr.length; i++) {
				var currentSetArray = createCoordinateSet(arr[i]);
				context.beginPath();
				context.lineJoin = "round";
				context.lineWidth = lineWidth;
				context.strokeStyle = color[i];
				if (arr[i] !== null) {
					for (var k = 0; k < currentSetArray.length; k++) {
						if (currentSetArray[k] !== null) {
							context.lineTo(currentSetArray[k].x, currentSetArray[k].y);
							context.stroke();
						}
					}
				}
			}
		},
		drawChartLayout = function () {
			context.strokeStyle = inputObject.layoutColor;
			context.lineWidth = 0.5;
			context.strokeRect(
				chartTopLeftCorner.x,
				chartTopLeftCorner.y,
				chartWidth,
				chartHeight
			);
		},
		findMinY = function (arrOfArrays) {
			var minInEachArray = [];
			for (var i = 0; i < arrOfArrays.length; i++) {
				if (arrOfArrays[i] !== null) {
					var currentMin = Math.min(...arrOfArrays[i]);
					minInEachArray.push(currentMin);
				}
			}
			var minY = Math.min(...minInEachArray);
			return minY;
		},
		findMaxY = function (arrOfArrays) {
			var maxInEachArray = [];
			for (var i = 0; i < arrOfArrays.length; i++) {
				if (arrOfArrays[i] !== null) {
					var currentMax = Math.max(...arrOfArrays[i]);
					maxInEachArray.push(currentMax);
				}
			}
			var maxY = Math.max(...maxInEachArray);
			return maxY;
		},
		drawChartTitle = function (title) {
			context.textAlign = "center";
			context.font = title.fontStyle;
			context.fillStyle = title.textColor;
			context.fillText(
				title.text.toUpperCase(),
				canvasWidth / 2,
				4 * (margin.top / 10),
				chartWidth
			);
		},
		drawChartSubtitle = function (subtitle) {
			context.textAlign = "center";
			context.font = subtitle.fontStyle;
			context.fillStyle = subtitle.textColor;
			context.fillText(
				subtitle.text.toUpperCase(),
				canvasWidth / 2,
				6 * (margin.top / 10),
				chartWidth
			);
		},
		numberOfVerticalPointsF = function (arr) {
			return arr.length;
		},
		drawXAxisText = function (text, arr) {
			var horizontalPointXCoordinateArr = createCoordinateSet(arr);

			for (var i = 0; i < text.length; i++) {
				if (arr[i] !== null) {
					context.fillStyle = inputObject.textColor;
					context.textAlign = "center";
					context.font = inputObject.chartText.fontStyle;
					context.fillText(
						text[i].toUpperCase(),
						horizontalPointXCoordinateArr[i].x,
						margin.top + chartHeight + 25
					);
				}
			}
		},
		calculatePercentage = function (x, y) {
			var percentage = (x / 100) * y;
			return percentage;
		};

	render(input);
};

exampleData2 = {
	canvasID: "canvas",
	textColor: "#E0E0E3",
	backgroundColor: "#343436",
	layoutColor: "#E0E0E3",
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
		[131, 42, 231, 142, 222, 192, 49, 233, 123, 139, 144, 192],
		[233, 132, 131, 242, 122, 142, 199, 63, 193, 109, 184, 92],
		[321, 833, 221, 145, 432, 200, 100, 150, 250, 333, 129, 145],
		[221, 133, 321, 445, 132, 100, 400, 450, 350, 233, 429, 445],
		[25, 5, 32, 41, 53, 66, 47, 62, 43, 85, 66, 44],
	],
	dataYNames: ["Asia", "Europe", "South America", "Africa", "Antarctica"],
	dataX: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	],
	numberOfHorizontalLines: 11,
	colors: [
		"#3C908F",
		"#90EE7E",
		"#AAEEEE",
		"#EE595A",
		"#00B3E6",
		"#E6B333",
		"#3366E6",
		"#999966",
		"#99FF99",
		"#B34D4D",
		"#80B300",
		"#809900",
		"#E6B3B3",
		"#6680B3",
		"#66991A",
		"#FF99E6",
		"#CCFF1A",
		"#FF1A66",
		"#E6331A",
		"#33FFCC",
		"#66994D",
		"#B366CC",
		"#4D8000",
		"#B33300",
		"#CC80CC",
		"#66664D",
		"#991AFF",
		"#E666FF",
		"#4DB3FF",
	],
	dataPointSize: 5,
	lineWidth: 2,
};
Chart(exampleData2);
// exampleData = {
// 	canvasID: "canvas",
// 	backgroundColor: "white",
// 	textColor: "#000000",
// 	layoutColor: "#C8C8C8",
// 	title: {
// 		text: "This is an example title text.",
// 		fontStyle: "18px sans-serif",
// 		textColor: "#000000",
// 	},
// 	subtitle: {
// 		text: "This is an example subtitle text.",
// 		fontStyle: "12px sans-serif",
// 		textColor: "#000000",
// 	},
// 	dataYLabel: "This is an example label text",
// 	dataY: [
// 		[131, 42, 231, 142, 222, 192, 49, 233, 123, 139, 144, 192],
// 		[233, 132, 131, 242, 122, 142, 199, 63, 193, 109, 184, 92],
// 		[233, 432, 231, 442, 312, 842, 499, 433, 123, 439, 444, 492],
// 	],
// 	dataYNames: ["Asia", "Europe", "South America"],
// 	dataX: [
// 		"Jan",
// 		"Feb",
// 		"Mar",
// 		"Apr",
// 		"May",
// 		"Jun",
// 		"Jul",
// 		"Aug",
// 		"Sep",
// 		"Oct",
// 		"Nov",
// 		"Dec",
// 	],
// 	numberOfHorizontalLines: 11,
// 	colors: [
// 		"#FF6633",
// 		"#FFB399",
// 		"#FF33FF",
// 		"#FFFF99",
// 		"#00B3E6",
// 		"#E6B333",
// 		"#3366E6",
// 		"#999966",
// 		"#99FF99",
// 		"#B34D4D",
// 		"#80B300",
// 		"#809900",
// 		"#E6B3B3",
// 		"#6680B3",
// 		"#66991A",
// 		"#FF99E6",
// 		"#CCFF1A",
// 		"#FF1A66",
// 		"#E6331A",
// 		"#33FFCC",
// 		"#66994D",
// 		"#B366CC",
// 		"#4D8000",
// 		"#B33300",
// 		"#CC80CC",
// 		"#66664D",
// 		"#991AFF",
// 		"#E666FF",
// 		"#4DB3FF",
// 	],
// 	dataPointSize: 5,
// 	lineWidth: 2,
// };

// var arrayExamples = [
// 	[25, 5, 32, 41, 53, 66, 47, 62, 43, 85, 66, 44],
// 	[1233, 4432, 2231, 5442, 4312, 9842, 6499, 5433, 1123, 439, 3444, 5492],
// 	[233, 432, 231, 442, 312, 842, 499, 433, 123, 439, 444, 492],
// 	[
// 		123312,
// 		4432,
// 		22231,
// 		54442,
// 		154312,
// 		2842,
// 		62499,
// 		53433,
// 		441123,
// 		13439,
// 		453444,
// 		925492,
// 	],
// 	[
// 		12322,
// 		6432,
// 		66231,
// 		71442,
// 		43312,
// 		287342,
// 		623499,
// 		534333,
// 		441123,
// 		123439,
// 		99444,
// 		885492,
// 	],
// 	[75, 52, 42, 71, 23, 46, 27, 32, 43, 45, 26, 44],
// 	[22, 26, 62, 21, 43, 56, 17, 22, 23, 15, 46, 24],
// ];
