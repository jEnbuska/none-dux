import React from 'react';
import { connect, } from 'react-redux';
import Button from '../components/Button';
import Input from '../components/Input';
import { ON_TERMS_ACCEPTED, } from '../actions/types';

@connect()
export default class Terms extends React.Component {

  state = {
    termsAccepted: false,
    pending: false,
  };

  render() {
    const { termsAccepted, pending, } = this.state;
    return (
      <div>
        <div className='terms'>
          <h1 className='terms-header'>
          Terms of usage
          </h1>
          <div className='terms-content'>
            <p>Mary had a little lamb</p>
            <p>Little lamb, little lamb</p>
            <p>Mary had a little lamb</p>
            <p>Its fleece was white as snow</p>
            <p>And everywhere that Mary went</p>
            <p>Mary went, Mary went</p>
            <p>Everywhere that Mary went</p>
            <p>The lamb was sure to go</p>
            <br />
            <p>He followed her to school one day</p>
            <p>School one day, school one day</p>
            <p>He followed her to school one day</p>
            <p>Which was against the rule</p>
            <p>It made the children laugh and play</p>
            <p>Laugh and play, laugh and play</p>
            <p>It made the children laugh and play</p>
            <p>To see a lamb at school</p>
            <br />
            <p>And so the teacher turned him out</p>
            <p>Turned him out, turned him out</p>
            <p>And so the teacher turned him out</p>
            <p>But still he lingered near</p>
            <p>And waited patiently</p>
            <p>Patiently, patiently</p>
            <p>And wai-aited patiently</p>
            <p>Til Mary did appear</p>
            <br />
            <p>Mary had a little lamb</p>
            <p>Little lamb, little lamb</p>
            <p>Mary had a little lamb</p>
            <p>Its fleece was white as snow</p>
            <p>And everywhere that Mary went</p>
            <p>Mary went, Mary went</p>
            <p>Everywhere that Mary went</p>
            <p>The lamb was sure to go</p>
          </div>
          <div className='flex'>
            <div>
              <Input disabled={pending} id='acceptTerms' type='checkbox' checked={termsAccepted} onChange={() => this.setState({ termsAccepted: !termsAccepted, })} />
              <label htmlFor='acceptTerms'>
                accept terms
              </label>
            </div>
            <Button
              primary
              disabled={!termsAccepted || pending}
              text='Submit'
              onClick={this.onSubmit} />
          </div>
        </div>
      </div>
    );
  }

  onSubmit = () => {
    this.setState({ pending: true, });
    this.props.dispatch({ type: ON_TERMS_ACCEPTED, });
  }
}