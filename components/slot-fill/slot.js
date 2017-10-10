/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

class Slot extends Component {
	constructor() {
		super( ...arguments );

		this.registerSlot = this.registerSlot.bind( this );
	}

	componentWillUnmount() {
		this.context.unregisterSlot( this.props.name, this.node );
	}

	componentWillReceiveProps( nextProps ) {
		const { name } = nextProps;
		if ( this.props.name !== name ) {
			this.context.unregisterSlot( this.props.name );
			this.context.registerSlot( name, this.node );
		}
	}

	registerSlot( node ) {
		this.node = node;
		this.context.registerSlot( this.props.name, node );
	}

	render() {
		return <div ref={ this.registerSlot } />;
	}
}

Slot.contextTypes = {
	registerSlot: noop,
	unregisterSlot: noop,
};

export default Slot;
