import { ColorMatrixFilter } from '@pixi/filter-color-matrix';

/**
 * The luminance-to-red filter stores the luminance of the RGB components into the alpha channel
 * of the texture.
 *
 * @ignore
 */
const l2rFilter = new ColorMatrixFilter();

l2rFilter.matrix = [
    0.33, 0.33, 0.33, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0.33, 0.33, 0.33, 0, 0,
];

export { l2rFilter };
