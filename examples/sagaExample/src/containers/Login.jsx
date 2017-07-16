import React from 'react';
import { connect, } from 'react-redux';
import { LOGIN_REQUEST, ON_LEAVE_LOGIN, } from '../actions/types';
import LinkDefault from '../components/LinkDefault';
import Input from '../components/Input';
import Button from '../components/Button';
import Form from '../components/Form';
import { isEmail, validPassword, isEmpty, poorMap, } from '../common';

const validators = {
  email: isEmail,
  password: validPassword,
};
const { entries, values, } = Object;
@connect(({ auth, }) => ({ auth, }))
export default class Login extends React.Component {

  state = {
    texts: { email: '', password: '', },
    invalids: {},
    missing: {},
  };

  render() {
    const { pending, error, } = this.props.auth;
    const { texts, invalids, missing, } = this.state;
    const notSubmittable = !!(values(invalids).filter(isTrue => isTrue).length || values(missing).filter(isTrue => isTrue).length);
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <h3>Login</h3>
          {entries(texts).map(([ k, v, ]) =>
            <Input
              id={k}
              missing={missing[k]}
              invalid={invalids[k]}
              onFocus={() => this.setState({ missing: { ...missing, [k]: false, }, })}
              onBlur={() => this.onBlur(k)}
              key={k}
              type={k === 'password' ? 'password': 'text'}
              name={k}
              placeholder={k}
              required
              value={v}
              onChange={(value) => this.onChange(k, value)} />)}
          <Button primary disabled={notSubmittable || pending} text='Login' type='submit' />
          <LinkDefault to='/auth/signup'>
          Signup
        </LinkDefault>
        </Form>
        {error && <p className='auth-error'>Wrong username or password</p>}
      </div>
    );
  }

  onChange(key, value) {
    let { texts, missing, invalids, } = this.state;
    texts = { ...texts, [key]: value, };
    if (invalids[key] && validators[key].test(value)) {
      invalids = { ...invalids, [key]: false, };
    } else if (missing[key] && value) {
      missing = { ...missing, [key]: false, };
    }
    this.setState({ texts, invalids, missing, });
  }

  onBlur(key) {
    const { texts, invalids, missing, } = this.state;
    const value = texts[key];
    if (value && !validators[key].test(value)) {
      this.setState({ invalids: { ...invalids, [key]: true, }, });
    } else if (!value) {
      this.setState({ missing: { ...missing, [key]: true, }, });
    }
  }

  handleSubmit = () => {
    const { texts, } = this.state;
    const missing = entries(texts)
      .filter(([ _, exists, ]) => !exists)
      .map(([ k, ]) => k)
      .reduce(poorMap, {});
    const invalids = entries(texts)
      .filter(([ k, v, ]) => !validators[k].test(v))
      .map(([ k, ]) => k)
      .reduce(poorMap, {});

    if (isEmpty(invalids) && isEmpty(missing)) {
      console.log('dispatch');
      this.props.dispatch({ type: LOGIN_REQUEST, ...texts, });
    } else {
      console.log('else');
      console.log({ invalids, missing, });
      this.setState({ invalids, missing, });
    }
  }

  componentWillMount() {
    this.props.dispatch({ type: ON_LEAVE_LOGIN, });
  }
}