import React from "react"
import { Field, reduxForm } from 'redux-form'
import { Link } from "react-router-dom";
// presentational components
import FormWrapper from '../../components/FormWrapper'
import MaterialTextField from '../../components/MaterialTextField'
import Button from '@material/react-button';

const theme = {
  background: '#f0f0f0',
}

let LoginForm = ({
  // general props
  error, // state
  handleSubmit, // actions

  // Password field props
  showPassState, // state
  passwordTralingIconOnClick, //actions

  // 'Forgot password?' password props
  forgotPasswordEndpoint, //state
}) => (
  <FormWrapper theme={theme}>
    <form onSubmit={handleSubmit}>
      <h3>Login</h3>
      <Field 
        id="username"
        name="username" 
        type="text"
        label="Username or email"
        component={MaterialTextField}
      />
      <Field 
        id="password"
        name="password" 
        label="Password"
        type={showPassState ? 'text' : 'password'}
        tralingIcon={showPassState ? 'visibility' : 'visibility_off'}
        tralingIconOnClick={passwordTralingIconOnClick}
        component={MaterialTextField}
      />
      <Button type="submit" className="form-button">Login</Button>
      {error && <strong>{error}</strong>}<br/>
      <Link to={forgotPasswordEndpoint}>Forgot password?</Link>
    </form>
  </FormWrapper>
)

LoginForm = reduxForm({
  form: 'loginForm'
})(LoginForm)

export default LoginForm