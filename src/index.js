// ** React Imports
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import "semantic-ui-less/semantic.less";

// ** Redux Imports
import { Provider } from "react-redux";
import { store } from "./stores/store";
import { UserProvider } from "./stores/contexts/UserContext";
import { BrowserRouter } from "react-router-dom";

import Loading from "./components/Loading";

const LazyApp = lazy(() => import("./App"));

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <UserProvider>
        <Suspense fallback={<Loading />}>
          <LazyApp />
        </Suspense>
      </UserProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById("app")
);
