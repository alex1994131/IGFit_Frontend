import React, { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import FallbackSpinner from "./components/Loading";
import MainLayoutTag from "./layouts/MainLayout";
import AuthLayoutTag from "./layouts/AuthLayout";
import { BrowserRouter as Router } from "react-router-dom";

const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/Signup"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const RouteConfig = ({ component: Component, layout, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const LayoutTag = layout == "auth" ? AuthLayoutTag : MainLayoutTag;
        return (
          <LayoutTag {...props}>
            <Suspense fallback={<FallbackSpinner />}>
              <Component {...props} />
            </Suspense>
          </LayoutTag>
        );
      }}
    />
  );
};

const AppRoute = RouteConfig;

const RouterManager = () => {
  return (
    <Router>
      <Switch>
        <AppRoute exact path="/" component={Portfolio} layout="main" />
        <AppRoute path="/dashboard" component={Dashboard} layout="main" />
        <AppRoute path="/signin" component={SignIn} layout="auth" />
        <AppRoute path="/signup" component={SignUp} layout="auth" />
      </Switch>
    </Router>
  );
};

export default RouterManager;
