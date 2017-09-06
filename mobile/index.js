
import { Editor, Raw } from '../..'
import React from 'react'
import initialState from './state.json'

/**
 * Define the default node type.
 */

const DEFAULT_NODE = 'paragraph'

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
  nodes: {
    'block-quote': props => <blockquote {...props.attributes}>{props.children}</blockquote>,
    'bulleted-list': props => <ul {...props.attributes}>{props.children}</ul>,
    'heading-one': props => <h1 {...props.attributes}>{props.children}</h1>,
    'heading-two': props => <h2 {...props.attributes}>{props.children}</h2>,
    'list-item': props => <li {...props.attributes}>{props.children}</li>,
    'numbered-list': props => <ol {...props.attributes}>{props.children}</ol>,
    'reference': props => (
      <span
        {...props.attributes}
        style={{
          backgroundColor: '#40BCFF',
          padding: 2,
        }}
      >
        Reference
      </span>
    )
  },
  marks: {
    bold: {
      fontWeight: 'bold'
    },
    code: {
      fontFamily: 'monospace',
      backgroundColor: '#eee',
      padding: '3px',
      borderRadius: '4px'
    },
    italic: {
      fontStyle: 'italic'
    },
    underlined: {
      textDecoration: 'underline'
    }
  }
}

class SimpleEditable extends React.Component {

  shouldComponentUpdate = () => false

  render = () => (
    <div
      contentEditable
      onSelect={this.props.logger.logEvent('onSelect')}
      onBeforeInput={this.props.logger.logEvent('onBeforeInput')}
      onInput={this.props.logger.logEvent('onInput')}
      onCompositionStart={this.props.logger.logEvent('onCompositionStart')}
      onCompositionUpdate={this.props.logger.logEvent('onCompositionUpdate')}
      onCompositionEnd={this.props.logger.logEvent('onCompositionEnd')}
      onChange={this.props.logger.logEvent('onChange')}
      onKeyDown={this.props.logger.logEvent('onKeyDown')}
      onKeyUp={this.props.logger.logEvent('onKeyUp')}
      onBlur={this.props.logger.logEvent('onBlur')}
      onFocus={this.props.logger.logEvent('onFocus')}
      style={{
        border: '1px solid black',
        padding: '1em',
        margin: '1em 0',
      }}
    >
      {'This is a reference: '}
      <span
        contentEditable={false}
        style={{
          backgroundColor: '#40BCFF',
          padding: 2,
        }}
      >
        Reference
      </span>
      {' '}
    </div>
  )

}

export default class EventLogger extends React.Component {

  data = []

  state = {
    data: [],
    showTable: false,
    onlyLast: false,
  }

  logStateUpdate = state =>
    this.setState({
      data: this.data = [
        ...this.data,
        {
          listener: 'onUpdate',
          state,
        }
      ],
    })

  logEvent = listener => ({ nativeEvent: event }) => {
    const { anchorOffset, focusOffset } = window.getSelection()
    this.setState({
      data: this.data = [
        ...this.data,
        {
          listener,
          html: event.target.innerHTML,
          text: event.target.textContent,
          type: event.type,
          data: event.data,
          selection: anchorOffset > focusOffset ? {
            begin: focusOffset,
            end: anchorOffset,
          } : {
            begin: anchorOffset,
            end: focusOffset,
          },
          key: event.key,
          keyCode: event.keyCode,
        }
      ]
    })
  }

  reset = () =>
    this.setState({ data: this.data = [] })

  toggleTable = () =>
    this.setState({ showTable: !this.state.showTable })

  toggleOnlyLast = () =>
    this.setState({
      showTable: true,
      onlyLast: !this.state.onlyLast,
    })

  render = () => {
    return (
      <div>
        <style type="text/css">{`
          .example {
            max-width: none;
          }

          td {
            min-width: 40px;
            height: 60px;
            padding: 5px;
          }

          span.selection {
            border: 1px solid orange;
            backgroundColor: rgba(255, 227, 174, 0.5);
            padding: 1px;
          }

          td.yes {
            background-color: #629DC6;
          }

          td.stateChange {
            height: 5px;
            padding: 1px;
            background-color: #FB9E4F;
            text-align: center;
            font-size: 10px;
          }

          td.no-alternate {
            background-color: #DAF1F7;
          }

          td.no {

          }
        `}</style>
        <RichText logger={this} />
        <h4>HTML editor</h4>
        <SimpleEditable logger={this} />
        <button onClick={this.reset}>Reset</button>
        <button onClick={this.toggleTable}>{ this.state.showTable ? 'Hide table' : 'Show table' }</button>
        <button onClick={this.toggleOnlyLast}>{ this.state.onlyLast ? 'Show all rows' : 'Show only last rows' }</button>
        {
          !this.state.showTable ? null :
            <DebugTable data={this.data} onlyLast={this.state.onlyLast} />
        }
      </div>
    )
  }

}

function DebugTable({ data, onlyLast }) {
  return (
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th colSpan={3}>Composition</th>
          <th colSpan={2}>Input</th>
          <th colSpan={3}>Select</th>
          <th colSpan={2}>Key</th>
          <th>Type</th>
          <th>Data</th>
          <th colSpan={2}>Content</th>
          <th colSpan={3}>Selection</th>
          <th colSpan={2}>Key</th>
        </tr>
        <tr>
          <th>Start</th>
          <th>Update</th>
          <th>End</th>
          <th>Before</th>
          <th>After</th>
          <th>Focus</th>
          <th>Change</th>
          <th>Blur</th>
          <th>Down</th>
          <th>Up</th>
          <th />
          <th />
          <th>Render</th>
          <th>Raw</th>
          <th>Range</th>
          <th>Start</th>
          <th>End</th>
          <th>Name</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
        { (onlyLast ? data.slice(data.length - 1) : data).map((item, key) => <DebugRow item={item} key={key} />) }
      </tbody>
    </table>
  )
}

function DebugRow({ item }) {
  const { listener, data, type, text, html, selection, key, keyCode } = item

  return (
    listener === 'onUpdate' ?
      (
        <tr><td className="stateChange" colSpan={19}>State change</td></tr>
      ) : (
        <tr>
          <td className={listener === 'onCompositionStart' ? 'yes' : 'no'} />
          <td className={listener === 'onCompositionUpdate' ? 'yes' : 'no'} />
          <td className={listener === 'onCompositionEnd' ? 'yes' : 'no'} />
          <td className={listener === 'onBeforeInput' ? 'yes' : 'no-alternate'} />
          <td className={listener === 'onInput' ? 'yes' : 'no-alternate'} />
          <td className={listener === 'onFocus' ? 'yes' : 'no'} />
          <td className={listener === 'onSelect' ? 'yes' : 'no'} />
          <td className={listener === 'onBlur' ? 'yes' : 'no'} />
          <td className={listener === 'onKeyDown' ? 'yes' : 'no-alternate'} />
          <td className={listener === 'onKeyUp' ? 'yes' : 'no-alternate'} />
          <td>{ type }</td>
          <td><pre>{ data }</pre></td>
          <td>
            { !text ? null : text.slice(0, selection.begin) }
            { !text ? null : <span className="selection">{text.slice(selection.begin, selection.end)}</span> }
            { !text ? null : text.slice(selection.end) }
          </td>
          <td><pre>{ html }</pre></td>
          <td className={selection.begin != selection.end ? 'yes' : 'no'} />
          <td>{ selection.begin }</td>
          <td>{ selection.end }</td>
          <td>{ key }</td>
          <td>{ keyCode }</td>
        </tr>
      )
  )
}


/**
 * The rich text example.
 *
 * @type {Component}
 */

class RichText extends React.Component {

  /**
   * Deserialize the initial editor state.
   *
   * @type {Object}
   */

  state = {
    state: Raw.deserialize(initialState, { terse: true })
  };

  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasMark = (type) => {
    const { state } = this.state
    return state.marks.some(mark => mark.type == type)
  }

  /**
   * Check if the any of the currently selected blocks are of `type`.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasBlock = (type) => {
    const { state } = this.state
    return state.blocks.some(node => node.type == type)
  }

  /**
   * On change, save the new state.
   *
   * @param {State} state
   */

  onChange = (state) => {
    this.props.logger.logStateUpdate(state)
    window.editorState = state
    // console.log('state.startBlock', state.startText.toJS(), state.endText.toJS());
    this.setState({ state })
  }

  /**
   * On key down, if it's a formatting command toggle a mark.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  onKeyDown = (e, data, state) => {
    if (!data.isMod) return
    let mark

    switch (data.key) {
      case 'b':
        mark = 'bold'
        break
      case 'i':
        mark = 'italic'
        break
      case 'u':
        mark = 'underlined'
        break
      case '`':
        mark = 'code'
        break
      default:
        return
    }

    state = state
      .transform()
      .toggleMark(mark)
      .apply()

    e.preventDefault()
    return state
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickMark = (e, type) => {
    e.preventDefault()
    let { state } = this.state

    state = state
      .transform()
      .toggleMark(type)
      .apply()

    this.setState({ state })
  }

  /**
   * When a block button is clicked, toggle the block type.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickBlock = (e, type) => {
    e.preventDefault()
    let { state } = this.state
    const transform = state.transform()
    const { document } = state

    // Handle everything but list buttons.
    if (type != 'bulleted-list' && type != 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        transform
          .setBlock(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      }

      else {
        transform
          .setBlock(isActive ? DEFAULT_NODE : type)
      }
    }

    // Handle the extra wrapping required for list buttons.
    else {
      const isList = this.hasBlock('list-item')
      const isType = state.blocks.some((block) => {
        return !!document.getClosest(block.key, parent => parent.type == type)
      })

      if (isList && isType) {
        transform
          .setBlock(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        transform
          .unwrapBlock(type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list')
          .wrapBlock(type)
      } else {
        transform
          .setBlock('list-item')
          .wrapBlock(type)
      }
    }

    state = transform.apply()
    this.setState({ state })
  }

  /**
   * Render.
   *
   * @return {Element}
   */

  render = () => {
    return (
      <div>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    )
  }

  /**
   * Render the toolbar.
   *
   * @return {Element}
   */

  renderToolbar = () => {
    return (
      <div className="menu toolbar-menu">
        {this.renderMarkButton('bold', 'format_bold')}
        {this.renderMarkButton('italic', 'format_italic')}
        {this.renderMarkButton('underlined', 'format_underlined')}
        {this.renderMarkButton('code', 'code')}
        {this.renderBlockButton('heading-one', 'looks_one')}
        {this.renderBlockButton('heading-two', 'looks_two')}
        {this.renderBlockButton('block-quote', 'format_quote')}
        {this.renderBlockButton('numbered-list', 'format_list_numbered')}
        {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
      </div>
    )
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type)
    const onMouseDown = e => this.onClickMark(e, type)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    )
  }

  /**
   * Render a block-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderBlockButton = (type, icon) => {
    const isActive = this.hasBlock(type)
    const onMouseDown = e => this.onClickBlock(e, type)

    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    )
  }

  /**
   * Render the Slate editor.
   *
   * @return {Element}
   */

  renderEditor = () => {
    const style = {
      padding: '1em',
      border: '1px solid black',
    }
    const { logger: { logEvent }} = this.props
    return (
        <Editor
          style={style}
          spellCheck={false}
          schema={schema}
          state={this.state.state}
          onChange={this.onChange}
          onSelect={logEvent('onSelect')}
          onBeforeInput={logEvent('onBeforeInput')}
          onInput={logEvent('onInput')}
          onCompositionStart={logEvent('onCompositionStart')}
          onCompositionUpdate={logEvent('onCompositionUpdate')}
          onCompositionEnd={logEvent('onCompositionEnd')}
          onKeyDown={logEvent('onKeyDown')}
          onKeyUp={logEvent('onKeyUp')}
          onBlur={logEvent('onBlur')}
          onFocus={logEvent('onFocus')}
        />
    )
  }

}
