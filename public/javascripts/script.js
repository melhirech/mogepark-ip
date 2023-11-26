function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];
  
    for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
  
  let loadImageOnCanvasAndThenWriteText = (
    canvas,
    imageUrl,
    textToWrite,
    textStyleOptions,
  ) => {
    // Get the 2D Context from the canvas
    let ctx = canvas.getContext("2d");
  
    // Create a new Image
    let img = new Image();
  
    // Setting up a function with the code to run after the image is loaded
    img.onload = () => {
      // Once the image is loaded, we will get the width & height of the image
      let loadedImageWidth = img.width;
      let loadedImageHeight = img.height;
  
      // Set the canvas to the same size as the image.
      canvas.width = loadedImageWidth;
      canvas.height = loadedImageHeight;
  
      // Draw the image on to the canvas.
      ctx.drawImage(img, 0, 0);
  
      // Set all the properties of the text based on the input params
    //   ctx.font = `${textStyleOptions.fontSize}px ${textStyleOptions.fontFamily}`;
      ctx.fillStyle = textStyleOptions.textColor;
      ctx.textAlign = textStyleOptions.textAlign;
      ctx.font = "bold 30px sans";
      ctx.fillText(textToWrite, ...getPosition(loadedImageWidth, loadedImageHeight));
    //   ctx.fillText("Hello world", loadedImageWidth / 2, loadedImageHeight / 2);


      // Setting this so that the postion of the text can be set
      // based on the x and y cord from the top right corner
      ctx.textBaseline = "center";
    };
  
    // Now that we have set up the image "onload" handeler, we can assign
    // an image URL to the image.
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imageUrl;
  };

  function imageLoadedHandler(imageUrl) {

    // Setting up the canvas
    let theCanvas = document.getElementById("myCanvas");

    // Some image URL..
    // let imageUrl = '/images/image01.jpg'
  
    let textStyleOptions = {
      fontSize: 30,
      textColor: "rgba(255, 255, 255)",
      textAlign: "left",
      textWeight: 500
    };
  
    let textToWrite = 'mogepark.com'
  
    // let xCordOfText = 10;
    // let yCordOfText = 10;
  
    // let textBoundingBoxWidth = 350;

    const getPosition = (w, h) => textStyleOptions.textAlign === 'center' ? [w / 2, h / 2] : [10, h - 12]
  
    // Load image on the canvas & then write text
    loadImageOnCanvasAndThenWriteText(
      theCanvas,
      imageUrl,
      textToWrite,
      textStyleOptions,
      getPosition
    );
  }
    

  function saveImage(idCanvas) {
    var canvas = document.getElementById(idCanvas);
    image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = "my-image.png";
    link.href = image;
    link.click();
}