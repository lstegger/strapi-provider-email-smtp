"use strict";

const _ = require("lodash");
const nodemailer = require("nodemailer");

const toBool = (val) => /^\s*(true|1|on)\s*$/i.test(val);

/* eslint-disable no-unused-vars */
module.exports = {
  provider: "nodemailer",
  name: "Nodemailer",
  auth: {
    nodemailer_default_from: {
      label: "Nodemailer Default From",
      type: "text",
    },
    nodemailer_default_replyto: {
      label: "Nodemailer Default Reply-To",
      type: "text",
    },
    host: {
      label: "Host",
      type: "text",
    },
    port: {
      label: "Port",
      type: "number",
    },
    password: {
      label: "Password",
      type: "string",
    },
    username: {
      label: "username",
      type: "string",
    },
    connectionTimeout: {
      label: "ConnectionTimeout",
      type: "number",
    },
    secure: {
      label: "Secure",
      type: "enum",
      values: ["FALSE", "TRUE"],
    },
    requireTLS: {
      label: "RequireTLS",
      type: "enum",
      values: ["FALSE", "TRUE"],
    },
    rejectUnauthorized: {
      label: "RejectUnauthorized",
      type: "enum",
      values: ["FALSE", "TRUE"],
    },
    users: {
      label: "Users",
      type: "array"
    }
  },

  createTransport: (config, from) => {
    const user = config.users.find(u => u.from === from)
    const username = user.username || config.username
    const password = user.password || config.password

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: toBool(config.secure),
      auth: {
        user: username,
        pass: password,
      },
      tls: {
        rejectUnauthorized: toBool(config.rejectUnauthorized),
      },
      requireTLS: toBool(config.requireTLS),
      connectionTimeout: config.connectionTimeout * 60 * 1000, // 5 min
    });
  }

  init: (config) => {
    let transporter = this.createTransport(config);

    return {
      send: (options) => {
        return new Promise((resolve, reject) => {
          if (options.from !== config.nodemailer_default_from) {
            transporter = this.createTransport(config, options.from);
          }
          // Default values.
          options = _.isObject(options) ? options : {};
          options.from = config.nodemailer_default_from || options.from;
          options.replyTo =
            config.nodemailer_default_replyto || options.replyTo;
          options.text = options.text || options.html;
          options.html = options.html || options.text;

          const msg = [
            "from",
            "to",
            "cc",
            "bcc",
            "subject",
            "text",
            "html",
            "attachments",
          ];

          transporter
            .sendMail(_.pick(options, msg))
            .then(resolve)
            .catch((error) => reject(error));
        });
      },
    };
  },
};
