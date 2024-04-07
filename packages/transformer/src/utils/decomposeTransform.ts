// import type {Transform, Matrix, Point} from '@pixi/math';
import type {Transform, Matrix, Point} from 'pixi.js';

/**
 * Decomposes the matrix into transform, while preserving rotation & the pivot.
 *
 * @ignore
 * @param transform
 * @param matrix
 * @param rotation
 * @param pivot
 */
export function decomposeTransform(
    transform: Transform,
    matrix: Matrix,
    rotation?: number,
    pivot: Point = transform.pivot,
): Transform
{
    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;

    const skewX = -Math.atan2(-c, d);
    const skewY = Math.atan2(b, a);

    rotation = rotation !== undefined && rotation !== null ? rotation : skewY;

    // set pivot
    transform.pivot.set(pivot.x, pivot.y);

    // next set rotation, skew angles
    transform.rotation = rotation;
    transform.skew.x = rotation + skewX;
    transform.skew.y = -rotation + skewY;

    // next set scale
    transform.scale.x = Math.sqrt((a * a) + (b * b));
    transform.scale.y = Math.sqrt((c * c) + (d * d));

    // next set position
    transform.position.x = matrix.tx + ((pivot.x * matrix.a) + (pivot.y * matrix.c));
    transform.position.y = matrix.ty + ((pivot.x * matrix.b) + (pivot.y * matrix.d));

    return transform;
}
