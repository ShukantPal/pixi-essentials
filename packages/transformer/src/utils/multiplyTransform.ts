import { Matrix } from 'pixi.js';

import type { Container } from 'pixi.js';

const tempMatrix = new Matrix();
const tempParentMatrix = new Matrix();
const tempWorldMatrix = new Matrix();

/** Calculates a current global transform without relying on render-time caches. */
export function getGlobalTransform(displayObject: Container, out: Matrix = new Matrix()): Matrix
{
    out.copyFrom(displayObject.localTransform);

    for (let parent = displayObject.parent; parent; parent = parent.parent)
    {
        out.prepend(parent.localTransform);
    }

    return out;
}

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
    _skipUpdate?: boolean,
): void
{
    const worldTransform = getGlobalTransform(displayObject, tempWorldMatrix);
    const parentTransform = displayObject.parent
        ? getGlobalTransform(displayObject.parent, tempParentMatrix)
        : Matrix.IDENTITY;

    tempMatrix.copyFrom(worldTransform);
    tempMatrix.prepend(transform);
    tempMatrix.prepend(parentTransform.invert()); // gets new "local" transform

    displayObject.setFromMatrix(tempMatrix);
}
