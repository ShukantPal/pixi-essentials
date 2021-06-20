/**
 * @internal
 * @ignore
 */
const _SVG_DOCUMENT_CACHE: Map<string, SVGSVGElement> = new Map();

/**
 * @internal
 * @ignore 
 */
export async function _load(href: string): Promise<SVGSVGElement> {
    const url = new URL(href, document.baseURI);
    const id = url.host + url.pathname;
    let doc = _SVG_DOCUMENT_CACHE.get(id);

    if (!doc)
    {
        doc = await fetch(url.toString())
            .then((res) => res.text())
            .then((text) => new DOMParser().parseFromString(text, 'image/svg+xml').documentElement as any);

        _SVG_DOCUMENT_CACHE.set(id, doc);
    }

    return doc;
}

/**
 * Get information on the internal cache of the SVG loading mechanism.
 * 
 * @public
 * @returns A view on the cache - clear() method and a size property.
 */
export function getLoaderCache(): {
    clear(): void
    size: number
} {
    return {
        clear() {
            _SVG_DOCUMENT_CACHE.clear();
        },
        size: _SVG_DOCUMENT_CACHE.size,
    }
}