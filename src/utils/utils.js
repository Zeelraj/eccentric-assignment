import { toast } from "react-toastify";
import { NOTIFICATION_TYPES } from "./constants";

export const NOTIFICATION_TIMEOUT = 5000;

const notificationProps = {
  position: "top-right",
  autoClose: NOTIFICATION_TIMEOUT,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

export const notify = (
  type = NOTIFICATION_TYPES.INFO,
  message = "This is the Notification Message"
) => {
  switch (type) {
    case NOTIFICATION_TYPES.INFO:
      toast.info(message, notificationProps);
      break;

    case NOTIFICATION_TYPES.SUCCESS:
      toast.success(message, notificationProps);
      break;

    case NOTIFICATION_TYPES.WARNING:
      toast.warning(message, notificationProps);
      break;

    case NOTIFICATION_TYPES.ERROR:
      toast.error(message, notificationProps);
      break;

    default:
      toast.info(message, notificationProps);
      break;
  }
};

export const JSONToArray = (json) => {
  const array = [];
  for (const i in json) {
    if (Object.hasOwnProperty.call(json, i)) {
      array.push(json[i]);
    }
  }
  return array;
};

export const isJSONEmpty = (json = {}) => {
  return Object.keys(json).length <= 0;
};

export const getLocalStorageToken = () => {
  return localStorage.getItem("token");
};

export const setLocalStorageToken = (token) => {
  return localStorage.setItem("token", token);
};

export const removeLocalStorageToken = () => {
  return localStorage.removeItem("token");
};

export const getActiveHeaderOptionSessionStorage = () => {
  return sessionStorage.getItem("active_option");
};

export const setActiveHeaderOptionSessionStorage = (option) => {
  return sessionStorage.setItem("active_option", option);
};

export const removeActiveHeaderOptionSessionStorage = () => {
  return sessionStorage.removeItem("active_option");
};

export const toTitleCase = (str) => {
  return str
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
    .join(" ");
};

export const toSentenceCase = (camelCase) => {
  if (camelCase) {
    const result = camelCase.replace(/([A-Z])/g, " $1");
    return result[0].toUpperCase() + result.substring(1).toLowerCase();
  }
  return "";
};

export const convertDate = (d) => {
  const date = new Date(d);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

export const convertDateTime = (d) => {
  const date = new Date(d);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleDateString("en-US", options);
};

export const sortArrayByDate = (
  array = [],
  dateField = "date",
  isDescending = false
) => {
  if (array.length <= 0) {
    return [];
  }

  const sortedArray = [...array].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);

    return isDescending ? dateB - dateA : dateA - dateB;
  });

  return sortedArray;
};

export const compareDates = (d1, d2) => {
  let date1 = new Date(d1).getTime();
  let date2 = new Date(d2).getTime();

  if (date1 < date2) return -1;

  if (date1 > date2) return 1;

  return 0;
};

export const hourDiff = (
  dateTimeFrom = new Date(),
  dateTimeTo = new Date()
) => {
  const d1 = new Date(dateTimeFrom);
  const d2 = new Date(dateTimeTo);

  return (Math.abs(d2 - d1) / (1000 * 60 * 60)).toFixed(2);
};

export const areObjectsEqual = (objA, objB) => {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    const valueA = objA[key];
    const valueB = objB[key];

    if (typeof valueA === "object" && typeof valueB === "object") {
      if (!areObjectsEqual(valueA, valueB)) {
        return false;
      }
    } else if (valueA !== valueB) {
      return false;
    }
  }

  return true;
};

export const padTo2Digits = (num) => {
  return String(num).padStart(2, "0");
};
