{

/** <?php
// The `maybeJSON` function is not needed in PHP because its return semantics
// are the same as `json_decode`
?> **/

function freeform( s ) {
  return s.length && {
    blockName: 'core/freeform',
    innerHtml: s
  };
}

function maybeJSON( s ) {
	try {
		return JSON.parse( s );
	} catch (e) {
		return null;
	}
}

}

Block_List
  = pre:$(!Token .)*
    ts:(t:Token html:$((!Token .)*) { /** <?php return $t; ?> **/ return [ t, html ] })*
    post:$(.*)
  { /** <?php
    $blocks = [];
    if ( ! empty( $pre ) ) { $blocks[] = $pre; }
    foreach ( $ts as $pair ) {
      $blocks[] = $pair[ 0 ];
      if ( ! empty( $pair[ 1 ] ) ) { $blocks[] = $pair[ 1 ] };
    }
    if ( ! empty( $post ) ) { $blocks[] = $post; }

    return $blocks;
    ?> **/

    return [
      freeform( pre ),
      ...ts.reduce( ( out, [ t, h ] ) => [ ...out, t, freeform( h ) ], [] ),
      freeform( post ),
    ].filter( a => a )
  }

Token
  = Tag_More
  / Block_Void
  / Block_Balanced

Tag_More
  = "<!--" WS* "more" customText:(WS+ text:$((!(WS* "-->") .)+) { /** <?php return $text; ?> **/ return text })? WS* "-->" noTeaser:(WS* "<!--noteaser-->")?
  { /** <?php
    $attrs = array( 'noTeaser' => (bool) $noTeaser );
    if ( ! empty( $customText ) ) {
      $attrs['customText'] = $customText;
    }
    return array(
       'blockName' => 'core/more',
       'attrs' => $attrs,
       'innerHtml' => ''
    );
    ?> **/
    return {
      blockName: 'core/more',
      attrs: {
        customText: customText || undefined,
        noTeaser: !! noTeaser
      },
      innerHtml: ''
    }
  }

Block_Void
  = "<!--" WS+ "wp:" blockName:Block_Name WS+ attrs:(a:Block_Attributes WS+ {
    /** <?php return $a; ?> **/
    return a;
  })? "/-->"
  {
    /** <?php
    return array(
      'blockName'  => $blockName,
      'attrs'      => $attrs,
      'innerBlocks' => array(),
      'innerHtml' => '',
    );
    ?> **/

    return {
      blockName: blockName,
      attrs: attrs,
      innerBlocks: [],
      innerHtml: ''
    };
  }

Block_Balanced
  = s:Block_Start children:(Token / $(!Block_End .))+ e:Block_End
  {
    /** <?php
    $innerBlocks = array_filter( $children, function( $a ) {
      return ! is_string( $a );
    } );

    $innerHtml = array_filter( $children, function( $a ) {
      return is_string( $a );
    } );

    return array(
      'blockName'  => $s['blockName'],
      'attrs'      => $s['attrs'],
      'innerBlocks'  => $innerBlocks,
      'innerHtml'  => implode( '', $innerHtml ),
    );
    ?> **/

    var innerBlocks = children.filter( a => 'string' !== typeof a );
    var innerHtml = children.filter( a => 'string' === typeof a ).join('');

    return {
      blockName: s.blockName,
      attrs: s.attrs,
      innerBlocks: innerBlocks,
      innerHtml: innerHtml
    };
  }

Block_Start
  = "<!--" WS+ "wp:" blockName:Block_Name WS+ attrs:(a:Block_Attributes WS+ {
    /** <?php return $a; ?> **/
    return a;
  })? "-->"
  {
    /** <?php
    return array(
      'blockName' => $blockName,
      'attrs'     => $attrs,
    );
    ?> **/

    return {
      blockName: blockName,
      attrs: attrs
    };
  }

Block_End
  = "<!--" WS+ "/wp:" blockName:Block_Name WS+ "-->"
  {
    /** <?php
    return array(
      'blockName' => $blockName,
    );
    ?> **/

    return {
      blockName: blockName
    };
  }

Block_Name
  = $(ASCII_Letter (ASCII_AlphaNumeric / "/" ASCII_AlphaNumeric)*)

Block_Attributes
  = attrs:$("{" (!("}" WS+ """/"? "-->") .)* "}")
  {
    /** <?php return json_decode( $attrs, true ); ?> **/
    return maybeJSON( attrs );
  }

ASCII_AlphaNumeric
  = ASCII_Letter
  / ASCII_Digit
  / Special_Chars

ASCII_Letter
  = [a-zA-Z]

ASCII_Digit
  = [0-9]

Special_Chars
  = [\-\_]

WS
  = [ \t\r\n]

Newline
  = [\r\n]

_
  = [ \t]

__
  = _+

Any
  = .
