import React, { useState } from "react";
import { useHistory } from "react-router";
import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
} from "semantic-ui-react";
import { Link } from "react-router-dom";

import { signupAction } from "../stores/actions/userAction";

const SignUpForm = (props) => {
  const history = useHistory();

  const [error, setError] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSignUp = async (e) => {
    if (!username) {
      return setError("Please enter your User Name");
    }

    if (!email) {
      return setError("Please enter your email");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return setError("Email address is invalid");
    }

    if (!password) {
      return setError("Please enter your password");
    } else if (password !== confirmPassword) {
      return setError("Password is not same with confirm password");
    }

    const user_info = {
      username: username,
      email: email,
      password: password,
    };

    let res = await signupAction(user_info);
    if (res.status) {
      history.push("/signin");
    } else {
      alert(res.message);
    }
  };

  const handleUserNameChange = (evt) => {
    setUserName(evt.target.value);
  };

  const handleEmailChange = (evt) => {
    setEmail(evt.target.value);
  };

  const handlePassChange = (evt) => {
    setPassword(evt.target.value);
  };

  const handleConfirmPassChange = (evt) => {
    setConfirmPassword(evt.target.value);
  };

  return (
    <Grid textAlign="center" style={{ height: "100vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          <Image src="../../public/images/logo.png" /> Sign Up to your account
        </Header>
        <Form size="large" error>
          <Segment stacked>
            {error && <Message error header="Error" content={error} />}
            <Form.Input
              id="username"
              fluid
              icon="user"
              iconPosition="left"
              placeholder="User Name"
              value={username}
              onChange={handleUserNameChange}
            />

            <Form.Input
              id="email"
              fluid
              icon="user"
              iconPosition="left"
              placeholder="E-mail address"
              value={email}
              onChange={handleEmailChange}
            />

            <Form.Input
              id="password"
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              value={password}
              onChange={handlePassChange}
            />

            <Form.Input
              id="confirm_password"
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPassChange}
            />

            <Button
              id="signup"
              color="teal"
              fluid
              size="large"
              onClick={onSignUp}
            >
              Sign Up
            </Button>
          </Segment>
        </Form>
        <Message>
          Already have account?
          <Link to="/signin">Sign In</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default SignUpForm;
