
// ** React Imports
import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import 'semantic-ui-less/semantic.less'

// ** Redux Imports
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { UserProvider } from "./context/SettingContext"

import Loading from "./components/Loading"

const LazyApp = lazy(() => import('./App'))

ReactDOM.render(
  <Provider store={store}>
    <UserProvider>
      <Suspense fallback={<Loading />} >
        <LazyApp />
      </Suspense>
    </UserProvider>
  </Provider>,
  document.getElementById('app')
)