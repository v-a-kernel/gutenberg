/**
 * External dependencies
 */
import { find, get } from 'lodash';
import showdown from 'showdown';

/**
 * Internal dependencies
 */
import { createBlock } from '../factory';
import { getBlockTypes, getUnknownTypeHandlerName } from '../registration';
import { getBlockAttributes, parseWithGrammar } from '../parser';
import normaliseBlocks from './normalise-blocks';
import stripAttributes from './strip-attributes';
import commentRemover from './comment-remover';
import createUnwrapper from './create-unwrapper';
import isInlineContent from './is-inline-content';
import formattingTransformer from './formatting-transformer';
import msListConverter from './ms-list-converter';
import listMerger from './list-merger';
import imageCorrector from './image-corrector';
import blockquoteNormaliser from './blockquote-normaliser';
import { deepFilter, isInvalidInline, isNotWhitelisted, isPlain, isInline } from './utils';
import shortcodeConverter from './shortcode-converter';

export default function( { HTML, plainText, inline } ) {
	// First of all, strip any meta tags.
	HTML = HTML.replace( /<meta[^>]+>/, '' );

	// If we detect block delimiters, parse entirely as blocks.
	if ( ! inline && HTML.indexOf( '<!-- wp:' ) !== -1 ) {
		return parseWithGrammar( HTML );
	}

	// If there is a plain text version, the HTML version has no formatting,
	// and there is at least a double line break,
	// parse any Markdown inside the plain text.
	if ( plainText && isPlain( HTML ) && plainText.indexOf( '\n\n' ) !== -1 ) {
		const converter = new showdown.Converter();

		converter.setOption( 'noHeaderId', true );

		HTML = converter.makeHtml( plainText );
	}

	// Return filtered HTML if it's inline paste or all content is inline.
	if ( inline || isInlineContent( HTML ) ) {
		HTML = deepFilter( HTML, [
			// Add semantic formatting before attributes are stripped.
			formattingTransformer,
			stripAttributes,
			commentRemover,
			createUnwrapper( ( node ) => ! isInline( node ) ),
		] );

		// Allows us to ask for this information when we get a report.
		window.console.log( 'Processed inline HTML:\n\n', HTML );

		return HTML;
	}

	// Before we parse any HTML, extract shorcodes so they don't get messed up.
	return shortcodeConverter( HTML ).reduce( ( accu, piece ) => {
		// Already a block from shortcode.
		if ( typeof piece !== 'string' ) {
			return [ ...accu, piece ];
		}

		// Context dependent filters. Needs to run before we remove nodes.
		piece = deepFilter( piece, [
			msListConverter,
		] );

		piece = deepFilter( piece, [
			listMerger,
			imageCorrector,
			// Add semantic formatting before attributes are stripped.
			formattingTransformer,
			stripAttributes,
			commentRemover,
			createUnwrapper( isNotWhitelisted ),
			blockquoteNormaliser,
		] );

		piece = deepFilter( piece, [
			createUnwrapper( isInvalidInline ),
		] );

		piece = normaliseBlocks( piece );

		// Allows us to ask for this information when we get a report.
		window.console.log( 'Processed HTML piece:\n\n', piece );

		const doc = document.implementation.createHTMLDocument( '' );

		doc.body.innerHTML = piece;

		const blocks = Array.from( doc.body.children ).map( ( node ) => {
			const block = getBlockTypes().reduce( ( acc, blockType ) => {
				if ( acc ) {
					return acc;
				}

				const transformsFrom = get( blockType, 'transforms.from', [] );
				const transform = find( transformsFrom, ( { type } ) => type === 'raw' );

				if ( ! transform || ! transform.isMatch( node ) ) {
					return acc;
				}

				return createBlock(
					blockType.name,
					getBlockAttributes(
						blockType,
						node.outerHTML
					)
				);
			}, null );

			if ( block ) {
				return block;
			}

			return createBlock( getUnknownTypeHandlerName(), {
				content: node.outerHTML,
			} );
		} );

		return [ ...accu, ...blocks ];
	}, [] );
}
