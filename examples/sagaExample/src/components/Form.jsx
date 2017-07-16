import React from 'react';
import { object, func, any, string, array, } from 'prop-types';
import Input from './Input';
import { isEmpty, poorMap, } from '../common';
import Button from './Button';

const { entries, values, assign, } = Object;

export default class InputForm extends React.Component {
  static propTypes = {
    texts: object.isRequired,
    types: object.isRequired,
    requiredFields: array,
    validators: object,
    onSubmit: func.isRequired,
    header: string,
    children: any,
  };

  static defaultProps = {
    requiredFields: [],
  };

  componentWillMount() {
    const { texts, } = this.props;
    this.setState({ texts, invalids: {}, missing: {}, });
  }

  render() {
    const { types, header, children, } = this.props;
    const { texts, invalids, missing, } = this.state;
    const notSubmittable = !!(values(invalids).filter(isTrue => isTrue).length || values(missing).filter(isTrue => isTrue).length);
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>{header}</h3>
        {entries(texts).map(([ k, v, ]) =>
          <Input
            id={k}
            missing={missing[k]}
            invalid={invalids[k]}
            onFocus={() => this.setState({ missing: { ...missing, [k]: false, }, })}
            onBlur={() => this.onBlur(k)}
            key={k}
            type={types[k]}
            name={k}
            placeholder={k}
            required
            value={v}
            onChange={(value) => this.onChange(k, value)} />)}
        {children}
        <Button primary disabled={notSubmittable} text='Submit' type='submit' />
      </form>
    );
  }

  onChange(key, value) {
    const { validators, } = this.props;
    let { texts, missing, invalids, } = this.state;
    texts = { ...texts, [key]: value, };
    if (invalids[key] && validators[key] && validators[key].test(value)) {
      invalids = { ...invalids, [key]: false, };
    } else if (missing[key] && value) {
      missing = { ...missing, [key]: false, };
    }
    this.setState({ texts, invalids, missing, });
  }

  onBlur(key) {
    const { validators, requiredFields, } = this.props;
    const { texts, invalids, missing, } = this.state;
    const value = texts[key];
    if (value && validators[key] && !validators[key].test(value)) {
      this.setState({ invalids: { ...invalids, [key]: true, }, });
    } else if (!value && requiredFields.some(k => k === key)) {
      this.setState({ missing: { ...missing, [key]: true, }, });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { requiredFields, validators, onSubmit, } = this.props;
    const { texts, } = this.state;
    const requiredMap = requiredFields.reduce((acc, k) => assign(acc, { [k]: true, }), {});
    const missing = entries(texts)
      .filter(([ k, ]) => requiredMap[k])
      .filter(([ _, exists, ]) => !exists)
      .map(([ k, ]) => k)
      .reduce(poorMap, {});
    const invalids = entries(texts)
      .filter(([ k, v, ]) => validators[k] && !validators[k].test(v))
      .map(([ k, ]) => k)
      .reduce(poorMap, {});

    if (isEmpty(invalids) && isEmpty(missing)) {
      onSubmit(texts);
    } else {
      this.setState({ invalids, missing, });
    }
  };

  componentWillReceiveProps({ texts, types, }) {
    this.setState({ texts, types, invalids: {}, missing: {}, });
  }
}