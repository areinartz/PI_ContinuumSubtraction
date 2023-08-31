# PI_ContinuumSubtraction
This is a PixInsight script to subtract a continuum image (eg. Red) from a narrowband image (eg. H-alpha) to obtain a purified narrowband image and subsequently add this back into the continuum to boost line-emission specific signal in broadband images.

## Installation instructions
1. Copy the script to your hard drive (eg. in your Pixinsight installation dir under Pixinsight/scr/scripts/ContinuumSubtraction/ )
2. In Pixinsight: click SCRIPT > Feature Scripts...
3. In the Feature Scripts dialog: click "Add", locate the script and click "Done"

## Usage
The script can be launched from SCRIPT > Utilities > Continuum Subtraction.

A workflow suggestion is to run the script on gradient-corrected images that have had their stars removed, and add the continuum image stars back to the final boosted image.

