// import { Matrix } from '@pixi/math';
import { Matrix, Container, Transform } from "pixi.js";
import { decomposeTransform } from "./decomposeTransform";

// import type { DisplayObject } from '@pixi/display';
interface DisplayObject extends Container {}

const tempMatrix = new Matrix();
const tempParentMatrix = new Matrix();

/**
 * Multiplies the transformation matrix {@code transform} to the display-object's transform.
 *
 * @ignore
 * @param displayObject
 * @param transform
 * @param skipUpdate
 */
export function multiplyTransform(
  displayObject: DisplayObject,
  transform: Matrix,
  skipUpdate?: boolean
): void {
  // if (!skipUpdate)
  // {
  //     const parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;

  //     displayObject.updateTransform();
  //     displayObject.disableTempParent(parent);
  // }

  const worldTransform = displayObject.worldTransform;
  const parentTransform = displayObject.parent
    ? tempParentMatrix.copyFrom(displayObject.parent.worldTransform)
    : Matrix.IDENTITY;

  tempMatrix.copyFrom(worldTransform);
  tempMatrix.prepend(transform);
  tempMatrix.prepend(parentTransform.invert()); // gets new "local" transform

  // decomposeTransform(displayObject.transform, tempMatrix);
  decomposeTransform(
    {
      position: displayObject.position,
      scale: displayObject.scale,
      pivot: displayObject.pivot,
      skew: displayObject.skew,
      rotation: displayObject.rotation,
    } as Transform,
    tempMatrix
  );
}
