import { getLocalStorageToken } from "utils/utils";

const server = process.env.REACT_APP_SERVER;

const AuthServices = {
  isAuthenticated: async () => {
    return await fetch(`${server}/v1/auth/authenticate`, {
      headers: {
        "x-access-token": getLocalStorageToken(),
      },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  registerUser: async (payload) => {
    return await fetch(`${server}/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  loginUser: async (payload) => {
    return await fetch(`${server}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  logout: async () => {
    return await fetch(`${server}/v1/auth/logout`, {
      headers: {
        "x-access-token": getLocalStorageToken(),
      },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  passwordReset: async (payload) => {
    return await fetch(`${server}/v1/auth/password/reset`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
};

export default AuthServices;
