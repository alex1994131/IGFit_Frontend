import React from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Link } from "react-router-dom"

const SignUpForm = () => {
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
                        />

                        <Form.Input
                            id="email"
                            fluid
                            icon='user'
                            iconPosition='left'
                            placeholder='E-mail address'
                        />

                        <Form.Input
                            id="password"
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                        />

                        <Form.Input
                            id="confirm_password"
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                        />

                        <Button id="signup" color='teal' fluid size='large'>
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
