import { configureStore } from '@reduxjs/toolkit'
import AuthReducer from "../index"

export const store = configureStore({
  reducer: {
     AuthReducer,
  },
})