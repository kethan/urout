import * as qs from './query';

export default (req: any, toDecode: boolean) => {
	let raw = req.url;
	if (raw == null) return;

	let prev = req._parsedUrl;
	if (prev && prev.raw === raw) return prev;

	let pathname=raw, search='', query;

	if (raw.length > 1) {
		let idx = raw.indexOf('?', 1);

		if (idx !== -1) {
			search = raw.substring(idx);
			pathname = raw.substring(0, idx);
			if (search.length > 1) {
				query = qs.parse(search.substring(1));
			}
		}

		if (!!toDecode && !req._decoded) {
			req._decoded = true;
			if (pathname.indexOf('%') !== -1) {
				try { pathname = decodeURIComponent(pathname) }
				catch (e) { /* URI malformed */ }
			}
		}
	}

	return req._parsedUrl = { pathname, search, query, raw };
}