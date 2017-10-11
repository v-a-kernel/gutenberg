/**
 * WordPress dependencies
 */
import { Component } from 'element';
import { keycodes, focus } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import {
	isHorizontalEdge,
	isVerticalEdge,
	resetVerticalPosition,
	placeCaretAtHorizontalEdge,
	placeCaretAtVerticalEdge,
} from '../utils/dom';

/**
 * Module Constants
 */
const { UP, DOWN, LEFT, RIGHT } = keycodes;

class WritingFlow extends Component {
	constructor() {
		super( ...arguments );

		this.onKeyDown = this.onKeyDown.bind( this );
		this.bindContainer = this.bindContainer.bind( this );
	}

	bindContainer( ref ) {
		this.container = ref;
	}

	getVisibleTabbables() {
		return focus.tabbable
			.find( this.container )
			.filter( ( node ) => (
				node.nodeName === 'INPUT' ||
				node.nodeName === 'TEXTAREA' ||
				node.contentEditable === 'true' ||
				node.classList.contains( 'editor-visual-editor__block' )
			) );
	}

	moveFocusInContainer( target, reverse, horizontal ) {
		const focusableNodes = this.getVisibleTabbables();

		if ( reverse ) {
			focusableNodes.reverse();
		}

		const targetNode = focusableNodes
			.slice( focusableNodes.indexOf( target ) )
			.reduce( ( result, node, i, array ) => {
				if ( result ) {
					return result;
				}

				if ( node.contains( target ) ) {
					return null;
				}

				const nextNode = array[ i + 1 ];

				// Skip block node if it contains a focusable node.
				if ( node.classList.contains( 'editor-visual-editor__block' ) && nextNode && node.contains( nextNode ) ) {
					return null;
				}

				return node;
			}, null );

		if ( targetNode ) {
			if ( horizontal ) {
				placeCaretAtHorizontalEdge( targetNode, reverse );
			} else {
				placeCaretAtVerticalEdge( targetNode, reverse );
			}
		}
	}

	onKeyDown( event ) {
		const { keyCode, target } = event;
		const up = keyCode === UP;
		const down = keyCode === DOWN;
		const left = keyCode === LEFT;
		const right = keyCode === RIGHT;
		const reverse = up || left;
		const horizontal = left || right;
		const vertical = up || down;

		if (
			( horizontal && isHorizontalEdge( target, reverse ) ) ||
			( vertical && isVerticalEdge( target, reverse ) )
		) {
			event.preventDefault();
			this.moveFocusInContainer( target, reverse, horizontal );
		}

		if ( ! vertical ) {
			resetVerticalPosition();
		}
	}

	render() {
		const { children } = this.props;

		return (
			<div
				ref={ this.bindContainer }
				onKeyDown={ this.onKeyDown }
				onMouseDown={ resetVerticalPosition }
			>
				{ children }
			</div>
		);
	}
}

export default WritingFlow;
