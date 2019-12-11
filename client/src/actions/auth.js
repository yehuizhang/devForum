import axios from 'axios';
import { REGISTER_FAIL, REGISTER_SUCCESS } from './types';
import { setAlert } from './alert';

export const register = ({ name, email, password }) => async dispatch => {
  const newUser = {
    name,
    email,
    password,
  };

  const body = JSON.stringify(newUser);

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const res = await axios.post('/api/users', body, config);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};
