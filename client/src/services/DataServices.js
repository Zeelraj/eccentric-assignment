import { getLocalStorageToken } from "utils/utils";

const server = process.env.REACT_APP_SERVER;

const DataServices = {
  getAllUsers: async () => {
    return await fetch(`${server}/v1/users`, {
      headers: { "x-access-token": getLocalStorageToken() },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  updateUserDetails: async (payload) => {
    return await fetch(`${server}/v1/user/update`, {
      method: "PUT",
      headers: {
        "x-access-token": getLocalStorageToken(),
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
  deactivateUser: async () => {
    return await fetch(`${server}/v1/user/deactivate`, {
      method: "DELETE",
      headers: { "x-access-token": getLocalStorageToken() },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  deleteUser: async () => {
    return await fetch(`${server}/v1/user/delete`, {
      method: "DELETE",
      headers: { "x-access-token": getLocalStorageToken() },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  createMeeting: async (payload) => {
    return await fetch(`${server}/v1/meeting/create`, {
      method: "POST",
      headers: {
        "x-access-token": getLocalStorageToken(),
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
  getMeeting: async (meetingId) => {
    return await fetch(`${server}/v1/meeting?meetingId=${meetingId}`, {
      headers: { "x-access-token": getLocalStorageToken() },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  getAllMeetings: async (userId) => {
    return await fetch(`${server}/v1/meetings?userId=${userId}`, {
      headers: { "x-access-token": getLocalStorageToken() },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  updateMeeting: async (meetingId, payload) => {
    return await fetch(`${server}/v1/meeting/update?meetingId=${meetingId}`, {
      method: "PUT",
      headers: {
        "x-access-token": getLocalStorageToken(),
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
  cancelMeeting: async (meetingId) => {
    return await fetch(`${server}/v1/meeting/cancel?meetingId=${meetingId}`, {
      method: "DELETE",
      headers: { "x-access-token": getLocalStorageToken() },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  deleteMeeting: async (meetingId) => {
    return await fetch(`${server}/v1/meeting/delete?meetingId=${meetingId}`, {
      method: "DELETE",
      headers: { "x-access-token": getLocalStorageToken() },
    }).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
  updateMeetingInvitationStatus: async (meetingId, payload) => {
    return await fetch(
      `${server}/v1/meeting/invitation/update-status?meetingId=${meetingId}`,
      {
        method: "PUT",
        headers: {
          "x-access-token": getLocalStorageToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    ).then(async (response) => {
      return {
        status: response.status,
        body: await response.json(),
      };
    });
  },
};

export default DataServices;
