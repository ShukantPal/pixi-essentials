/**
 * Parses font measurements, e.g. '14px', '.5em'
 * @ignore
 */
export function parseMeasurement(mes: string, fontSize = 16): number
{
    if (!mes)
    {
        return 0;
    }

    // TODO: Handle non-px/em units

    // Handle em
    if (mes.includes('em'))
    {
        return parseFloat(mes) * fontSize;
    }

    return parseFloat(mes);
}
