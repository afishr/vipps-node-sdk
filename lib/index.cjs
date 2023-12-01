"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AccessTokenClient: () => AccessTokenClient,
  Checkout: () => Checkout,
  EPayment: () => EPayment,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// src/utils/http-request.ts
var import_node_http = __toESM(require("http"), 1);
var import_node_https = __toESM(require("https"), 1);
var import_async_retry = __toESM(require("async-retry"), 1);
function makeRequest(host, method, path, headers, requestData) {
  const [, protocol, hostname, port] = host.match(/^(https?):\/{2}([^/:]*):?(\d{0,4})$/i) || [];
  const options = {
    method,
    hostname,
    port,
    path,
    headers
  };
  const client = protocol === "https" ? import_node_https.default : import_node_http.default;
  return new Promise((resolve, reject) => {
    const chunks = [];
    const req = client.request(options, (res) => {
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });
      res.on("end", () => {
        var _a, _b;
        try {
          const body = Buffer.concat(chunks).toString();
          if (!res.statusCode || res.statusCode < 200 || res.statusCode > 299) {
            const error = new Error(`path=${req.path} ,statusCode=${res.statusCode}, contents=${body}`);
            reject(error);
          } else if ((_a = res.headers["content-type"]) == null ? void 0 : _a.includes("application/json")) {
            resolve(JSON.parse(body));
          } else if ((_b = res.headers["content-type"]) == null ? void 0 : _b.includes("text/plain")) {
            resolve(body);
          }
          resolve(null);
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
    if (requestData) {
      req.write(JSON.stringify(requestData));
    }
    req.end();
  });
}
var get = (hostname, path, headers) => (0, import_async_retry.default)(() => makeRequest(hostname, "GET", path, headers), { retries: 4 });
var post = (hostname, path, headers, requestData) => (0, import_async_retry.default)(() => makeRequest(hostname, "POST", path, headers, requestData), { retries: 4 });

// src/services/checkout.ts
var Checkout = class {
  headers;
  checkoutSessionPath;
  vippsHostname;
  constructor(configuration) {
    const vippsHostname = configuration.useTestMode ? "https://apitest.vipps.no" : "https://api.vipps.no";
    this.checkoutSessionPath = "/checkout/v3/session";
    this.vippsHostname = process.env.VIPPS_HOSTNAME || vippsHostname;
    this.headers = {
      client_id: configuration.clientId,
      client_secret: configuration.clientSecret,
      "Content-type": 'application/json; charset="utf-8"',
      "Ocp-Apim-Subscription-Key": configuration.subscriptionKey,
      "Merchant-Serial-Number": configuration.merchantSerialNumber,
      "Vipps-System-Name": configuration.vippsSystemName,
      "Vipps-System-Version": configuration.vippsSystemVersion,
      "Vipps-System-Plugin-Name": configuration.pluginName,
      "Vipps-System-Plugin-Version": configuration.pluginVersion
    };
  }
  async createSession(requestData) {
    return post(
      this.vippsHostname,
      this.checkoutSessionPath,
      this.headers,
      requestData
    );
  }
  async getSessionDetails(reference) {
    return get(this.vippsHostname, `${this.checkoutSessionPath}/${reference}`, this.headers);
  }
};

// src/services/e-payment.ts
var import_uuid = require("uuid");

// src/infrastructure/access-token-client.ts
var AccessTokenClient = class {
  tokenSet;
  vippsCredentials;
  hostname;
  headers;
  constructor(vippsCredentials, useTestMode = false) {
    this.vippsCredentials = vippsCredentials;
    this.hostname = process.env.VIPPS_HOSTNAME ?? useTestMode ? "https://apitest.vipps.no" : "https://api.vipps.no";
    this.headers = {
      client_id: vippsCredentials.clientId,
      client_secret: vippsCredentials.clientSecret,
      "Ocp-Apim-Subscription-Key": vippsCredentials.subscriptionKey
    };
  }
  async get() {
    if (this.tokenSet && !this.isExpired()) {
      return this.tokenSet.access_token;
    }
    const accessTokenResponse = await post(
      this.hostname,
      "/accesstoken/get",
      this.headers
    );
    this.tokenSet = accessTokenResponse;
    return accessTokenResponse.access_token;
  }
  isExpired() {
    if (!this.tokenSet) {
      return true;
    }
    const maxValidTo = /* @__PURE__ */ new Date();
    maxValidTo.setMinutes(maxValidTo.getMinutes() + 3);
    const expiresOn = /* @__PURE__ */ new Date(0);
    expiresOn.setSeconds(this.tokenSet.expires_on);
    return maxValidTo > expiresOn;
  }
};

// src/services/e-payment.ts
var EPayment = class {
  headers;
  ePaymentPath;
  vippsHostname;
  accessTokenClient;
  constructor(configuration) {
    const vippsHostname = configuration.useTestMode ? "https://apitest.vipps.no" : "https://api.vipps.no";
    this.ePaymentPath = "/epayment/v1/payments";
    this.vippsHostname = process.env.VIPPS_HOSTNAME || vippsHostname;
    this.headers = {
      "Content-type": 'application/json; charset="utf-8"',
      "Ocp-Apim-Subscription-Key": configuration.subscriptionKey,
      "Merchant-Serial-Number": configuration.merchantSerialNumber,
      "Vipps-System-Name": configuration.vippsSystemName,
      "Vipps-System-Version": configuration.vippsSystemVersion,
      "Vipps-System-Plugin-Name": configuration.pluginName,
      "Vipps-System-Plugin-Version": configuration.pluginVersion
    };
    this.accessTokenClient = new AccessTokenClient(
      {
        clientId: configuration.clientId,
        clientSecret: configuration.clientSecret,
        subscriptionKey: configuration.subscriptionKey
      },
      !!configuration.useTestMode
    );
  }
  async createPayment(requestData) {
    const accessToken = await this.accessTokenClient.get();
    const idempotencyKey = (0, import_uuid.v4)();
    return post(
      this.vippsHostname,
      this.ePaymentPath,
      { ...this.headers, "Idempotency-Key": idempotencyKey, Authorization: `Bearer ${accessToken}` },
      requestData
    );
  }
  async getPayment(reference) {
    const accessToken = await this.accessTokenClient.get();
    return get(this.vippsHostname, `${this.ePaymentPath}/${reference}`, {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`
    });
  }
  async getPaymentEventLog(reference) {
    const accessToken = await this.accessTokenClient.get();
    return get(this.vippsHostname, `${this.ePaymentPath}/${reference}/events`, {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`
    });
  }
  async cancelPayment(reference) {
    const accessToken = await this.accessTokenClient.get();
    const idempotencyKey = (0, import_uuid.v4)();
    return post(this.vippsHostname, `${this.ePaymentPath}/${reference}/cancel`, {
      ...this.headers,
      "Idempotency-Key": idempotencyKey,
      Authorization: `Bearer ${accessToken}`
    });
  }
  async capturePayment(reference, requestData) {
    const accessToken = await this.accessTokenClient.get();
    const idempotencyKey = (0, import_uuid.v4)();
    return post(
      this.vippsHostname,
      `${this.ePaymentPath}/${reference}/capture`,
      { ...this.headers, "Idempotency-Key": idempotencyKey, Authorization: `Bearer ${accessToken}` },
      requestData
    );
  }
  async refundPayment(reference, requestData) {
    const accessToken = await this.accessTokenClient.get();
    const idempotencyKey = (0, import_uuid.v4)();
    return post(
      this.vippsHostname,
      `${this.ePaymentPath}/${reference}/refund`,
      { ...this.headers, "Idempotency-Key": idempotencyKey, Authorization: `Bearer ${accessToken}` },
      requestData
    );
  }
  async forceApprovePayment(reference, requestData) {
    const accessToken = await this.accessTokenClient.get();
    return post(
      this.vippsHostname,
      `/epayment/v1/test/payments/${reference}/approve`,
      {
        ...this.headers,
        Authorization: `Bearer ${accessToken}`
      },
      requestData
    );
  }
};

// src/vipps.ts
var VIPPS_SYSTEM_NAME = "Vipps Node SDK";
var VIPPS_SYSTEM_VERSION = "0.9.0";
var Vipps = class {
  checkout;
  ePayment;
  constructor(options) {
    this.checkout = new Checkout({
      ...options,
      vippsSystemName: VIPPS_SYSTEM_NAME,
      vippsSystemVersion: VIPPS_SYSTEM_VERSION
    });
    this.ePayment = new EPayment({
      ...options,
      vippsSystemName: VIPPS_SYSTEM_NAME,
      vippsSystemVersion: VIPPS_SYSTEM_VERSION
    });
  }
};

// src/index.ts
var src_default = Vipps;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccessTokenClient,
  Checkout,
  EPayment
});
