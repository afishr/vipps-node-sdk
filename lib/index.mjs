// src/utils/http-request.ts
import http from "http";
import https from "https";
import retry from "async-retry";
function makeRequest(host, method, path, headers, requestData) {
  const [, protocol, hostname, port] = host.match(/^(https?):\/{2}([^/:]*):?(\d{0,4})$/i) || [];
  const options = {
    method,
    hostname,
    port,
    path,
    headers
  };
  const client = protocol === "https" ? https : http;
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
var get = (hostname, path, headers) => retry(() => makeRequest(hostname, "GET", path, headers), { retries: 4 });
var post = (hostname, path, headers, requestData) => retry(() => makeRequest(hostname, "POST", path, headers, requestData), { retries: 4 });

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
import { v4 as uuidv4 } from "uuid";

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
    const idempotencyKey = uuidv4();
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
    const idempotencyKey = uuidv4();
    return post(this.vippsHostname, `${this.ePaymentPath}/${reference}/cancel`, {
      ...this.headers,
      "Idempotency-Key": idempotencyKey,
      Authorization: `Bearer ${accessToken}`
    });
  }
  async capturePayment(reference, requestData) {
    const accessToken = await this.accessTokenClient.get();
    const idempotencyKey = uuidv4();
    return post(
      this.vippsHostname,
      `${this.ePaymentPath}/${reference}/capture`,
      { ...this.headers, "Idempotency-Key": idempotencyKey, Authorization: `Bearer ${accessToken}` },
      requestData
    );
  }
  async refundPayment(reference, requestData) {
    const accessToken = await this.accessTokenClient.get();
    const idempotencyKey = uuidv4();
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
export {
  AccessTokenClient,
  Checkout,
  EPayment,
  src_default as default
};
