import React from 'react';
import {connect} from 'react-redux'
import { Link } from "react-router-dom";
import { Formik, Form, Field } from 'formik';
import FormWrapper from '../../components/FormWrapper'
import { login, } from '../../actions/restAuth'
import { endpoints } from '../AutoRouterContainer'
import FormikMaterialTextField from '../../components/FormikMaterialTextField'
import Button from '@material/react-button';
import BasicForm from '../../components/auth/BasicForm'

const theme = {
  background: '#f0f0f0',
}

class Basic extends React.Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      passwordVisibilityCondition: false,
    }
    this.switchPasswordVisibility = this.switchPasswordVisibility.bind(this)
  }
  handleSubmit(
    values, { setSubmitting, setErrors, setStatus }
  ) {
    this.props.login(values)
      .then(res => {
        if (res.error) {
          if (res.payload.status) {
            // server responded
            console.log(res)
            setErrors(res.payload.response)
            setStatus({non_field_errors: res.payload.response.non_field_errors})
          } else {
            // server is not answered
            setStatus({non_field_errors: 'Something wrong with a server'})
          }
        }
        setSubmitting(false)
      })
  }
  switchPasswordVisibility() {
    this.setState({
      passwordVisibilityCondition: this.state.passwordVisibilityCondition ? false : true
    })
  }
  render() {
  return ( 
      <Formik
        initialValues={{ email: undefined, password: undefined }}
        onSubmit={this.handleSubmit}
      >
        {({ status, touched, isSubmitting, errors }) => (
          <BasicForm 
            status={status}
            touched={touched}
            isSubmitting={isSubmitting}
            errors={errors}
          />
        )}
      </Formik>
    );
  }
}

const mapDispatchToProps = dispatch => ({
    login: (values) => dispatch(login(values)),
})

export default connect(undefined, mapDispatchToProps)(Basic)