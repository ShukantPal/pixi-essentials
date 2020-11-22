import { FILL_RULE } from './Path';
import Tess2 from 'tess2';

import type { GraphicsGeometry } from '@pixi/graphics';
import type { Path } from './Path';

// Not used yet, tess2 isn't so good.
export const buildPath = {
    build(): void
    {
        /* This method is intentionally blank. */
    },
    triangulate(graphicsData: any, graphicsGeometry: GraphicsGeometry): void
    {
        try
        {
            const path = graphicsData.shape as Path;
            const contours = path.contours
                .filter((c) => c.length > 0)
                .filter((c) => (c.find((e) => isNaN(e)) === undefined));

            const {
                vertices: pverts,
                elements: pindices,
            } = Tess2.tesselate({
                contours,
                windingRule: path.fillRule === FILL_RULE.NONZERO ? Tess2.WINDING_NONZERO : Tess2.WINDING_ODD,
                elementType: Tess2.POLYGONS,
                polySize: 3,
                vertexSize: 2,
            });

            console.log("__SUCESS_")

            // @ts-expect-error
            const verts = graphicsGeometry.points;
            // @ts-expect-error
            const indices = graphicsGeometry.indices;
            const ibase = verts.length / 2;

            for (let i = 0; i < pverts.length; i++)
            {
                verts.push(pverts[i]);
            }
            for (let i = 0; i < pindices.length; i++)
            {
                indices.push(pindices[i] + ibase);
            }
        }
        catch (e)
        {
            console.error(e);
        }
    },
};
