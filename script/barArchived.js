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
		numberOfSections,
		numberOfBars,
		sectionWidth,
		topNumber,
		bottomNumber,
		percentTaken,
		percentFromZero,
		incrementX,
		legendCoordinates = {firstRow: {x: [], y: 0}, secondRow: {x: [], y: 0}},
		coordinates = [],
		colors = [],
		inputObject = {},
		originalColors = Array.from(input.colors),
		originalDataY = Array.from(input.dataY),
		originalCoordinates,
		dataPointIsSelected = null,
		cursorIsOverLegend = null,
		margin,
		render = function (input) {
			var canvas = document.getElementById(input.canvasID);
			canvasHeight = canvas.height;
			canvasWidth = canvas.width;
			margin = {
				top: calculatePercentage(canvasHeight, 10),
				right: calculatePercentage(canvasWidth, 5),
				bottom: calculatePercentage(canvasHeight, 15),
				left: calculatePercentage(canvasWidth, 10),
			};
			canvas.width = 1600; // this is a hardcoded fix for blurry canvas
			canvas.height = 1200; // fixes the problem to some extent
			canvas.style.width = "800px"; // should be looked into further
			canvas.style.height = "600px"; //
			chartWidth = canvasWidth - margin.left - margin.right;
			chartHeight = canvasHeight - margin.top - margin.bottom;
			chartTopLeftCorner = {x: margin.left, y: margin.top};
			chartTopRightCorner = {x: canvasWidth - margin.right, y: margin.top};
			context = canvas.getContext("2d");
			context.scale(2, 2);
			inputObject = getInputObj(input);
			toggleArray = toggleArray = new Array(inputObject.dataY.length).fill(
				null
			);
			originalCoordinates = Array.from(coordinates);
			doCalculation();
			drawChartParts(input);
			canvas.addEventListener("mousemove", mouseMove, false);
			canvas.addEventListener("mousemove", cursorChange, false);
			canvas.addEventListener("click", mouseClick, false);
		},
		doCalculation = function () {
			minY = findMinY(input.dataY);
			maxY = findMaxY(input.dataY);
			maxMinDiff = maxY - minY;
			numberOfBars = getNumberOfBars();
			numberOfSections = getNumberOfSections();
			numberOfVerticalPoints = numberOfVerticalPointsF(input.dataX);
			topNumber = calculateTopNumber();
			sectionWidth = chartWidth / numberOfSections;
			bottomNumber = calculateBottomNumber();
			percentTaken = 100 - calculatePercentTaken();
			percentFromZero = calculatePercentFromZero();
			coordinates = coordinateSet(input.dataY);
			colors = getColors(input.colors);
			inputObject = input;
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
			var lastItem = currentXCoordinates[inputObject.dataYNames.length - 1];
			if (currentXCoordinates.length == inputObject.dataYNames.length) {
				currentXCoordinates.push(lastItem + 50);
			}

			if (
				relativeX > currentXCoordinates[0] &&
				relativeX <
					currentXCoordinates[inputObject.dataYNames.length - 1] + 50 &&
				relativeY > currentYCoordinate - 10 &&
				relativeY < currentYCoordinate + 10 &&
				cursorIsOverLegend === null
			) {
				document.body.style.cursor = "pointer";
				cursorIsOverLegend = true;
			} else if (
				(relativeX < currentXCoordinates[0] ||
					relativeX >
						currentXCoordinates[inputObject.dataYNames.length - 1] + 50 ||
					relativeY < currentYCoordinate - 10 ||
					relativeY > currentYCoordinate + 10) &&
				cursorIsOverLegend === true
			) {
				document.body.style.cursor = "default";
				cursorIsOverLegend = null;
			}
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
			var lastItem = currentXCoordinates[inputObject.dataYNames.length - 1];
			if (currentXCoordinates.length == inputObject.dataYNames.length) {
				currentXCoordinates.push(lastItem + 50);
			}

			for (var i = 0; i < inputObject.dataYNames.length; i++) {
				if (
					relativeX > currentXCoordinates[i] &&
					relativeX < currentXCoordinates[i + 1] &&
					relativeY > currentYCoordinate - 10 &&
					relativeY < currentYCoordinate + 10 &&
					toggleArray[i] == null
				) {
					clearChart();
					inputObject.dataY.splice(i, 1, null);
					inputObject.colors.splice(i, 1, "gray");
					coordinates.splice(i, 1, null);
					doCalculation();
					drawChartParts();
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
					inputObject.dataY.splice(i, 1, originalDataY[i]);
					coordinates.splice(i, 1, originalCoordinates[i]);
					doCalculation();
					drawChartParts();
					toggleArray[i] = null;
				}
			}
		},
		drawChartParts = function (input) {
			drawChartBackground();
			drawYAxisText(inputObject.numberOfHorizontalLines);
			drawChartBottomBorder(findAnExistingArray());
			drawHorizontalLines(inputObject.numberOfHorizontalLines);
			drawChartTitle(inputObject.title);
			drawChartSubtitle(inputObject.subtitle);
			drawXAxisText(inputObject.dataX, findAnExistingArray());
			drawYAxisTitle(inputObject.dataYLabel);
			drawBars();
			getBarCoordinates();
			drawLegend();
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
		getSectionStartingPoint = function () {
			var increment = chartWidth / numberOfSections;
			var sectionStartingPointsX = [];
			var startingPoint = {
				x: chartTopLeftCorner.x,
				y: chartTopLeftCorner.y + chartHeight,
			};
			for (var i = 0; i < numberOfSections; i++) {
				var currentStartingPoint = startingPoint.x + i * increment;

				sectionStartingPointsX.push(currentStartingPoint);
			}
			return sectionStartingPointsX;
		},
		drawBars = function () {
			var startingPoints = getSectionStartingPoint();
			var numberOfGaps = numberOfBars - 1; // 4
			var barWidth = inputObject.dataPointSize; // 17
			var innerMargin = 5;
			var maxBarWidth =
				(sectionWidth - innerMargin * numberOfGaps) / numberOfBars - 2; // 17.5
			var bottomMargin = calculatePercentage(canvasHeight, 15);
			if (barWidth >= maxBarWidth) {
				barWidth = 7;
			}
			var nonNullColors = inputObject.colors.filter((el) => {
				if (el !== "gray") {
					return el;
				}
			});

			var margin =
				(sectionWidth - barWidth * numberOfBars - innerMargin * numberOfGaps) /
				2;

			for (var i = 0; i < numberOfBars; i++) {
				if (coordinates[i] !== null) {
					for (var k = 0; k < numberOfSections; k++) {
						if (coordinates[k] !== null) {
							context.fillStyle = nonNullColors[i];

							context.fillRect(
								startingPoints[k] + margin + barWidth * i + innerMargin * i,
								chartTopLeftCorner.y + chartHeight,
								barWidth,
								-(canvasHeight - coordinates[i][k].y - bottomMargin)
							);
						}
					}
				}
			}
		},
		getBarCoordinates = function () {
			var startingPoints = getSectionStartingPoint();
			var numberOfGaps = numberOfBars - 1; // 4
			var barWidth = inputObject.dataPointSize; // 17
			var innerMargin = 5;
			var maxBarWidth =
				(sectionWidth - innerMargin * numberOfGaps) / numberOfBars - 2; // 17.5
			if (barWidth >= maxBarWidth) {
				barWidth = 5;
			}

			var margin =
				(sectionWidth - barWidth * numberOfBars - innerMargin * numberOfGaps) /
				2;

			var allCoordinates = [];
			var nonNullArrays = inputObject.dataY.filter((el) => {
				if (el !== null) {
					return el;
				}
			});
			for (var i = 0; i < nonNullArrays.length; i++) {
				var setOfCoor = [];
				if (coordinates[i] !== null)
					for (var k = 0; k < numberOfSections; k++) {
						if (coordinates[i][k] !== null) {
							var currentObj = {
								topLeft: {x: 0, y: 0},
								bottomRight: {x: 0, y: 0},
							};

							currentObj.bottomRight.x =
								startingPoints[k] +
								margin +
								barWidth * i +
								innerMargin * i +
								barWidth;
							currentObj.bottomRight.y = chartTopLeftCorner.y + chartHeight;
							currentObj.topLeft.x =
								startingPoints[k] + margin + barWidth * i + innerMargin * i;
							currentObj.topLeft.y = coordinates[i][k].y;
							setOfCoor.push(currentObj);
						}
					}
				allCoordinates.push(setOfCoor);
			}
			return allCoordinates;
		},
		getNumberOfSections = function () {
			var existingArray = findAnExistingArray();
			var num = existingArray.length;
			return num;
		},
		getNumberOfBars = function () {
			var nonNullArrays = inputObject.dataY.filter((el) => {
				if (el !== null) {
					return el;
				}
			});
			var num = nonNullArrays.length;
			return num;
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
		coordinateSet = function (arr) {
			var array = [];
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] !== null) {
					array.push(createCoordinateSet(arr[i]));
				}
			}
			return array;
		},
		clearChart = function () {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
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
				names.push(inputObject.dataYNames[i]);
			}
			names.forEach((name) => {
				var currentLength = name.length;
				letterCount.push(currentLength);
			});

			return letterCount;
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
						inputObject.dataYNames[i],
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
						inputObject.dataYNames[i],
						firstRowCoordinates[i] + legendSymbolWidth / 2 + insidePadding,
						legendYPos + legendHeight / 2 + 4 - canvasWidth / 30
					);
				}
				var secondRowCoordinates = [newMargin];
				var secondCoordinateCounter = numOfElements - breakPoint + 1; //6
				var secondRowCounter = letterCount[breakPoint] * 8; // sedmi element
				for (var i = 0; i < numOfElements - breakPoint - 1; i++) {
					secondRowCoordinates.push(
						newMargin +
							(legendSymbolWidth / 2) * (i + 2) +
							insidePadding * (i + 2) +
							secondRowCounter
					);
					secondRowCounter += letterCount[breakPoint + i + 1] * 8;
					secondCoordinateCounter++;
				}
				for (var i = 0; i < numOfElements - breakPoint; i++) {
					drawCircle(
						secondRowCoordinates[i],
						legendYPos + legendHeight / 2,
						legendSymbolWidth / 2,
						inputObject.colors[breakPoint + i]
					);
					drawText(
						inputObject.dataY[breakPoint + i].title,
						secondRowCoordinates[i] + legendSymbolWidth / 2 + insidePadding,
						legendYPos + legendHeight / 2 + 4
					);
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
		createCoordinateSet = function (arr) {
			var posY;
			var setOfCoordinates = new Set();
			var arrLength = originalDataY[0].length;
			incrementX = chartWidth / (arrLength - 1);

			for (var k = 0; k < arrLength; k++) {
				if (arr !== null) {
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
			}
			return Array.from(setOfCoordinates);
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
			var numberOfGaps = numberOfBars - 1;
			var barWidth = inputObject.dataPointSize;
			var innerMargin = 5;
			var maxBarWidth =
				(sectionWidth - innerMargin * numberOfGaps) / numberOfBars - 2;
			if (barWidth >= maxBarWidth) {
				barWidth = 7;
			}
			var overlayBoxCorners = {
				topLeft: {
					x: x - width / 2 + barWidth / 2,
					y: y - height - 13,
				},
				bottomLeft: {
					x: x - width / 2 + barWidth / 2,
					y: y - 13,
				},
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
			context.font = inputObject.chartText.fontStyle;
			context.textAlign = "left";
			context.fillText(
				firstText.toUpperCase(),
				overlayBoxCorners.topLeft.x + 5,
				overlayBoxCorners.topLeft.y + (height / 5) * 2,
				width - 25
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
			var allCoordinates = getBarCoordinates();
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

			for (var i = 0; i < coordinates.length; i++) {
				if (coordinates[i] !== null) {
					var currentArr = coordinates[i];
					var currentCoordinateArray = allCoordinates[i];

					for (var k = 0; k < currentArr.length; k++) {
						if (currentArr[k]) {
							var currentItem = currentArr[k];
							var currentTopLeftX = currentCoordinateArray[k].topLeft.x;
							var currentBottomRightX = currentCoordinateArray[k].bottomRight.x;
							var currentTopLeftY = currentCoordinateArray[k].topLeft.y;
							var currentBottomRightY = currentCoordinateArray[k].bottomRight.y;

							if (
								relativeX >= currentTopLeftX &&
								relativeX <= currentBottomRightX &&
								relativeY >= currentTopLeftY &&
								relativeY <= currentBottomRightY
							) {
								drawOverlayBox(
									currentTopLeftX,
									currentTopLeftY,
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
								(relativeX < currentTopLeftX ||
									relativeX > currentBottomRightX ||
									relativeY < currentTopLeftY ||
									relativeY > currentBottomRightY)
							) {
								clearChart();
								drawChartParts(inputObject);
								dataPointIsSelected = null;
							}
						}
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
			context.fillText(
				label.toUpperCase(),
				margin.top + chartHeight / 2,
				canvasWidth / 30
			);
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
			context.beginPath();
			context.lineTo(chartTopLeftCorner.x, margin.top + chartHeight);
			context.lineTo(chartTopRightCorner.x, margin.top + chartHeight);
			context.strokeStyle = inputObject.layoutColor;
			context.lineWidth = 0.5;
			context.stroke();

			context.beginPath();
			context.strokeStyle = inputObject.layoutColor;
			context.lineTo(chartTopLeftCorner.x, chartTopLeftCorner.y);
			context.lineTo(chartTopRightCorner.x, chartTopLeftCorner.y);
			context.stroke();
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
				7 * (margin.top / 10),
				chartWidth
			);
		},
		numberOfVerticalPointsF = function (arr) {
			return arr.length;
		},
		drawXAxisText = function (text) {
			var textPosArr = getSectionStartingPoint();
			var textCenterPos = sectionWidth / 2;
			for (var i = 0; i < text.length; i++) {
				context.fillStyle = inputObject.textColor;
				context.textAlign = "center";
				context.font = inputObject.chartText.fontStyle;
				context.fillText(
					text[i].toUpperCase(),
					textPosArr[i] + textCenterPos,
					margin.top + chartHeight + 25
				);
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
		[531, 42, 231, 142, 222, 192, 49, 233, 123, 139, 144, 192],
		[233, 132, 131, 242, 122, 142, 199, 63, 193, 109, 184, 92],
		[321, 833, 221, 145, 432, 200, 100, 150, 250, 333, 129, 145],
		[221, 133, 321, 445, 132, 100, 400, 450, 350, 233, 429, 445],
	],
	dataYNames: ["Asia", "Europe", "South America", "Africa"],
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
	dataPointSize: 7,
	lineWidth: 2,
};
exampleData = {
	canvasID: "canvas",
	backgroundColor: "white",
	textColor: "#000000",
	layoutColor: "#C8C8C8",
	title: {
		text: "This is an example title text.",
		fontStyle: "18px sans-serif",
		textColor: "#000000",
	},
	subtitle: {
		text: "This is an example subtitle text.",
		fontStyle: "12px sans-serif",
		textColor: "#000000",
	},
	dataYLabel: "This is an example label text",
	dataY: [
		[131, 42, 231, 142, 222, 192, 49, 233, 123, 139, 144, 192],
		[233, 132, 131, 242, 122, 142, 199, 63, 193, 109, 184, 92],
		[233, 432, 231, 442, 312, 842, 499, 433, 123, 439, 444, 492],
	],
	dataYNames: ["Asia", "Europe", "South America"],
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
		"#FF6633",
		"#FFB399",
		"#FF33FF",
		"#FFFF99",
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

var arrayExamples = [
	[25, 5, 32, 41, 53, 66, 47, 62, 43, 85, 66, 44],
	[1233, 4432, 2231, 5442, 4312, 9842, 6499, 5433, 1123, 439, 3444, 5492],
	[233, 432, 231, 442, 312, 842, 499, 433, 123, 439, 444, 492],
	[
		123312,
		4432,
		22231,
		54442,
		154312,
		2842,
		62499,
		53433,
		441123,
		13439,
		453444,
		925492,
	],
	[
		12322,
		6432,
		66231,
		71442,
		43312,
		287342,
		623499,
		534333,
		441123,
		123439,
		99444,
		885492,
	],
	[75, 52, 42, 71, 23, 46, 27, 32, 43, 45, 26, 44],
	[22, 26, 62, 21, 43, 56, 17, 22, 23, 15, 46, 24],
];
