import React, { useState, useContext } from 'react'
import { useDispatch } from 'react-redux';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Link } from "react-router-dom"

import { UserContext } from "../stores/contexts/UserContext";
import { setSignIn, signinAction } from '../stores/actions/userAction';

const SignInForm = (props) => {

    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const dispatch = useDispatch()
    // console.log(useContext(UserContext));

    const onSignIn = async (e) => {
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

        let res = await signinAction(auth_info);
        if (res.status) {
            const token = res.accessToken;
            delete res.accessToken;
            localStorage.setItem('jwtToken', token);
            dispatch(setSignIn(token))
            props.history.push("/");
        } else {
            alert(res.message);
        }

    }

    const handleEmailChange = (evt) => {
        setEmail(evt.target.value)
    };

    const handlePassChange = (evt) => {
        setPassword(evt.target.value)
    }

    return (
        <>
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
        </>
    )
}

export default SignInForm
