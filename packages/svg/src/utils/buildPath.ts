import { FILL_RULE } from './Path';
import * as libtess from 'libtess';

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

            const tessy = new libtess.GluTesselator();
            const outVerts = [];

            /* eslint-disable no-inner-declarations, @typescript-eslint/no-unused-vars */
            function vertexCallback(data: number[], polyVertArray: number[]): void
            {
                // console.log(data[0], data[1]);
                polyVertArray[polyVertArray.length] = data[0];
                polyVertArray[polyVertArray.length] = data[1];
            }
            function begincallback(type: number): void
            {
                if (type !== libtess.primitiveType.GL_TRIANGLES) {
                    console.warn(`expected TRIANGLES but got type: ${type}`);
                }
            }
            function errorcallback(errno: number): void
            {
                console.error('error callback');
                console.error(`error number: ${errno}`);
            }
            // callback for when segments intersect and must be split
            function combinecallback(coords: number[], _data: any, _weight: any): number[]
            {
                // console.log('combine callback');
                return [coords[0], coords[1], coords[2]];
            }
            function edgeCallback(_flag: number): void
            {
                // don't really care about the flag, but need no-strip/no-fan behavior
                // console.log('edge flag: ' + flag);
            }
            /* eslint-enable no-inner-declarations */

            tessy.gluTessProperty(libtess.gluEnum.GLU_TESS_WINDING_RULE,
                path.fillRule === FILL_RULE.EVENODD
                    ? libtess.windingRule.GLU_TESS_WINDING_ODD
                    : libtess.windingRule.GLU_TESS_WINDING_NONZERO);
            tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
            tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_BEGIN, begincallback);
            tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_ERROR, errorcallback);
            tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combinecallback);
            tessy.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);

            tessy.gluTessNormal(0, 0, 1);
            tessy.gluTessBeginPolygon(outVerts);

            for (let i = 0; i < contours.length; i++)
            {
                const contour = contours[i];

                tessy.gluTessBeginContour();

                for (let j = 0; j < contour.length;)
                {
                    const x = contour[j++];
                    const y = contour[j++];
                    const data = [x, y, 0];

                    tessy.gluTessVertex(data, data);
                }

                tessy.gluTessEndContour();
            }

            tessy.gluTessEndPolygon();

            const verts = graphicsGeometry.points;
            const indices = graphicsGeometry.indices;
            const ibase = verts.length / 2;

            for (let i = 0; i < outVerts.length;)
            {
                verts.push(outVerts[i++], outVerts[i++]);
            }
            for (let i = 0; i < outVerts.length / 2; i++)
            {
                indices.push(i + ibase);
            }
        }
        catch (e)
        {
            console.error(e);
        }
    },
};
