/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { flow } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { isEditorSidebarOpened, getBlockMode } from '../selectors';
import { removeBlock, toggleSidebar, setActivePanel, toggleBlockMode } from '../actions';

function BlockSettingsMenuContent( { mode, onDelete, isSidebarOpened, onToggleSidebar, onShowInspector, onToggleMode, onClose } ) {
	const toggleInspector = () => {
		onShowInspector();
		if ( ! isSidebarOpened ) {
			onToggleSidebar();
		}
	};

	return (
		<div className="editor-block-settings-menu__content">
			<IconButton
				className="editor-block-settings-menu__control"
				onClick={ flow( toggleInspector, onClose ) }
				icon="admin-generic"
			>
				{ __( 'Settings' ) }
			</IconButton>
			<IconButton
				className="editor-block-settings-menu__control"
				onClick={ flow( onToggleMode, onClose ) }
				icon="html"
			>
				{ mode === 'visual'
					? __( 'Edit as HTML' )
					: __( 'Edit in the visual mode' )
				}
			</IconButton>
			<IconButton
				className="editor-block-settings-menu__control"
				onClick={ flow( onDelete ) }
				icon="trash"
			>
				{ __( 'Delete' ) }
			</IconButton>
		</div>
	);
}

export default connect(
	( state, ownProps ) => ( {
		isSidebarOpened: isEditorSidebarOpened( state ),
		mode: getBlockMode( state, ownProps.uid ),
	} ),
	( dispatch, ownProps ) => ( {
		onDelete() {
			dispatch( removeBlock( ownProps.uid ) );
		},
		onShowInspector() {
			dispatch( setActivePanel( 'block' ) );
		},
		onToggleSidebar() {
			dispatch( toggleSidebar() );
		},
		onToggleMode() {
			dispatch( toggleBlockMode( ownProps.uid ) );
		},
	} )
)( BlockSettingsMenuContent );
