/**
 * Provides the exponential moving average of a sequence.
 *
 * Ignored because not directly exposed.
 *
 * @internal
 * @ignore
 * @class
 */
export class AverageProvider
{
    private _history: number[];
    private _decayRatio: number;

    private _currentIndex: number;
    private _average: number;

    /**
     * @ignore
     * @param {number} windowSize - no. of inputs used to calculate window
     * @param {number} decayRatio - quantifies the weight of previous values (b/w 0 and 1)
     */
    constructor(windowSize: number, decayRatio: number)
    {
        this._history = new Array(windowSize);
        this._decayRatio = decayRatio;

        this._currentIndex = 0;

        for (let i = 0; i < windowSize; i++)
        {
            this._history[i] = 0;
        }
    }

    /**
     * @ignore
     * @param {number} input - the next value in the sequence
     * @returns {number} - the moving average
     */
    next(input: number): number
    {
        const { _history: history, _decayRatio: decayRatio } = this;
        const historyLength = history.length;

        this._currentIndex = this._currentIndex < historyLength - 1 ? this._currentIndex + 1 : 0;
        history[this._currentIndex] = input;

        let weightedSum = 0;
        let weight = 0;

        for (let i = this._currentIndex + 1; i < historyLength; i++)
        {
            weightedSum = (weightedSum + history[i]) * decayRatio;
            weight = (weight + 1) * decayRatio;
        }
        for (let i = 0; i <= this._currentIndex; i++)
        {
            weightedSum = (weightedSum + history[i]) * decayRatio;
            weight = (weight + 1) * decayRatio;
        }

        this._average = weightedSum / weight;

        return this._average;
    }

    absDev(): number
    {
        let errSum = 0;

        for (let i = 0, j = this._history.length; i < j; i++)
        {
            errSum += Math.abs(this._history[i] - this._average);
        }

        return errSum / this._history.length;
    }
}
