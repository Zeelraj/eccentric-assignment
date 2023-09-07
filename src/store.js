import { configureStore } from "@reduxjs/toolkit";
import authReducer from "features/auth/authSlice";
import appReducer from "features/app/appSlice";
import { combineReducers } from "@reduxjs/toolkit";

const reducer = combineReducers({
  auth: authReducer,
  app: appReducer,
});

export const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
