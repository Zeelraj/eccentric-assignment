import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AuthServices from "../../services/AuthServices";
import {
  removeActiveHeaderOptionSessionStorage,
  removeLocalStorageToken,
  setLocalStorageToken,
} from "../../utils/utils";

export const authenticate = createAsyncThunk("auth/authenticate", async () => {
  return await AuthServices.isAuthenticated()
    .then((response) => response)
    .catch((error) => console.log(error));
});

export const registerUser = createAsyncThunk(
  "auth/user/register",
  async (payload) => {
    return await AuthServices.registerUser(payload)
      .then((response) => response)
      .catch((error) => console.log(error));
  }
);

export const loginUser = createAsyncThunk(
  "auth/user/login",
  async (payload) => {
    return await AuthServices.loginUser(payload)
      .then((response) => response)
      .catch((error) => console.log(error));
  }
);

export const logoutUser = createAsyncThunk("auth/user/logout", async () => {
  return await AuthServices.logout()
    .then((response) => response)
    .catch((error) => console.log(error));
});

const initialState = {
  message: "",
  isLoading: false,
  currentUser: {},
  isAuthenticated: false,
  isAuthenticating: false,
};

const reducers = {
  resetMessages: (state) => {
    state.message = "";
  },
  setCurrentUser: (state, action) => {
    const { success, user } = action?.payload?.body;

    state.isAuthenticated = success;
    state.currentUser = user;
  },
};

const extraReducers = {
  [authenticate.pending]: (state) => {
    state.isAuthenticating = true;
    state.message = "";
  },
  [authenticate.fulfilled]: (state, action) => {
    if (action?.payload?.status === 200) {
      const { success, user, message } = action?.payload?.body;

      state.isAuthenticating = false;
      state.isAuthenticated = success;
      state.currentUser = user;
      state.message = message;
    } else {
      state.isAuthenticating = false;
      state.message = action?.payload?.body?.message;
    }
  },
  [authenticate.rejected]: (state) => {
    state.isAuthenticating = false;
    state.isAuthenticated = false;
    state.message = "Internal Error. Please, try after sometime...";
  },
  [registerUser.pending]: (state) => {
    state.isLoading = true;
    state.message = "";
  },
  [registerUser.fulfilled]: (state, action) => {
    if (action.payload.status === 200) {
      const { message, token, user, isVerified, isAuthenticated } =
        action.payload.body;

      state.isLoading = false;
      state.currentUser = user;
      setLocalStorageToken(token);
      state.isVerified = isVerified;
      state.isAuthenticated = isAuthenticated;
      state.message = message;
    } else {
      const { message } = action.payload.body;

      state.isLoading = false;
      state.message = message;
    }
  },
  [registerUser.rejected]: (state) => {
    state.isLoading = false;
    state.message = "Internal Error. Please, try after sometime...";
  },
  [loginUser.pending]: (state) => {
    state.isLoading = true;
    state.message = "";
  },
  [loginUser.fulfilled]: (state, action) => {
    if (action.payload.status === 200) {
      const { message, token, user, isAuthenticated } = action.payload.body;

      state.isLoading = false;
      state.currentUser = user;
      setLocalStorageToken(token);
      state.isAuthenticated = isAuthenticated;
      state.message = message;
    } else {
      const { message, error } = action.payload.body;

      state.isLoading = false;
      state.message = message;
      state.error = error;
    }
  },
  [loginUser.rejected]: (state) => {
    state.isLoading = false;
    state.message = "Internal Error. Please, try after sometime...";
  },
  [logoutUser.pending]: (state) => {
    state.isLoading = true;
    state.message = "";
  },
  [logoutUser.fulfilled]: (state, action) => {
    if (action.payload.status === 200) {
      const { message } = action.payload.body;

      state.isLoading = false;
      state.currentUser = {};
      removeLocalStorageToken();
      removeActiveHeaderOptionSessionStorage();
      state.isAuthenticated = false;
      state.message = message;
    } else {
      const { message } = action.payload.body;

      state.isLoading = false;
      state.message = message;
    }
  },
  [logoutUser.rejected]: (state) => {
    state.isLoading = false;
    state.message = "Internal Error. Please, try after sometime...";
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: reducers,
  extraReducers: extraReducers,
});

export const { resetMessages, setCurrentUser } = authSlice.actions;

export default authSlice.reducer;
