import React from 'react';
const { string, } = propTypes;

export default class TransitionText extends React.Component {

  static propTypes = {
    className: string,
    text: string,
  };

  static defaultProps = {
    text: '',
    className: '',
  };

  state = { previousText: null, };

  componentWillMount() {
    this.setState({ currentText: this.props.text, });
  }

  componentWillReceiveProps({ text, }) {
    const { currentText, } = this.state;
    if (currentText!==text) {
      this.setState({ currentText: text, previousText: currentText, });
    }
  }

  render() {
    const { className, } = this.props;
    const { currentText, previousText, } = this.state;
    return [
          (<span className={`appear ${className}`} style={{ display: 'block', }} key={currentText}>{currentText}</span>),
          (<span className={`disappear ${className}`} style={{ display: 'block', }} key={previousText}>{previousText}</span>),
    ];
  }
}