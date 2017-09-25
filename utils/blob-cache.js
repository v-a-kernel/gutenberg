const { createObjectURL, revokeObjectURL } = window.URL;

const cache = {};

export function createBlobURL( blob ) {
	const url = createObjectURL( blob );

	cache[ url ] = blob;

	return url;
}

export function getBlobByURL( url ) {
	return cache[ url ];
}

export function revokeBlobURL( url ) {
	revokeObjectURL( url );
	delete cache[ url ];
}
