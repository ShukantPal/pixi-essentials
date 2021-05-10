import { Matrix } from '@pixi/math';

const tempMatrix = new Matrix();

/**
 * @ignore
 * @param angle
 * @returns a horizontal skew matrix
 */
export function createHorizontalSkew(angle: number): Matrix
{
    const matrix = tempMatrix.identity();

    matrix.c = Math.tan(angle);

    return matrix;
}

/**
 * @ignore
 * @param angle
 * @returns a vertical skew matrix
 */
export function createVerticalSkew(angle: number): Matrix
{
    const matrix = tempMatrix.identity();

    matrix.b = Math.tan(angle);

    return matrix;
}
