/**
 * External dependencies
 */
import { Slot } from 'react-slot-fill';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import classnames from 'classnames';

/**
 * WordPress Dependencies
 */
import { IconButton, Toolbar } from '@wordpress/components';
import { Component, Children } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { focus, keycodes } from '@wordpress/utils';

/**
 * Internal Dependencies
 */
import './style.scss';
import BlockSwitcher from '../block-switcher';
import BlockMover from '../block-mover';
import BlockRightMenu from '../block-settings-menu';

/**
 * Module Constants
 */
const { LEFT, RIGHT, ESCAPE, ALT } = keycodes;

function FirstChild( { children } ) {
	const childrenArray = Children.toArray( children );
	return childrenArray[ 0 ] || null;
}

class BlockToolbar extends Component {
	constructor() {
		super( ...arguments );
		this.toggleMobileControls = this.toggleMobileControls.bind( this );
		this.bindNode = this.bindNode.bind( this );
		this.onKeyUp = this.onKeyUp.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.state = {
			showMobileControls: false,
		};
	}

	componentDidMount() {
		document.addEventListener( 'keyup', this.onKeyUp );
	}

	componentWillUnmout() {
		document.removeEventListener( 'keyup', this.onKeyUp );
	}

	bindNode( ref ) {
		this.toolbar = ref;
	}

	toggleMobileControls() {
		this.setState( ( state ) => ( {
			showMobileControls: ! state.showMobileControls,
		} ) );
	}

	onKeyDown( event ) {
		// This is required to avoid messing up with the WritingFlow navigation
		event.stopPropagation();
	}

	onKeyUp( event ) {
		// Is there a better way to focus the selected block
		const selectedBlock = document.querySelector( '.editor-visual-editor__block.is-selected' );
		const tabbables = focus.tabbable.find( this.toolbar );
		const indexOfTabbable = tabbables.indexOf( document.activeElement );

		if ( event.keyCode === ALT ) {
			if ( tabbables.length ) {
				tabbables[ 0 ].focus();
			}
			return;
		}

		switch ( event.keyCode ) {
			case ESCAPE:
				if ( indexOfTabbable !== -1 && selectedBlock ) {
					selectedBlock.focus();
				}
				break;
			case LEFT:
				if ( indexOfTabbable > 0 ) {
					tabbables[ indexOfTabbable - 1 ].focus();
				}
				event.stopPropagation();
				break;
			case RIGHT:
				if ( indexOfTabbable !== -1 && indexOfTabbable !== tabbables.length - 1 ) {
					tabbables[ indexOfTabbable + 1 ].focus();
				}
				event.stopPropagation();
				break;
		}
	}

	render() {
		const { showMobileControls } = this.state;
		const { uid } = this.props;

		const toolbarClassname = classnames( 'editor-block-toolbar', {
			'is-showing-mobile-controls': showMobileControls,
		} );

		return (
			<CSSTransitionGroup
				transitionName={ { appear: 'is-appearing', appearActive: 'is-appearing-active' } }
				transitionAppear={ true }
				transitionAppearTimeout={ 100 }
				transitionEnter={ false }
				transitionLeave={ false }
				component={ FirstChild }
			>
				<div className={ toolbarClassname } ref={ this.bindNode } onKeyDown={ this.onKeyDown }>
					<div className="editor-block-toolbar__group">
						{ ! showMobileControls && [
							<BlockSwitcher key="switcher" uid={ uid } />,
							<Slot key="slot" name="Formatting.Toolbar" />,
						] }
						<Toolbar className="editor-block-toolbar__mobile-tools">
							<IconButton
								className="editor-block-toolbar__mobile-toggle"
								onClick={ this.toggleMobileControls }
								aria-expanded={ showMobileControls }
								label={ __( 'Toggle extra controls' ) }
								icon="ellipsis"
							/>

							{ showMobileControls &&
								<div className="editor-block-toolbar__mobile-tools-content">
									<BlockMover uids={ [ uid ] } />
									<BlockRightMenu uid={ uid } />
								</div>
							}
						</Toolbar>
					</div>
				</div>
			</CSSTransitionGroup>
		);
	}
}

export default BlockToolbar;
