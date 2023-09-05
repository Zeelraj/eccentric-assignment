const winston = require("winston");
require("winston-daily-rotate-file");

const { createLogger, transports, format } = winston;
const { combine, timestamp, printf, label } = format;

const customFormat = printf(
  ({ level, message, label, timestamp, method }) =>
    `[${timestamp}] [${label}] [${level}]: [${method}] ${message}`
);

const loggerTimestampFormat = timestamp({
  format: "DD-MM-YYYY hh:mm:ss.SSS A",
});

const loggerFormatMethodName = format(function (info) {
  const error = new Error();
  const stack = error.stack.split("\n");
  const methodName = stack[stack.length - 1];
  info.method = methodName.trim().split(" ")[1].replace("exports.", "");
  return info;
})();

const loggerTransports = [
  new transports.Console(),
  new transports.DailyRotateFile({
    filename: "logs/[%DATE%] - all logs.log",
    datePattern: "DD-MM-YYYY",
    //   maxFiles: "60d", // NOTE Files available for this many days
  }),
  new transports.DailyRotateFile({
    filename: "logs/[%DATE%] - error logs.log",
    level: "error",
    datePattern: "DD-MM-YYYY",
    //   maxFiles: "60d", // NOTE Files available for this many days
  }),
];

const AuthLogger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    label({ label: "Auth" }),
    loggerTimestampFormat,
    loggerFormatMethodName,
    customFormat
  ),
  transports: loggerTransports,
});
exports.AuthLogger = AuthLogger;

const Logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    label({ label: "General" }),
    loggerTimestampFormat,
    loggerFormatMethodName,
    customFormat
  ),
  transports: loggerTransports,
});
exports.Logger = Logger;
