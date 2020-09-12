# Change Log - @pixi-essentials/transformer

This log was last generated on Sat, 12 Sep 2020 15:13:14 GMT and should not be manually modified.

## 2.1.0
Sat, 12 Sep 2020 15:13:14 GMT

### Minor changes

- Box scaling feature added - allow user to scale the object by dragging the bounding-box edges

## 2.0.13
Wed, 02 Sep 2020 16:11:04 GMT

### Patches

- Prevent Transformer from capturing interaction events when translateEnabled = false. Skip redrawing the Transformer when it is not visible or renderable.

## 2.0.12
Sun, 30 Aug 2020 19:24:19 GMT

### Patches

- commitGroup when translation is done! This fixes the problem where transformcommit was not fired after the user dragged the transformer!

## 2.0.11
Tue, 25 Aug 2020 14:04:16 GMT

### Patches

- Patch flipping behaviour when both x,y axes are flipped

## 2.0.10
Mon, 24 Aug 2020 20:29:11 GMT

### Patches

- Patch handle swapping correctly when flipping along x-axis using a non-middle handles.

## 2.0.8
Mon, 24 Aug 2020 19:21:37 GMT

### Patches

- Remove console.log() statement in scaleGroup()

## 2.0.7
Mon, 24 Aug 2020 19:11:36 GMT

### Patches

- Fix bugs with negative scaling (flipping), clear transformer handles when redrawing, do not allow a scaling factor of 0.

## 2.0.6
Sun, 23 Aug 2020 16:15:49 GMT

### Patches

- Patch stuttering problem occuring due to delayed calculation of handle positions.

## 2.0.5
Thu, 20 Aug 2020 15:34:06 GMT

### Patches

- Add transformType, getGroupBounds APIs

## 2.0.4
Wed, 19 Aug 2020 15:31:07 GMT

### Patches

- transformcommit event

## 2.0.3
Mon, 17 Aug 2020 20:24:17 GMT

### Patches

- Support for projection-transforms, and placement inside scaled/rotated containers.

## 2.0.2
Sun, 16 Aug 2020 19:35:37 GMT

### Patches

- Refactored documentation & event handling, added group translation, options for enabling/disabling specific handles, **skew** transformation, rotation/skew snapping, transformer-handles will redraw on style change.

## 2.0.1
Sat, 15 Aug 2020 22:03:46 GMT

### Patches

- Added handleStyle, wireframeStyle getters/setters

## 2.0.0
Sat, 15 Aug 2020 20:26:58 GMT

### Breaking changes

- y

### Patches

- Fixed UMD builds

