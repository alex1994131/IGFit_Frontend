import React from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Link } from "react-router-dom"

import { signupAction } from '../redux/actions/userAction';

const SignUpForm = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const onSignUp = (e) => {


        const auth_info = {
            name: name,
            email: email,
            password: password
        };

        signupAction(auth_info);
    }

    const handleNameChange = (evt) => {
        setEmail(evt.target.value)
    }

    const handleEmailChange = (evt) => {
        setEmail(evt.target.value)
    };

    const handlePassChange = (evt) => {
        setPassword(evt.target.value)
    }

    const handleConfirmPassChange = (evt) => {
        setConfirmPassword(evt.target.value)
    }

    return (
        <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 450 }}>
                <Header as='h2' color='teal' textAlign='center'>
                    <Image src='../../public/images/logo.png' /> Sign Up to your account
                </Header>
                <Form size='large'>
                    <Segment stacked>
                        <Form.Input
                            id="name"
                            fluid
                            icon='user'
                            iconPosition='left'
                            placeholder='User Name'
                            value={name}
                            onChange={handleNameChange}
                        />

                        <Form.Input
                            id="email"
                            fluid
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

                        <Form.Input
                            id="confirm_password"
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                            value={confirmPassword}
                            onChange={handleConfirmPassChange}
                        />

                        <Button id="signup" color='teal' fluid size='large' onClick={onSignUp}>
                            Sign Up
                        </Button>
                    </Segment>
                </Form>
                <Message>
                    Already have account?
                    <Link to="/signin" >
                        Sign In
                    </Link>
                </Message>
            </Grid.Column>
        </Grid>
    )
}

export default SignUpForm
