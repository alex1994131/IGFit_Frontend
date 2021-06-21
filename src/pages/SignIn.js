import React, { useState } from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Link } from "react-router-dom"

import { signinAction } from '../redux/actions/userAction';

const SignInForm = () => {

    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const onSignIn = (e) => {
        e.preventDefault();

        if (!email) {
            return setError('Please enter your email')
        }
        else if (!/\S+@\S+\.\S+/.test(email)) {
            return setError('Email address is invalid')
        }

        if (!password) {
            return setError('Please enter your password')
        }

        const auth_info = {
            email: email,
            password: password
        };

        signinAction(auth_info);
    }

    const handleEmailChange = (evt) => {
        setEmail(evt.target.value)
    };

    const handlePassChange = (evt) => {
        setPassword(evt.target.value)
    }

    return (
        <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 450 }}>
                <Header as='h2' color='teal' textAlign='center'>
                    <Image src='../../public/images/logo.png' /> Sign In to your account
                </Header>
                <Form
                    size='large'
                    error
                >
                    <Segment stacked>
                        {
                            error && (
                                <Message
                                    error
                                    header='Error'
                                    content={error}
                                />
                            )
                        }
                        <Form.Input
                            id="email"
                            fluid
                            type="email"
                            icon='user'
                            iconPosition='left'
                            placeholder='E-mail address'
                            value={email}
                            onChange={handleEmailChange}
                        />
                        <Form.Input
                            id="password"
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                            value={password}
                            onChange={handlePassChange}
                        />

                        <Button color='teal' fluid size='large' onClick={onSignIn}>
                            Sign In
                        </Button>
                    </Segment>
                </Form>
                <Message>
                    New to us?
                    <Link to='/signup'>
                        Sign Up
                    </Link>
                </Message>
            </Grid.Column>
        </Grid>

    )
}

export default SignInForm
