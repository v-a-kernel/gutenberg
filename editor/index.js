/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as SlotFillProvider } from 'react-slot-fill';
import { flow, pick } from 'lodash';
import moment from 'moment-timezone';
import 'moment-timezone/moment-timezone-utils';

/**
 * WordPress dependencies
 */
import { EditableProvider } from '@wordpress/blocks';
import { createElement, render } from '@wordpress/element';
import { APIProvider, PopoverProvider, DropZoneProvider } from '@wordpress/components';
import { settings as dateSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import './assets/stylesheets/main.scss';
import Layout from './layout';
import createReduxStore from './store';
import { setupEditor, undo, initializeMetaBoxState } from './actions';
import EditorSettingsProvider from './settings/provider';

/**
 * The default editor settings
 * You can override any default settings when calling createEditorInstance
 *
 *  wideImages   boolean   Enable/Disable Wide/Full Alignments
 *
 * @var {Object} DEFAULT_SETTINGS
 */
const DEFAULT_SETTINGS = {
	wideImages: false,

	// This is current max width of the block inner area
	// It's used to constraint image resizing and this value could be overriden later by themes
	maxWidth: 608,
};

// Configure moment globally
moment.locale( dateSettings.l10n.locale );
if ( dateSettings.timezone.string ) {
	moment.tz.setDefault( dateSettings.timezone.string );
} else {
	const momentTimezone = {
		name: 'WP',
		abbrs: [ 'WP' ],
		untils: [ null ],
		offsets: [ -dateSettings.timezone.offset * 60 ],
	};
	const unpackedTimezone = moment.tz.pack( momentTimezone );
	moment.tz.add( unpackedTimezone );
	moment.tz.setDefault( 'WP' );
}

/**
 * Initializes and returns an instance of Editor.
 *
 * The return value of this function is not necessary if we change where we
 * call createEditorInstance(). This is due to metaBox timing.
 *
 * @param {String}  id       Unique identifier for editor instance
 * @param {Object}  post     API entity for post to edit
 * @param {?Object} settings Editor settings object
 * @return {Object} Editor interface. Currently supports metabox initialization.
 */
export function createEditorInstance( id, post, settings ) {
	const store = createReduxStore();
	const target = document.getElementById( id );

	settings = {
		...DEFAULT_SETTINGS,
		...settings,
	};

	store.dispatch( setupEditor( post ) );

	const providers = [
		// Redux provider:
		//
		//  - context.store
		[
			ReduxProvider,
			{ store },
		],

		// Slot / Fill provider:
		//
		//  - context.slots
		//  - context.fills
		[
			SlotFillProvider,
		],

		// Editable provider:
		//
		//  - context.onUndo
		[
			EditableProvider,
			bindActionCreators( {
				onUndo: undo,
			}, store.dispatch ),
		],

		// Editor settings provider:
		//
		//  - context.editor
		[
			EditorSettingsProvider,
			{ settings },
		],

		// Popover provider:
		//
		//  - context.popoverTarget
		[
			PopoverProvider,
			{ target },
		],

		// APIProvider
		//
		//  - context.getAPISchema
		//  - context.getAPIPostTypeRestBaseMapping
		//  - context.getAPITaxonomyRestBaseMapping
		[
			APIProvider,
			{
				...wpApiSettings,
				...pick( wp.api, [
					'postTypeRestBaseMapping',
					'taxonomyRestBaseMapping',
				] ),
			},
		],

		// DropZone provider:
		[
			DropZoneProvider,
		],
	];

	const createEditorElement = flow(
		providers.map( ( [ Component, props ] ) => (
			( children ) => createElement( Component, props, children )
		) )
	);

	render( createEditorElement( <Layout /> ), target );

	return {
		initializeMetaBoxes( metaBoxes ) {
			store.dispatch( initializeMetaBoxState( metaBoxes ) );
		},
	};
}
