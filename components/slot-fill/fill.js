/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { createPortal } from '@wordpress/element';

const Fill = ( { name, children }, { getSlot } ) =>
	createPortal( children, getSlot( name ) );

Fill.contextTypes = {
	getSlot: noop,
};

export default Fill;
