/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

class SlotFillProvider extends Component {
	constructor() {
		super( ...arguments );

		this.registerSlot = this.registerSlot.bind( this );
		this.unregisterSlot = this.unregisterSlot.bind( this );
		this.getSlot = this.getSlot.bind( this );

		this.slots = {};
	}

	getChildContext() {
		const { registerSlot, unregisterSlot, getSlot } = this;

		return {
			registerSlot,
			unregisterSlot,
			getSlot,
		};
	}

	registerSlot( name, node ) {
		this.slots[ name ] = node;
	}

	unregisterSlot( name ) {
		delete this.slots[ name ];
	}

	getSlot( name ) {
		return this.slots[ name ];
	}

	render() {
		return this.props.children;
	}
}

SlotFillProvider.childContextTypes = {
	registerSlot: noop,
	unregisterSlot: noop,
	getSlot: noop,
};

export default SlotFillProvider;
