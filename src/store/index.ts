import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import authReducer from './authSlice';
import cloudDriveReducer from './cloudDriveSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cloudDrive: cloudDriveReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useReduxDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector; 