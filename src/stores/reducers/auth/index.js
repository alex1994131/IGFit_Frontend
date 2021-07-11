import * as actionTypes from "../../actions/actionTypes";

const initialState = {
  isAuthenticated: false,
  authorizationToken: "",
};

const auth = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESSFUL: {
      return {
        isAuthenticated: true,
        authorizationToken: action.authorizationToken,
      };
    }
    case actionTypes.LOGOUT_USER: {
      return {
        isAuthenticated: false,
        authorizationToken: "",
      };
    }
    default:
      return state;
  }
};

export default auth;
