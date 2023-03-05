# Change Log - @pixi-essentials/transformer

This log was last generated on Sun, 05 Mar 2023 03:28:18 GMT and should not be manually modified.

## 3.0.0
Sun, 05 Mar 2023 03:28:18 GMT

### Breaking changes

- Upgrade to PixiJS 7

## 2.5.6
Sat, 21 May 2022 23:41:14 GMT

### Patches

- Fix transformer handles on mobile

## 2.5.5
Tue, 07 Sep 2021 01:18:24 GMT

### Patches

- New lockAspectRatio feature

## 2.5.4
Fri, 30 Jul 2021 18:24:29 GMT

### Patches

- Fix type declarations not generated for 2.5.3

## 2.5.3
Fri, 30 Jul 2021 18:00:26 GMT

### Patches

- Support for passing the stage for listening to pointermove events. This is useful when you're using the new EventSystem or moveWhenInside optimization with the interaction manager.

## 2.5.2
Sun, 18 Jul 2021 02:26:58 GMT

### Patches

- Fix transformer blocking pointermove events even when the user is not editing the transform group

## 2.5.1
Sat, 17 Jul 2021 20:49:05 GMT

### Patches

- Fix issues with cursors and handle hit-testing when using projection transforms

## 2.5.0
Sun, 11 Jul 2021 20:57:07 GMT

### Minor changes

- Add new "cursors" option, allowing custom cursors for box-rotation/box-scaling areas.

## 2.4.0
Sun, 27 Jun 2021 23:47:01 GMT

### Minor changes

- New "cursors" option for custom CSS cursors for box rotation/scaling areas

## 2.3.3
Sun, 16 May 2021 01:04:10 GMT

### Patches

- Fix last release that wasn't built before releasing

## 2.3.2
Sun, 16 May 2021 01:00:19 GMT

### Patches

- Add boundingBoxes="none" option to not draw anything visible in the wireframe at all

## 2.3.1
Mon, 10 May 2021 01:32:07 GMT

### Patches

- Add `boundingBoxes` option, where "groupOnly" won't draw the bounding boxes for individual items

## 2.3.0
Wed, 17 Mar 2021 16:12:19 GMT

### Minor changes

- Upgrade to PixiJS 6

## 2.2.5
Sat, 27 Feb 2021 19:23:00 GMT

_Version update only_

## 2.2.4
Sun, 10 Jan 2021 19:40:19 GMT

### Patches

- Fix box rotation interference with translation (dragging) when the group was sufficiently small. Also, fixed handle positioning problems.

## 2.2.3
Thu, 31 Dec 2020 22:56:47 GMT

### Patches

- Add lazyMode

## 2.2.2
Sat, 05 Dec 2020 21:58:39 GMT

### Patches

- Made boxScaling handle higher priority than boxRotation handles. Also, the outer tolerance of boxScaling handles was increased by 50% to account for long arrow cursors. These fix the problem where the object would rotate instead of scale at tiny sizes.

## 2.2.1
Thu, 17 Sep 2020 19:03:40 GMT

### Patches

- Adds cursors for box-scaling by making the box-scaling regions interactive

## 2.2.0
Thu, 17 Sep 2020 18:23:47 GMT

### Minor changes

- Box-rotation feature added

## 2.1.4
Wed, 16 Sep 2020 16:09:33 GMT

### Patches

- Rebuild @pixi-essentials/transformer 😅

## 2.1.3
Wed, 16 Sep 2020 15:53:04 GMT

### Patches

- Make box-scaling work even with scaleEnabled = false.

## 2.1.1
Sat, 12 Sep 2020 16:36:52 GMT

### Patches

- Patch to capture box-scaling even when translateEnabled=false

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

