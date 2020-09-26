export const EllipticArcUtils = {
    /**
     * Approximates the arc length of an elliptical arc using numerical integration.
     *
     * @ignore
     * @param rx - The radius along the x-axis.
     * @param ry - The radius along the y-axis.
     * @param startAngle - The starting eccentric angle, in radians.
     * @param sweepAngle - The change in eccentric angle, in radians. This should be in the range (-2π, 2π).
     * @param da - The size of angle intervals used in the Riemann sum.
     * @see https://math.stackexchange.com/questions/433094/how-to-determine-the-arc-length-of-ellipse
     */
    calculateArcLength(rx: number, ry: number, startAngle: number, sweepAngle: number, da = 0.05): number
    {
        // We are integrating r(x) = √(a²sin²t + b²cos²t), which is used in the form √(a² + (b² - a²)cos²t)
        // to reduce computations.

        const sweepSign = Math.sign(sweepAngle);
        const sweepAbsolute = Math.abs(sweepAngle);
        const rx2 = rx * rx;
        const ry2 = ry * ry;
        const rdiff2 = ry2 - rx2;

        let arcLength = 0;

        // Samples are taken in the middle of each interval
        for (let a = startAngle + (da * 0.5), delta = 0; delta < sweepAbsolute; a += sweepSign * da, delta += da)
        {
            const cos = Math.cos(a);
            const cos2 = cos * cos;
            const sample = Math.sqrt(rx2 + (rdiff2 * cos2));

            arcLength += da * sample;
        }

        return arcLength;
    },
};
