import { combineReducers } from "redux";
import auth from "./auth";
import transaction from "./transaction";

const rootReducer = combineReducers({
  auth,
  transaction,
});

export default rootReducer;
