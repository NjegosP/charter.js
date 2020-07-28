var Chart = function (input) {
  var context,
    canvasHeight,
    canvasWidth,
    canvasMiddle = {},
    coordinates = [],
    colors = [],
    inputObject = {},
    dataPointIsSelected = null,
    margin,
    render = function (input) {
      var canvas = document.getElementById(input.canvasID);
      canvasHeight = canvas.height;
      canvasWidth = canvas.width;
      inputObject = getInputObj(input);
      canvas.width = 2400; // this is a hardcoded fix for blurry canvas
      canvas.height = 1200; // fixes the problem to some extent
      canvas.style.width = "1200px"; // should be looked into further
      canvas.style.height = "600px"; //
      context = canvas.getContext("2d");
      context.scale(2, 2); // scaling the canvas, to fix the blurry canvas
      canvasMiddle = { x: canvasWidth / 2, y: canvasHeight / 2 };
      colors = getColors(input.colors);
      drawChartParts(input);
      canvas.addEventListener("mousemove", mouseMove, false);
      drawPieChart();
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
    },
    drawChartBackground = function () {
      context.fillStyle = inputObject.backgroundColor;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
    },
    drawPiePart = function (x, y, radius, startAng, endAng, color) {
      var startAngle = startAng * Math.PI;
      var endAngle = endAng * Math.PI;
      context.beginPath();
      context.arc(x, y, radius, endAngle, startAngle, true);
      context.lineTo(x, y);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    },
    drawPieChart = function () {
      var angles = calculatePercentage();
      var currentAngle = 0;
      for (var i = 0; i < inputObject.dataY.length; i++) {
        drawPiePart(
          canvasMiddle.x,
          canvasMiddle.y,
          inputObject.radius + 50,
          currentAngle,
          currentAngle + 0.005 + angles[i],
          inputObject.colors[i]
        );

        currentAngle = currentAngle + angles[i];
      }
    },
    drawLegend = function () {
      drawLegendItems();
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
    drawLegendItems = function () {
      var addAllCharNumbers = function (acc, num) {
        if (acc < num) {
          acc = num;
        }
        return acc;
      };
      var letterCount = getCharacterNumbers();
      var theLongestWord = letterCount.reduce(addAllCharNumbers) * 7;
      var numOfElements = inputObject.dataY.length;
      var legendSymbolWidth = 10;
      var insidePadding = legendSymbolWidth / 2;
      var legendWidth =
        theLongestWord * numOfElements +
        legendSymbolWidth * numOfElements +
        insidePadding * numOfElements;
      var margin = (canvasWidth - legendWidth) / 2;
      var legendYPos = canvasHeight - canvasHeight / 17;
      var legendHeight = canvasHeight / 20;
      var xcoordinates = [margin];
      var counter = theLongestWord;
      var firstRowCounter = theLongestWord;
      var breakPoint = Math.round(numOfElements / 2);
      var secondRowCounter = theLongestWord;
      var drawingCounter = breakPoint;
      var secondCoordinateCounter = numOfElements - breakPoint + 2;

      for (var i = 0; i < numOfElements - 1; i++) {
        xcoordinates.push(
          margin +
            (legendSymbolWidth / 2) * (i + 2) +
            insidePadding * (i + 2) +
            counter
        );
        counter += theLongestWord;
      }
      console.log(xcoordinates);
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
      } else if (legendWidth > canvasWidth * 0.9) {
        var newLegendWidth = legendWidth / 2;
        var newMargin = (canvasWidth - newLegendWidth) / 2;
        var firstRowCoordinates = [newMargin];
        var secondRowCoordinates = [newMargin];
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
        for (var i = 0; i < numOfElements - breakPoint - 1; i++) {
          secondRowCoordinates.push(
            newMargin +
              (legendSymbolWidth / 2) * (i + 2) +
              insidePadding * (i + 2) +
              secondRowCounter
          );
          secondRowCounter += letterCount[secondCoordinateCounter] * 8;
          secondCoordinateCounter++;
        }
        console.log(secondRowCoordinates);
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
        topLeft: { x: x - width / 2, y: y - height - 18 },
        bottomLeft: { x: x - width / 2, y: y - 18 },
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
      var topLeftCornerPosition = { x: r.x, y: r.y };
      var posX = event.clientX; // Get the horizontal coordinate
      var posY = event.clientY; // Get the vertical coordinate
      var relativeX = posX - topLeftCornerPosition.x;
      var relativeY = posY - topLeftCornerPosition.y;

      for (var i = 0; i < coordinates.length; i++) {
        var currentArr = coordinates[i];
        var radius = inputObject.dataPointSize;
        for (var k = 0; k < currentArr.length; k++) {
          var currentItem = currentArr[k];
          var currentX = currentArr[k].x;
          var currentY = currentArr[k].y;

          if (
            relativeX >= currentX - inputObject.dataPointSize &&
            relativeX <= currentX + inputObject.dataPointSize &&
            relativeY <= currentY + inputObject.dataPointSize &&
            relativeY >= currentY - inputObject.dataPointSize
          ) {
            drawCircle(currentX, currentY, radius * 1.3, colors[i]);
            drawCircle(currentX, currentY, radius * 0.8, "white");
            drawOverlayBox(
              currentX,
              currentY,
              chartWidth / 6,
              chartHeight / 12,
              colors[i],
              inputObject.backgroundColor,
              inputObject.dataX[k],
              inputObject.dataYNames[i] + ": " + inputObject.dataY[i][k]
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
      context.fillText(label.toUpperCase(), canvasHeight / 2, canvasWidth / 30);
      context.textAlign = "center";
      context.restore();
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
    { title: "Asia", data: 245 },
    { title: "Africa", data: 145 },
    { title: "South America", data: 345 },
    { title: "Europe", data: 545 },
    { title: "North America", data: 225 },
    { title: "Australia", data: 215 },
    // { title: "Antarctica", data: 45 },
    // { title: "North America", data: 225 },
    // { title: "Australia", data: 215 },
    // { title: "Antarctica", data: 45 },
  ],
  radius: 190,

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
  ],
};
Chart(exampleData2);
