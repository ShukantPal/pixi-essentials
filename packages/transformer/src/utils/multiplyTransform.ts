import { Matrix } from 'pixi.js';

import type { Container } from 'pixi.js';

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
    displayObject: Container,
    transform: Matrix,
    skipUpdate?: boolean,
): void
{
    if (!skipUpdate)
    {
        displayObject.getBounds();
    }

    const worldTransform = displayObject.worldTransform;
    const parentTransform = displayObject.parent
        ? tempParentMatrix.copyFrom(displayObject.parent.worldTransform)
        : Matrix.IDENTITY;

    tempMatrix.copyFrom(worldTransform);
    tempMatrix.prepend(transform);
    tempMatrix.prepend(parentTransform.invert()); // gets new "local" transform

    displayObject.setFromMatrix(tempMatrix);
}
