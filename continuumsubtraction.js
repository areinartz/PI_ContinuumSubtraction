// This is a script that takes a narrowband image and a corresponding continuum image
// and subtracts the later from the former


#feature-id    Utilities > Continuum Subtraction

#feature-info  Script to subtract continuum from narrowband and boost the purified signal in the continuum

#include <pjsr/Sizer.jsh>          // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/NumericControl.jsh> // needed to instantiate the NumericControl control

// define a global variable containing script parameters
var CSParameters = {
   QVal: 0,
   targetView1: undefined,
   targetView2: undefined,
   targetView3: undefined,
   targetView4: undefined,
   boostVal: 0
}

// function to apply the pixelmath for the subtraction
function applyCS(view1, view2, Q) {

   Console.writeln(view1.id, view2.id, Q);
   Console.writeln(view1.id + "-Q*("+ view2.id + "-med(" + view2.id + "))");
   Console.writeln("Q = " + Q);

   var P = new PixelMath;
   P.expression = view1.id + "-Q*("+ view2.id + "-med(" + view2.id + "))";
   P.expression1 = "";
   P.expression2 = "";
   P.expression3 = "";
   P.useSingleExpression = true;
   P.symbols = "Q = " + Q;
   P.clearImageCacheAndExit = false;
   P.cacheGeneratedImages = false;
   P.generateOutput = true;
   P.singleThreaded = false;
   P.optimization = true;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.rescaleLower = 0;
   P.rescaleUpper = 1;
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.createNewImage = true;
   P.showNewImage = true;
   P.newImageId = "purifiedNB";
   P.newImageWidth = 0;
   P.newImageHeight = 0;
   P.newImageAlpha = false;
   P.newImageColorSpace = PixelMath.prototype.SameAsTarget;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   /*
    * Read-only properties
    *
   P.outputData = [ // globalVariableId, globalVariableRK, globalVariableG, globalVariableB
   ];
    */
   P.executeOn(view1)

}


// Function to apply the STF from one image to another
function transferSTF(destView, sourceView) {

   var P = new ScreenTransferFunction;
   P.STF = [ // c0, c1, m, r0, r1
      [sourceView.stf[0][1], 1.00000, sourceView.stf[0][0], 0.00000, 1.00000],
      [sourceView.stf[0][1], 1.00000, sourceView.stf[0][0], 0.00000, 1.00000],
      [sourceView.stf[0][1], 1.00000, sourceView.stf[0][0], 0.00000, 1.00000],
      [0.00000, 1.00000, 0.50000, 0.00000, 1.00000]
   ];
   P.interaction = ScreenTransferFunction.prototype.Grayscale;

   P.executeOn(destView);

}


// Function to apply the pixelmath for the boost
function applyBoost(contView, subView, boostVal) {
   var P = new PixelMath;
   P.expression = contView.id + "+("+subView.id+"-Med("+subView.id+"))*"+boostVal;
   P.expression1 = "";
   P.expression2 = "";
   P.expression3 = "";
   P.useSingleExpression = true;
   P.symbols = "";
   P.clearImageCacheAndExit = false;
   P.cacheGeneratedImages = false;
   P.generateOutput = true;
   P.singleThreaded = false;
   P.optimization = true;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.rescaleLower = 0;
   P.rescaleUpper = 1;
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.createNewImage = true;
   P.showNewImage = true;
   P.newImageId = "boosted";
   P.newImageWidth = 0;
   P.newImageHeight = 0;
   P.newImageAlpha = false;
   P.newImageColorSpace = PixelMath.prototype.SameAsTarget;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   /*
    * Read-only properties
    *
   P.outputData = [ // globalVariableId, globalVariableRK, globalVariableG, globalVariableB
   ];
    */

   P.executeOn(contView)

}


/*
 * Construct the script dialog interface
 */
function CSDialog() {
   this.__base__ = Dialog;
   this.__base__();

   // let the dialog to be resizable by dragging its borders
   this.userResizable = true;

   // set the minimum width of the dialog
   this.scaledMinWidth = 400;

   // create a title area
   // 1. sets the formatted text
   // 2. sets read only, we don't want to modify it
   // 3. sets the background color
   // 4. sets a fixed height, the control can't expand or contract
   this.title = new TextBox(this);
   this.title.text = "<b>Continuum Subtraction</b><br><br>This script subtracts" +
                     " a continuum image from a narrowband image with the following formula:<br>" +
                     "<br><i>narrowband - Q * (continuum - med(continuum))</i><br>"+
                     "<br>It also boosts the purified image back into the continuum with the following formula:"+
                     "<br><br><i>continuum + B * (purified - med(purified))</i>";
   this.title.readOnly = true;
   this.title.minHeight = 180;
   this.title.maxHeight = 180;

   // add a view picker
   // 1. retrieve the whole view list (images and previews)
   // 2. sets the initially selected view
   // 3. sets the selection callback: the target view becomes the selected view
   this.viewList1Lab = new Label(this);
   this.viewList1Lab.useRichText = true;
   this.viewList1Lab.text = "<b>Narrowband:</b>";
   this.viewList1 = new ViewList(this);
   this.viewList1.getAll();
   this.viewList1.toolTip = "Narrowband image";
   CSParameters.targetView1 = this.viewList1.currentView;
   this.viewList1.onViewSelected = function (view) {
      CSParameters.targetView1 = view;
   }

   // second view picker
   this.viewList2 = new ViewList(this);
   this.viewList2Lab = new Label(this);
   this.viewList2Lab.useRichText = true;
   this.viewList2Lab.text = "<b>Continuum:</b>";
   this.viewList2.getAll();
   this.viewList2.toolTip = "Continuum image";
   CSParameters.targetView2 = this.viewList2.currentView;
   this.viewList2.onViewSelected = function (view) {
      CSParameters.targetView2 = view;
   }

   // create the input slider
   // 1. sets the text
   // 2. stes a fixed label width
   // 3. sets the range of the value
   // 4. sets the value precision (number of decimal digits)
   // 5. sets the range of the slider
   // 6. sets a tooltip text
   // 7. defines the behaviour on value change
   this.QValControl = new NumericControl(this);
   this.QValControl.label.text = "Q = ";
   this.QValControl.label.width = 60;
   this.QValControl.setRange(0, 1);
   this.QValControl.setPrecision( 3 );
   this.QValControl.slider.setRange( 0, 1000 );
   this.QValControl.toolTip = "<p>Sets the value of Q.</p>";
   this.QValControl.onValueUpdated = function( value )
   {
      CSParameters.QVal = value;
   };

   // prepare the execution button
   // 1. sets the text
   // 2. sets a fixed width
   // 3. sets the onClick function
   this.execButton = new PushButton(this);
   this.execButton.text = "SUBTRACT";
   this.execButton.width = 40;
   this.execButton.onClick = () => {
      // this.ok();
      applyCS(CSParameters.targetView1, CSParameters.targetView2, CSParameters.QVal);
   };

   // third view picker to apply STF
   this.viewList3 = new ViewList(this);
   this.viewList3Lab = new Label(this);
   this.viewList3Lab.useRichText = true;
   this.viewList3Lab.text = "<b>Select continuum subtracted view: </b>";
   this.viewList3.getAll();
   this.viewList3.toolTip = "Continuum subtracted view";
   CSParameters.targetView3 = this.viewList3.currentView;
   this.viewList3.onViewSelected = function (view) {
      CSParameters.targetView3 = view;
   }

   // prepare the execution button to apply STF to subtracted image
   // 1. sets the text
   // 2. sets a fixed width
   // 3. sets the onClick function
   this.stfButton = new PushButton(this);
   this.stfButton.text = "Optional: apply narrowband STF";
   this.stfButton.width = 40;
   this.stfButton.onClick = () => {
      // this.ok();
      transferSTF(CSParameters.targetView3, CSParameters.targetView1);
   };

   // create the slider for the line emission boost value
   // 1. sets the text
   // 2. stes a fixed label width
   // 3. sets the range of the value
   // 4. sets the value precision (number of decimal digits)
   // 5. sets the range of the slider
   // 6. sets a tooltip text
   // 7. defines the behaviour on value change
   this.boostControl = new NumericControl(this);
   this.boostControl.label.text = "B = ";
   this.boostControl.label.width = 60;
   this.boostControl.setRange(0, 20);
   this.boostControl.setPrecision( 1 );
   this.boostControl.slider.setRange( 0, 40 );
   this.boostControl.toolTip = "<p>Controls how much of the continuum subtracted narrowband is added to the synthetic continuum image.</p>";
   this.boostControl.onValueUpdated = function( value )
   {
      CSParameters.boostVal = value;
   };

   // prepare the execution button to apply boost
   // 1. sets the text
   // 2. sets a fixed width
   // 3. sets the onClick function
   this.boostButton = new PushButton(this);
   this.boostButton.text = "BOOST";
   this.boostButton.width = 40;
   this.boostButton.onClick = () => {
      // this.ok();
      applyBoost(CSParameters.targetView2, CSParameters.targetView3, CSParameters.boostVal);
   };

   // fourth view picker to apply STF to boosted
   this.viewList4 = new ViewList(this);
   this.viewList4Lab = new Label(this);
   this.viewList4Lab.useRichText = true;
   this.viewList4Lab.text = "<b>Select boosted view: </b>";
   this.viewList4.getAll();
   this.viewList4.toolTip = "Boosted view";
   CSParameters.targetView4 = this.viewList4.currentView;
   this.viewList4.onViewSelected = function (view) {
      CSParameters.targetView4 = view;
   }

   // prepare the execution button to apply STF to boosted image
   // 1. sets the text
   // 2. sets a fixed width
   // 3. sets the onClick function
   this.stfButton2 = new PushButton(this);
   this.stfButton2.text = "Optional: apply continuum STF";
   this.stfButton2.width = 40;
   this.stfButton2.onClick = () => {
      // this.ok();
      transferSTF(CSParameters.targetView4, CSParameters.targetView2);
   };

   // text with signature
   this.signature = new Label(this);
   this.signature.useRichText = true;
   this.signature.text = "<i>Alexander Reinartz - 2023</i>";

   // layout the dialog
   this.sizer = new VerticalSizer;
   this.sizer.margin = 10;
   this.sizer.add(this.title);
   this.sizer.addSpacing(10);
   this.sizer.add(this.viewList1Lab);
   this.sizer.add(this.viewList1);
   this.sizer.addSpacing(10);
   this.sizer.add(this.viewList2Lab);
   this.sizer.add(this.viewList2);
   this.sizer.addSpacing(10);
   this.sizer.add(this.QValControl);
   this.sizer.add(this.execButton);
   this.sizer.setAlignment(this.execButton, Align_Center);
   this.sizer.addSpacing(20);
   this.sizer.add(this.viewList3Lab);
   this.sizer.add(this.viewList3);
   this.sizer.addSpacing(2);
   this.sizer.add(this.stfButton);
   this.sizer.addSpacing(10);
   this.sizer.add(this.boostControl);
   this.sizer.add(this.boostButton);
   this.sizer.setAlignment(this.boostButton, Align_Center);
   this.sizer.add(this.viewList4Lab);
   this.sizer.add(this.viewList4);
   this.sizer.addSpacing(2);
   this.sizer.add(this.stfButton2);
   this.sizer.addSpacing(10);
   this.sizer.add(this.signature);
   this.sizer.addStretch();
}

CSDialog.prototype = new Dialog;

function showDialog() {
   let dialog = new CSDialog;
   return dialog.execute();
}

function main() {
   Console.hide();
   let retVal = showDialog();
   // Console.hide();
   Console.writeln("Returned value: ", retVal)
   // Console.hide();
   if (retVal == 1) {
      // perform
      Console.writeln("Parameters: " + CSParameters.QVal, " ",
         CSParameters.targetView1.id, " ", CSParameters.targetView2.id);
      // below function was moved to the execbutton onclick as to not close the dialog each time
      // applyCS(CSParameters.targetView1, CSParameters.targetView2, CSParameters.QVal)
   } else {
      // canceled
   }
}

main();
