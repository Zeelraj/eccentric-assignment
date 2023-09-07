import { createSlice } from "@reduxjs/toolkit";
import {
  getActiveHeaderOptionSessionStorage,
  setActiveHeaderOptionSessionStorage,
} from "utils/utils";

const initialState = {
  activeHeaderOption: getActiveHeaderOptionSessionStorage() || "Home",
};

const reducers = {
  setActiveHeaderOption: (state, action) => {
    setActiveHeaderOptionSessionStorage(action.payload.id);
    state.activeHeaderOption = action.payload.id;
  },
};

const appSlice = createSlice({
  name: "app",
  initialState: initialState,
  reducers: reducers,
});

export const { setActiveHeaderOption } = appSlice.actions;

export default appSlice.reducer;
