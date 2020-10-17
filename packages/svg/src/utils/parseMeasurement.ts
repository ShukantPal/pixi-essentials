export function parseMeasurement(mes: string, fontSize = 1): number
{
    // TODO: Handle non-px/em units

    // Handle em
    if (mes.includes('em'))
    {
        return parseFloat(mes) * fontSize;
    }

    return parseFloat(mes);
}