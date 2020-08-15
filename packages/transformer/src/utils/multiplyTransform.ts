/// <reference path="../types.d.ts" />

import { Matrix } from '@pixi/math';
import { decomposeTransform } from './decomposeTransform';

import type { DisplayObject } from '@pixi/display';

const tempMatrix = new Matrix();
const tempParentMatrix = new Matrix();

/**
 * Multiplies the transformation matrix {@code transform} to the display-object's transform.
 *
 * @param displayObject
 * @param transform
 * @param skipUpdate
 */
export function multiplyTransform(displayObject: DisplayObject, transform: Matrix, skipUpdate?: boolean): void
{
    if (!skipUpdate)
    {
        const parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;

        displayObject.updateTransform();
        displayObject.disableTempParent(parent);
    }

    const worldTransform = displayObject.worldTransform;
    const parentTransform = displayObject.parent
        ? tempParentMatrix.copyFrom(displayObject.parent.worldTransform)
        : Matrix.IDENTITY;

    tempMatrix.copyFrom(worldTransform);
    tempMatrix.prepend(transform);
    tempMatrix.prepend(parentTransform.invert());// gets new "local" transform

    decomposeTransform(displayObject.transform, tempMatrix);
}
