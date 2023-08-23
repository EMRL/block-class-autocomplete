import { InspectorControls, /* useBlockEditingMode */ } from '@wordpress/block-editor'
import { hasBlockSupport } from '@wordpress/blocks'
import { TextControl } from '@wordpress/components'
import { createHigherOrderComponent } from '@wordpress/compose'
import { AsyncModeProvider } from '@wordpress/data'
import { memo, useState, useEffect, useRef } from '@wordpress/element'
import { addFilter, removeFilter } from '@wordpress/hooks'
import { __ } from '@wordpress/i18n'
import Awesomplete from 'awesomplete'
import 'awesomplete/awesomplete.css'
import apiFetch from '@wordpress/api-fetch'

/**
 * Gets a token (characters between two spaces)
 *
 * @param {String} value
 * @param {Integer} index
 * @returns {Object}
 */
function getTokenAtIndex(value, index) {
    const prevSpace = value.lastIndexOf(' ', index - 1)
    const nextSpace = value.indexOf(' ', index)
    const start = (prevSpace < 0) ? 0 : prevSpace + 1
    const end = (nextSpace < 0) ? value.length : nextSpace
    const token = value.substring(start, end)

    return {
        start,
        end,
        value: token,
    }
}

/**
 * Replaces a token
 *
 * Uses the token's current position in the input so any other
 * instances of the token are not affected by accident
 *
 * @param {String} value
 * @param {Object} token
 * @param {String} replace
 * @returns {String}
 */
function replaceToken(value, token, replace) {
    if (value.length > token.start) {
        value = value.slice(0, token.start) + value.slice(token.start).replace(token.value, replace + ' ')
    } else {
        value = `${value} ${replace} `
    }

    return value.replace(/\s+/g, ' ')
}

/**
 * Filter suggestions based on input value
 *
 * @this {Awesomplete}
 * @param {String} text
 * @param {String} value
 * @returns {Boolean}
 */
function filter(text, value) {
    return Awesomplete.FILTER_CONTAINS(
        text,
        getTokenAtIndex(value, this.input.selectionStart).value,
    )
}

/**
 * Builds highlighted suggestion based on input value
 *
 * @this {Awesomplete}
 * @param {String} text
 * @param {String} value
 * @returns {HTMLElement}
 */
function item(text, value) {
    return Awesomplete.ITEM(
        text,
        getTokenAtIndex(value, this.input.selectionStart).value,
    )
}

/**
 * Returns function to replace the input value with the selected suggestion
 *
 * @this {Awesomplete}
 * @param {Object} props
 * @returns {Function}
 */
const replace = (onChange) => function(text) {
    onChange(replaceToken(
        this.input.value,
        getTokenAtIndex(this.input.value, this.input.selectionStart),
        text,
    ))
}

/**
 * Scroll selected option into view
 *
 * @this {Awesomplete}
 * @param {Event} e
 */
 function onHighlight(e) {
    [...this.ul.children].find((i) => i.textContent === e.text.value).scrollIntoView({
        block: 'end',
        inline: 'nearest',
    })
}

/**
 * Set cursor to end of replacement after selection made
 *
 * @param {Event} e
 */
function onComplete(e) {
    const index = e.target.value.indexOf(e.text.value) + e.text.value.length + 1
    e.target.setSelectionRange(index, index)
}

/**
 * Update suggestions as you move cursor between tokens
 *
 * @this {Awesomplete}
 * @param {KeyboardEvent} e
 */
function onKeyup(e) {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
        this.evaluate()
    }
}

/**
 * Update suggestions as you move cursor between tokens
 *
 * @this {Awesomplete}
 */
function onClick() {
    this.evaluate()
}

/**
 * Create an instance of Awesomplete and callback to destroy
 *
 * @param {HTMLElement} node
 * @param {Object} props
 * @returns {Function}
 */
function initAwesomplete(node, { onChange }) {
    const awesomplete = new Awesomplete(node, {
        sort: false,
        filter,
        item,
        replace: replace(onChange),
    })

    const boundOnHighlight = onHighlight.bind(awesomplete)
    const boundOnComplete = onComplete.bind(awesomplete)
    const boundOnKeyup = onKeyup.bind(awesomplete)
    const boundOnClick = onClick.bind(awesomplete)

    node.addEventListener('awesomplete-highlight', boundOnHighlight)
    node.addEventListener('awesomplete-selectcomplete', boundOnComplete)
    node.addEventListener('keyup', boundOnKeyup)
    node.addEventListener('click', boundOnClick)

    return () => {
        node.removeEventListener('awesomplete-hightlight', boundOnHighlight)
        node.addEventListener('awesomplete-selectcomplete', boundOnComplete)
        node.removeEventListener('keyup', boundOnKeyup)
        node.removeEventListener('click', boundOnClick)
        awesomplete.destroy()
    }
}

/**
 * Component for datalist of suggestions
 *
 * @param {Object} props
 * @returns {React.ReactElement}
 */
const ClassDatalist = memo(({ classNameSuggestions }) => (
    <datalist id="site-custom-class-names">
        { classNameSuggestions.map((i) => <option value={ i }/>) }
    </datalist>
))

/**
 * The autocomplete component
 *
 * @param {Object} props
 * @returns {React.ReactElement}
 */
const Autocomplete = ({ value, onChange }) => {
    const [ classNameSuggestions, setClassNameSuggestions ] = useState([])

    useEffect(() => {
        async function fetch() {
            try {
                setClassNameSuggestions(await apiFetch({
                    path: 'block-class-autocomplete/v1/suggestions',
                }))
            } catch (e) {
                // No suggestions for now :(
            }
        }

        fetch()
    }, [])

    const input = useRef(null)

    useEffect(() => {
        if (classNameSuggestions.length) {
            return initAwesomplete(input.current, { onChange })
        }
    }, [ classNameSuggestions ])

    return (
        <>
            <TextControl
              ref={ input }
              __nextHasNoMarginBottom
              autoComplete="off"
              label={ __('Additional CSS class(es)') }
              value={ value }
              list="site-custom-class-names"
              onChange={ onChange }
              help={ __('Separate multiple classes with spaces.') }/>
            <AsyncModeProvider value={ true }>
                <ClassDatalist { ...{ classNameSuggestions } }/>
            </AsyncModeProvider>
        </>
    )
}

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom class name, if the block supports custom class name.
 */
const withInspectorControls = createHigherOrderComponent((BlockEdit) => (props) => {
    /* const blockEditingMode = useBlockEditingMode() */
    const hasCustomClassName = hasBlockSupport(props.name, 'customClassName', true)

    if (/* blockEditingMode === 'default' && */ hasCustomClassName && props.isSelected) {
        return (
            <>
                <BlockEdit { ...props } />
                <InspectorControls group="advanced">
                    <Autocomplete
                      value={ props.attributes.className || '' }
                      onChange={ (nextValue) => {
                        props.setAttributes({
                            className: nextValue !== '' ? nextValue : undefined,
                        })
                      } }/>
                </InspectorControls>
            </>
        )
    }

    return <BlockEdit { ...props }/>
}, 'withInspectorControls')

removeFilter(
    'editor.BlockEdit',
    'core/editor/custom-class-name/with-inspector-control',
)

addFilter(
    'editor.BlockEdit',
    'site/custom-class-name/withInspectorControls',
    withInspectorControls,
)
