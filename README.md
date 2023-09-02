# PI_ContinuumSubtraction
This is a PixInsight script to subtract a continuum image (eg. Red) from a narrowband image (eg. H-alpha) to obtain a purified narrowband image and subsequently add this back into the continuum to boost line-emission specific signal in broadband images.

## Installation instructions
1. Copy the continuumsubtraction.js file to your Pixinsight installation dir under Pixinsight/scr/scripts/ContinuumSubtraction/ (although any folder will do)
2. In Pixinsight: click SCRIPT > Feature Scripts...
3. In the Feature Scripts dialog: click "Add", locate the script and click "Done"

## Usage
The script can be launched from SCRIPT > Utilities > ContinuumSubtraction.

1. Select the narrowband and continuum image in the respective view lists
2. Set a value for Q

Theoretically, Q can be calculated as follows:
Q = (Wn * Tn) / (Wc * Tc) where Wn is the bandwidth of the narrowband filter, Wc is the bandwidth of the broadband/continuum filter, Tn is the exposure time of the narrowband image, and Tc is the exposure time of the continuum image.
In practice, it is easier to simply try different values and find the ideal value empirically. If your result has too much black clipping, with loss of narrowband structures, Q is too high. If the result resembles still your original Ha image (eg. galaxy core is still cloudy), it is too low and you can probably go higher. If you are planning to add it back into the broadband channel, you don't have to worry about any black clipping. Those regions will simply receive no boost which is in fact beneficial as no new noise is added. **You want to find a balance between having an as dark as possible background, but still retain the interesting structures.**

3. Click SUBTRACT. A new image window will open with the result
4. Optional: for visualization, you can apply an STF to the result without closing the script by selecting the result file in the "select continuum subtracted view" selector and click the button to take the STF from the original narrowband image. This allows you to inspect the image to optimize the Q value from step 2. Note that this STF will be a bit brighter compared to when you would apply auto STF on the result, so might exagerate the visible noise.

5. Once you are happy with the purified image, select it in "select continuum subtracted view"
6. Set a value for B, this is the boost factor and depends on your taste. Higher values add more of the purified narrowband to the broadband image
7. Click BOOST. A new image window will open with the result

8. Optional: for visualization, you can apply an STF to the result without closing the script by selecting the result file in the "select boosted view" selector and click the button to take the STF from the original broadband image. This allows you to inspect the image to optimize the B value from step 6. Note that this STF will be a bit brighter compared to when you would apply auto STF on the result, so might exagerate the visible noise.

A workflow suggestion is to run the script on gradient-corrected images that have had their stars removed, and add the continuum image stars back to the final boosted image. From then on it can be treated as a normal broadband channel image.

