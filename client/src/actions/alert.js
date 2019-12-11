import uuid from 'uuid/v4';
import { SET_ALERT, REMOVE_ALERT } from './types';

export const setAlert = (msg, alertType, timeout = 4000) => dispatch => {
  const id = uuid();
  dispatch({
    type: SET_ALERT,
    payload: {
      msg,
      alertType,
      id,
    },
  });

  // remove the alert 3 seconds after it's dispatched
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
