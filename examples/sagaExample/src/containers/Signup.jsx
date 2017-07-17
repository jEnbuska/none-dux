import React from 'react';
import { connect, } from 'react-redux';
import LinkDefault from '../components/LinkDefault';
import Form from '../components/Form';
import Button from '../components/Button';
import Input from '../components/Input';
import { isEmail, validPassword, poorMap, isEmpty, } from '../common';
import { SIGNUP_REQUEST, ON_LEAVE_SIGNUP, } from '../actions/types';

const { entries, values, } = Object;

const validators = {
  firstname: (texts) => texts.firstname.length>1,
  lastname: (texts) => texts.lastname.length>1,
  email: (texts) => isEmail.test(texts.email),
  password: (texts) => validPassword.test(texts.password),
  rePassword: ({ password, rePassword, }) => password === rePassword,
};
const placeholders = {
  rePassword: 're-type password',
};
const types = {
  password: 'password',
  rePassword: 'password',
  email: 'email',
};

const requiredFields = [ 'firstname', 'lastname', 'email', 'password', 'rePassword', ].reduce(poorMap, {});

@connect(({ auth, }) => ({ auth, }))
export default class Signup extends React.Component {

  state = {
    texts: { firstname: '', lastname: '', email: '', password: '', rePassword: '', address: '', zip: '', city: '', phone: '', },
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
          <h3>Signup</h3>
          {entries(texts).map(([ k, v, ]) =>
            <Input
              id={k}
              missing={!!missing[k]}
              invalid={!!invalids[k]}
              onFocus={() => this.setState({ missing: { ...missing, [k]: false, }, })}
              onBlur={() => this.onBlur(k)}
              key={k}
              type={types[k]}
              name={k}
              placeholder={placeholders[k] || k}
              required
              value={v}
              onChange={(value) => this.onChange(k,
              value)} />)}
          <Button primary disabled={notSubmittable || pending} text='Signup' type='submit' />
          <LinkDefault to='/auth'>
          Go to login
        </LinkDefault>
        </Form>
        {error && <p className='auth-error'>Email address is already used</p>}
      </div>
    );
  }

  onChange(key, value) {
    let { texts, missing, invalids, } = this.state;
    texts = { ...texts, [key]: value, };
    if (invalids[key] && validators[key] && validators[key](texts)) {
      invalids = { ...invalids, [key]: false, };
    } else if (missing[key] && value) {
      missing = { ...missing, [key]: false, };
    }
    this.setState({ texts, invalids, missing, });
  }

  onBlur(key) {
    const { texts, invalids, missing, } = this.state;
    const value = texts[key];
    if (value && validators[key] && !validators[key](texts)) {
      this.setState({ invalids: { ...invalids, [key]: true, }, });
    } else if (!value && requiredFields[key]) {
      this.setState({ missing: { ...missing, [key]: true, }, });
    }
  }

  handleSubmit = () => {
    const { texts, } = this.state;
    const missing = entries(texts)
      .filter(([ key, exists, ]) => requiredFields[key] && !exists)
      .map(([ k, ]) => k)
      .reduce(poorMap, {});
    const invalids = entries(texts)
      .filter(([ k, v, ]) => validators[k] && !validators[k](texts))
      .map(([ k, ]) => k)
      .reduce(poorMap, {});

    if (isEmpty(invalids) && isEmpty(missing)) {
      const {rePassword, ...rest} = texts;
      this.props.dispatch({ type: SIGNUP_REQUEST, ...rest, });
    } else {
      this.setState({ invalids, missing, });
    }
  }

  componentWillMount() {
    this.props.dispatch({ type: ON_LEAVE_SIGNUP, });
  }
}