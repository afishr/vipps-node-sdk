/// <reference types="node" />

import { OutgoingHttpHeaders } from 'node:http';

export declare class AccessTokenClient {
    tokenSet?: AuthorizationTokenResponse;
    vippsCredentials: VippsCredentials;
    hostname: string;
    headers: OutgoingHttpHeaders;
    constructor(vippsCredentials: VippsCredentials, useTestMode?: boolean);
    get(): Promise<string>;
    private isExpired;
}

export declare interface AuthorizationTokenResponse {
    /**
     * The type for the access token.
     * This will always be `Bearer`.
     * @example "Bearer"
     */
    token_type: string;
    /**
     * Token expiry time in seconds.
     * The access token is valid for 1 hour in the test environment
     * and 24 hours in the production environment.
     * @example 3600
     */
    expires_in: number;
    /**
     * Extra time added to expiry time. Currently disabled.
     * @example 3600
     */
    ext_expires_in: number;
    /**
     * Token expiry time in epoch time format.
     * @example 1547823408
     */
    expires_on: number;
    /**
     * Token creation time in epoch time format.
     * @example 1547819508
     */
    not_before: number;
    /**
     * A common resource object.
     * Not used in token validation.
     * This can be disregarded.
     * @example "00000002-0000-0000-c000-000000000000"
     */
    resource: string;
    /**
     * The access token itself.
     * It is a base64-encoded string, typically 1000+ characters.
     * It can be decoded on https://jwt.io, and using standard libraries.
     * See the documentation for details.
     * @format byte
     * @example "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1Ni <truncated>"
     */
    access_token: string;
}

export declare class Checkout {
    private readonly headers;
    private readonly checkoutSessionPath;
    private readonly vippsHostname;
    constructor(configuration: InternalVippsConfiguration);
    createSession(requestData: CheckoutInitiateSessionRequest): Promise<CheckoutInitiateSessionResponse>;
    getSessionDetails(reference: string): Promise<CheckoutSessionResponse>;
}

/** Amounts are specified in minor units. For Norwegian kroner (NOK) that means 1 kr = 100 øre. Example: 499 kr = 49900 øre. */
export declare interface CheckoutAmount {
    /**
     * Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int32
     * @min 0
     */
    value: number;
    /** The currency identifier according to ISO 4217. Example: "NOK" */
    currency: string;
    [key: string]: any;
}

/** Defines the details of the billing */
export declare interface CheckoutBillingDetails {
    /** Example: "Ada" */
    firstName: string;
    /** Example: "Lovelace" */
    lastName: string;
    /** Example: "user@example.com" */
    email: string;
    /** If no country code is provided, defaults to Norway (47). Example: "4791234567" */
    phoneNumber: string;
    /** Example: "Robert Levins gate 5" */
    streetAddress?: string | null;
    /** Example: "0154" */
    postalCode?: string | null;
    /** Example: "Oslo" */
    city?: string | null;
    /** The ISO-3166-1 Alpha-2 representation of the country. Example: "NO" */
    country?: string | null;
    [key: string]: any;
}

export declare interface CheckoutConfig {
    /** If customer is physically present: "customer_present", otherwise: "customer_not_present". */
    customerInteraction?: CheckoutCustomerInteraction | null;
    /** Adjust the fields and values present in the Checkout. */
    elements?: CheckoutElements | null;
    /** Countries to allow during session */
    countries?: CheckoutCountries | null;
    /** One of the following: "WEB_REDIRECT", "NATIVE_REDIRECT". To ensure having a return URL based on an app URL, use "NATIVE_REDIRECT". */
    userFlow?: CheckoutUserFlow | null;
    /** Requires the customer to consent to share their email and openid sub with the merchant to be able to make a wallet payment (default: false). */
    requireUserInfo?: boolean | null;
    /** If used, displays a checkbox that can be used to ask for extra consent. */
    customConsent?: CheckoutCustomConsent | null;
    /** Decides whether the order lines are displayed as a shopping cart context in the checkout. */
    showOrderSummary?: boolean | null;
    [key: string]: any;
}

export declare interface CheckoutCountries {
    /** List of allowed countries in ISO-3166 Alpha 2. If specified, the customer will only be able to select these countries. Example ["NO", "SE", "DK"] */
    supported: string[];
    [key: string]: any;
}

/** If used, displays a checkbox that can be used to ask for extra consent. */
export declare interface CheckoutCustomConsent {
    /** Text displayed next to the checkbox. This text can contain up to one link in markdown format like this: [linkText](https://example.com) */
    text: string;
    /** Whether box has to be checked to complete the checkout. */
    required: boolean;
    [key: string]: any;
}

export declare type CheckoutCustomerInteraction = 'CUSTOMER_PRESENT' | 'CUSTOMER_NOT_PRESENT';

export declare type CheckoutElements = 'Full' | 'PaymentAndContactInfo' | 'PaymentOnly';

export declare type CheckoutExternalSessionState = 'SessionCreated' | 'PaymentInitiated' | 'SessionExpired' | 'PaymentSuccessful' | 'PaymentTerminated';

/** Configuration required to enable Helthjem logistics options */
export declare interface CheckoutHelthjem {
    /**
     * The Username provided to you by Helthjem
     * @minLength 1
     */
    username: string;
    /**
     * The Password provided to you by Helthjem
     * @minLength 1
     */
    password: string;
    /**
     * The ShopId provided to you by Helthjem
     * @format int32
     */
    shopId: number;
    [key: string]: any;
}

export declare type CheckoutHelthjemLogisticsOption = CheckoutLogisticsOptionBase & {
    type?: CheckoutHelthjemLogisticsType | null;
    customType?: string | null;
    brand: 'HELTHJEM';
    [key: string]: any;
};

export declare type CheckoutHelthjemLogisticsType = 'HOME_DELIVERY' | 'PICKUP_POINT';

/** Request to set up a Checkout session */
export declare interface CheckoutInitiateSessionRequest {
    merchantInfo: CheckoutPaymentMerchantInfo;
    transaction: CheckoutPaymentTransaction;
    logistics?: CheckoutLogistics | null;
    /** If customer information is known, it can be prefilled. */
    prefillCustomer?: CheckoutPrefillCustomer | null;
    configuration?: CheckoutConfig | null;
    [key: string]: any;
}

/** Response from initiating a session. */
export declare interface CheckoutInitiateSessionResponse {
    /** The token to be provided to Checkout. Example: "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJUdHF1Y3I5ZDdKRHZ6clhYWTU1WUZRIiwic2Vzc2lvblBvbGxpbmdVUkwiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAvY2hlY2tvdXQvc2Vzc2lvbi9UdHF1Y3I5ZDdKRHZ6clhYWTU1WUZRIn0.ln7VzZkNvUGu0HhyA_a8IbXQN35WhDBmCYC9IvyYL-I" */
    token: string;
    /** The URL of the checkout frontend. Example: "https://vippscheckout.vipps.no/v1/". */
    checkoutFrontendUrl: string;
    /** The URL to poll for session information. Example: "https://api.vipps.no/checkout/v1/session/31gf1g413121". */
    pollingUrl: string;
    [key: string]: any;
}

/** Configuration required to enable Instabox logistics options */
export declare interface CheckoutInstabox {
    /**
     * The client id provided to you by Instabox
     * @minLength 1
     */
    clientId: string;
    /**
     * The client secret provided to you by Instabox
     * @minLength 1
     */
    clientSecret: string;
    [key: string]: any;
}

/** Details needed to book an instabox order */
export declare interface CheckoutInstaboxBookingDetails {
    /** Identifies when the delivery options were fetched */
    availabilityToken: string;
    /** Identifies the service (For example "EXPRESS") */
    serviceType: string;
    /** Identifies the location */
    sortCode: string;
    [key: string]: any;
}

export declare type CheckoutInstaboxLogisticsOption = CheckoutLogisticsOptionBase & {
    type?: CheckoutInstaboxLogisticsType | null;
    customType?: string | null;
    brand: 'INSTABOX';
    [key: string]: any;
};

export declare type CheckoutInstaboxLogisticsType = 'HOME_DELIVERY' | 'PICKUP_POINT';

export declare interface CheckoutIntegrations {
    /** Configuration required to enable Porterbuddy logistics options */
    porterbuddy?: CheckoutPorterbuddy | null;
    /** Configuration required to enable Instabox logistics options */
    instabox?: CheckoutInstabox | null;
    /** Configuration required to enable Helthjem logistics options */
    helthjem?: CheckoutHelthjem | null;
    [key: string]: any;
}

/**
 * If both dynamic and fixed options are specified, dynamic options is provided to the user.
 * If no DynamicOptionsCallback is provided, only fixed logistics options will be used.
 * When using dynamic shipping we recommend that you define logistics.fixedOptions as a backup.
 * If the callback does not resolve successfully within 8 seconds, returns null or an empty list the system will fall back to static options.
 * If no fallback options are provided, the user will be presented with an error and will not be able to continue with the checkout.
 */
export declare interface CheckoutLogistics {
    /** Merchant's Callback URL for providing dynamic logistics options based on customer address. Example: "https://example.com/vipps/dynamiclogisticsoption". Can not be used with AddressFields set to false. */
    dynamicOptionsCallback?: string | null;
    /** Fixed list of logistics options. */
    fixedOptions?: CheckoutLogisticsOption[] | null;
    /** Some optional checkout features require carrier-specific configuration. Can not be used with AddressFields set to false. */
    integrations?: CheckoutIntegrations | null;
    [key: string]: any;
}

export declare type CheckoutLogisticsOption = CheckoutPostenLogisticsOption | CheckoutPostnordLogisticsOption | CheckoutPorterbuddyLogisticsOption | CheckoutInstaboxLogisticsOption | CheckoutHelthjemLogisticsOption | CheckoutOtherLogisticsOption;

export declare interface CheckoutLogisticsOptionBase {
    /** Amounts are specified in minor units. For Norwegian kroner (NOK) that means 1 kr = 100 øre. Example: 499 kr = 49900 øre. */
    amount: CheckoutAmount;
    id: string;
    /** @format int32 */
    priority: number;
    isDefault: boolean;
    description?: string | null;
    [key: string]: any;
}

/** Headers required to retrieve an access token. */
export declare interface CheckoutMerchantAuthInfoHeaders {
    /**
     * Client ID for the merchant (the "username"). Found in the Vipps portal. Example: "fb492b5e-7907-4d83-bc20-c7fb60ca35de".
     * @minLength 1
     */
    client_id: string;
    /**
     * Client Secret for the merchant (the "password"). Found in the Vipps portal. Example: "Y8Kteew6GE3ZmeycEt6egg==".
     * @minLength 1
     */
    client_secret: string;
    /**
     * Vipps Subscription key for the API product. Found in the Vipps portal. Example: "0f14ebcab0eb4b29ae0cb90d91b4a84a".
     * @minLength 1
     */
    'ocp-Apim-Subscription-Key': string;
    /**
     * Vipps assigned unique number for a merchant. Found in the Vipps portal. Example: "123456".
     * @minLength 1
     */
    'merchant-Serial-Number': string;
    [key: string]: any;
}

/** Information about the customer address used when retrieving dynamic logistics options. */
export declare interface CheckoutMerchantLogisticsCallbackRequestBody {
    /** Example: "Robert Levins gate 5" */
    streetAddress: string;
    /** Example: "0154" */
    postalCode: string;
    /** Example: "Oslo" */
    region: string;
    /** The ISO-3166-1 Alpha-2 representation of the country. Example: "NO" */
    country: string;
    [key: string]: any;
}

export declare interface CheckoutOrderBottomLine {
    /**
     * The currency identifier according to ISO 4217. Example: "NOK".
     * @minLength 3
     * @maxLength 3
     */
    currency: string;
    /**
     * Tip amount for the order. Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int64
     */
    tipAmount?: number | null;
    /**
     * Amount paid by gift card or coupon. Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int64
     */
    giftCardAmount?: number | null;
    /** Identifier of the terminal / point of sale. */
    terminalId?: string | null;
    [key: string]: any;
}

export declare interface CheckoutOrderLine {
    /**
     * The name of the product in the order line.
     * @minLength 1
     * @maxLength 2048
     */
    name: string;
    /**
     * The product ID.
     * @minLength 1
     * @maxLength 255
     */
    id: string;
    /**
     * Total amount of the order line, including tax and discount. Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int64
     * @min 0
     */
    totalAmount: number;
    /**
     * Total amount of order line with discount excluding tax. Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int64
     * @min 0
     */
    totalAmountExcludingTax: number;
    /**
     * Total tax amount paid for the order line. Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int64
     * @min 0
     */
    totalTaxAmount: number;
    /**
     * Tax percentage for the order line.
     * @format int32
     * @min 0
     * @max 100
     */
    taxPercentage: number;
    /** If no quantity info is provided the order line will default to 1 pcs. */
    unitInfo?: CheckoutOrderUnitInfo | null;
    /**
     * Total discount for the order line. Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int64
     */
    discount?: number | null;
    /** URL linking back to the product at the merchant. */
    productUrl?: string | null;
    /** Flag for marking the orderline as returned. This will make it count negative towards all the sums in BottomLine. */
    isReturn?: boolean | null;
    /** Flag for marking the orderline as a shipping line. This will be shown differently in the app. */
    isShipping?: boolean | null;
    [key: string]: any;
}

export declare interface CheckoutOrderSummary {
    /**
     * The order lines contain descriptions of each item present in the order.
     * @minItems 1
     */
    orderLines: CheckoutOrderLine[];
    /** Contains information regarding the order as a whole. */
    orderBottomLine: CheckoutOrderBottomLine;
    [key: string]: any;
}

export declare interface CheckoutOrderUnitInfo {
    /**
     * Total price per unit, including tax and excluding discount. Must be in Minor Units. The smallest unit of a currency. Example 100 NOK = 10000.
     * @format int64
     * @min 0
     */
    unitPrice: number;
    /** Quantity given as a integer or fraction (only for cosmetics). */
    quantity: string;
    /** Available units for quantity. Will default to PCS if not set. */
    quantityUnit: CheckoutQuantityUnit;
    [key: string]: any;
}

export declare type CheckoutOtherLogisticsOption = CheckoutLogisticsOptionBase & {
    title: string;
    brand: 'OTHER';
    [key: string]: any;
};

export declare interface CheckoutPaymentMerchantInfo {
    /** Complete URL for receiving callbacks. Example: "https://exmaple.com/vipps/payment-callback/ */
    callbackUrl: string;
    /**
     * Complete URL for redirecting customers to when the checkout is finished. Example: "https://example.com/vipps".
     * @minLength 1
     */
    returnUrl: string;
    /** The token will be supplied by the callback to the merchant as a header. Example: "iOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImllX3FXQ1hoWHh0MXpJ". */
    callbackAuthorizationToken: string;
    /** Complete URL to the merchant's terms and conditions. Example: "https://example.com/vipps/termsAndConditions". */
    termsAndConditionsUrl?: string | null;
    [key: string]: any;
}

export declare type CheckoutPaymentMethod = 'Wallet' | 'Card' | 'Swish' | 'Mobilepay';

export declare type CheckoutPaymentState = 'CREATED' | 'AUTHORIZED' | 'TERMINATED';

export declare interface CheckoutPaymentTransaction {
    /** Amounts are specified in minor units. For Norwegian kroner (NOK) that means 1 kr = 100 øre. Example: 499 kr = 49900 øre. */
    amount: CheckoutAmount;
    /**
     * The merchant's unique reference for the transaction. Also known as OrderId. Example: "acme-shop-123-order123abc". See https://vippsas.github.io/vipps-developer-docs/docs/vipps-developers/common-topics/orderid
     * @minLength 8
     * @maxLength 50
     * @pattern ^[-a-zA-Z0-9]*$
     */
    reference: string;
    /**
     * Description visible to the customer during payment. Example: "One pair of Vipps socks".
     * @minLength 3
     * @maxLength 100
     */
    paymentDescription: string;
    /** Contain descriptions of each item present in the order, and an order bottom line for information regarding the order as a whole. */
    orderSummary?: CheckoutOrderSummary | null;
    [key: string]: any;
}

/** The pickup point the customer selected . */
export declare interface CheckoutPickupPoint {
    /** Pickup point id provided by the carrier. Example: 121648 */
    id: string;
    /** Pickup point name. Example: Extra Eiganes */
    name: string;
    /** Pickup point's street address. Example: VITAMINVEIEN 7 */
    address: string;
    /** Pickup point's postal code. Example: 0485 */
    postalCode: string;
    /** Pickup point's city. Example: OSLO */
    city: string;
    /** Pickup point's country. Example: NO */
    country: string;
    /** Pickup point's opening hours. Example: Man-Søn: 1000-2000 */
    openingHours?: string[] | null;
    /** Instabox details */
    instabox?: CheckoutInstaboxBookingDetails | null;
    [key: string]: any;
}

/** Configuration required to enable Porterbuddy logistics options */
export declare interface CheckoutPorterbuddy {
    /** The public key provided to you by Porterbuddy */
    publicToken: string;
    /**
     * The API key provided to you by Porterbuddy
     * @minLength 1
     */
    apiKey: string;
    /** Information about the sender */
    origin: CheckoutPorterbuddyOrigin;
    [key: string]: any;
}

export declare type CheckoutPorterbuddyLogisticsOption = CheckoutLogisticsOptionBase & {
    type?: CheckoutPorterbuddyLogisticsType | null;
    customType?: string | null;
    brand: 'PORTERBUDDY';
    [key: string]: any;
};

export declare type CheckoutPorterbuddyLogisticsType = 'HOME_DELIVERY';

/** Details about the sender of the Porterbuddy parcels */
export declare interface CheckoutPorterbuddyOrigin {
    /** The name of your store */
    name: string;
    /** Your email address where Porterbuddy booking confirmation will be sent */
    email: string;
    /** Your phone number where Porterbuddy may send you important messages. Format must be MSISDN (including country code). Example: "4791234567" */
    phoneNumber: string;
    /** Your address where Porterbuddy will pick up the parcels */
    address: CheckoutPorterbuddyOriginAddress;
    [key: string]: any;
}

export declare interface CheckoutPorterbuddyOriginAddress {
    /** Example: "Robert Levins gate 5" */
    streetAddress: string;
    /** Example: "0154" */
    postalCode: string;
    /** Example: "Oslo" */
    city: string;
    /** The ISO-3166-1 Alpha-2 representation of the country. Example: "NO" */
    country: string;
    [key: string]: any;
}

export declare type CheckoutPostenLogisticsOption = CheckoutLogisticsOptionBase & {
    type?: CheckoutPostenLogisticsType | null;
    customType?: string | null;
    brand: 'POSTEN';
    [key: string]: any;
};

export declare type CheckoutPostenLogisticsType = 'MAILBOX' | 'PICKUP_POINT' | 'HOME_DELIVERY';

export declare type CheckoutPostnordLogisticsOption = CheckoutLogisticsOptionBase & {
    type?: CheckoutPostnordLogisticsType | null;
    customType?: string | null;
    brand: 'POSTNORD';
    [key: string]: any;
};

export declare type CheckoutPostnordLogisticsType = 'PICKUP_POINT' | 'HOME_DELIVERY';

/**
 * Information about the customer to be prefilled
 *
 * If any of the customer information is invalid such as the phone number,
 * the customer will be prompted to input new user information.
 */
export declare interface CheckoutPrefillCustomer {
    /** Example: "Ada" */
    firstName?: string;
    /** Example: "Lovelace" */
    lastName?: string;
    /** Example: "user@example.com" */
    email?: string;
    /** Format must be MSISDN (including country code). Example: "4791234567" */
    phoneNumber?: string;
    /** Example: "Robert Levins gate 5" */
    streetAddress?: string;
    /** Example: "Oslo" */
    city?: string;
    /** Example: "0154" */
    postalCode?: string;
    /** The ISO-3166-1 Alpha-2 representation of the country. Example: "NO" */
    country?: string;
    [key: string]: any;
}

export declare type CheckoutQuantityUnit = 'PCS' | 'KG' | 'KM' | 'MINUTE' | 'LITRE';

/** Defines the details of the payment. */
export declare interface CheckoutResponsePaymentDetails {
    amount: CheckoutAmount;
    state: CheckoutPaymentState;
    aggregate?: CheckoutTransactionAggregate | null;
    [key: string]: any;
}

/** Session information */
export declare interface CheckoutSessionResponse {
    /** The Id of the session. Example: "v52EtjZriRmGiKiAKHByK2". */
    sessionId: string;
    /** The merchant's serial number. Example: "123456" */
    merchantSerialNumber?: string | null;
    /** The merchant's unique reference for the transaction. Also known as OrderId. Example: "acme-shop-123-order123abc". See https://vippsas.github.io/vipps-developer-docs/docs/vipps-developers/common-topics/orderid */
    reference: string;
    /** The state of the session. Example: "SessionStarted". The state of the payment is in PaymentDetails.State. */
    sessionState: CheckoutExternalSessionState;
    paymentMethod?: CheckoutPaymentMethod | null;
    paymentDetails?: CheckoutResponsePaymentDetails | null;
    userInfo?: CheckoutUserInfo | null;
    shippingDetails?: CheckoutShippingDetails | null;
    billingDetails?: CheckoutBillingDetails | null;
    customConsentProvided?: boolean | null;
    [key: string]: any;
}

/** Information about the merchant system. */
export declare interface CheckoutSessionThirdPartyInformationHeaders {
    /** The name of the ecommerce solution. Example: "Acme Enterprises Ecommerce DeLuxe". */
    'vipps-System-Name': string;
    /** The version number of the ecommerce solution. Example: "3.1.2". */
    'vipps-System-Version': string;
    /** The name of the ecommerce plugin. Example: "acme-webshop". */
    'vipps-System-Plugin-Name': string;
    /** The version number of the ecommerce plugin. Example: "4.5.6". */
    'vipps-System-Plugin-Version': string;
    [key: string]: any;
}

/** Defines the details of the shipping */
export declare interface CheckoutShippingDetails {
    /** Example: "Ada" */
    firstName?: string | null;
    /** Example: "Lovelace" */
    lastName?: string | null;
    /** Example: "user@example.com" */
    email?: string | null;
    /** If no country code is provided, defaults to Norway (47). Example: "4791234567" */
    phoneNumber?: string | null;
    /** Example: "Robert Levins gate 5" */
    streetAddress?: string | null;
    /** Example: "0154" */
    postalCode?: string | null;
    /** Example: "Oslo" */
    city?: string | null;
    /** The ISO-3166-1 Alpha-2 representation of the country. Example: "NO" */
    country?: string | null;
    /** Id of the shipping method. Example: "123abc" */
    shippingMethodId?: string | null;
    pickupPoint?: CheckoutPickupPoint | null;
    [key: string]: any;
}

/** Defines the details of the transaction */
export declare interface CheckoutTransactionAggregate {
    cancelledAmount?: CheckoutAmount | null;
    capturedAmount?: CheckoutAmount | null;
    refundedAmount?: CheckoutAmount | null;
    authorizedAmount?: CheckoutAmount | null;
    [key: string]: any;
}

export declare type CheckoutUserFlow = 'WEB_REDIRECT' | 'NATIVE_REDIRECT';

/** Data from the UserInfo endpoint. Will only be present if UserInfo flow is used. */
export declare interface CheckoutUserInfo {
    /** The openid sub that uniquely identifies a Vipps user. */
    sub: string;
    /** Example: "user@example.com" */
    email?: string | null;
    [key: string]: any;
}

export declare class EPayment {
    private headers;
    private ePaymentPath;
    private vippsHostname;
    private accessTokenClient;
    constructor(configuration: InternalVippsConfiguration);
    createPayment(requestData: EPaymentCreatePaymentRequest): Promise<EPaymentCreatePaymentResponse>;
    getPayment(reference: EPaymentReference): Promise<EPaymentGetPaymentResponse>;
    getPaymentEventLog(reference: EPaymentReference): Promise<EPaymentPaymentEvent[]>;
    cancelPayment(reference: EPaymentReference): Promise<EPaymentModificationResponse>;
    capturePayment(reference: EPaymentReference, requestData: EPaymentCaptureModificationRequest): Promise<EPaymentModificationResponse>;
    refundPayment(reference: EPaymentReference, requestData: EPaymentRefundModificationRequest): Promise<EPaymentModificationResponse>;
    forceApprovePayment(reference: EPaymentReference, requestData?: EPaymentForceApprove): Promise<void>;
}

/** Address */
export declare interface EPaymentAddress {
    /** @example "Oslo" */
    city: string;
    /**
     * Country code according to ISO 3166-2 (two capital letters).
     * @pattern ^[A-Z]{2}$
     * @example "NO"
     */
    country: string;
    /**
     * Unique ID of the address, always provided in response from Vipps.
     * @format uuid
     */
    id?: string;
    /** Array of addressLines, for example street name, number, etc. */
    lines: string[];
    /**
     * Postcode of the address in local country format.
     * @example "0154"
     */
    postCode: string;
    [key: string]: any;
}

/** Aggregate */
export declare interface EPaymentAggregate {
    /** Amount object */
    authorizedAmount: EPaymentAmount;
    /** Amount object */
    cancelledAmount: EPaymentAmount;
    /** Amount object */
    capturedAmount: EPaymentAmount;
    /** Amount object */
    refundedAmount: EPaymentAmount;
    [key: string]: any;
}

/**
 * AirlineData
 * Airline related data.
 * If present, `passengerName`, `airlineCode`, `airlineDesignatorCode`, and `agencyInvoiceNumber` are all required.
 */
export declare interface EPaymentAirlineData {
    /**
     * Reference number for the invoice, issued by the agency.
     * @minLength 1
     * @maxLength 6
     */
    agencyInvoiceNumber: string;
    /**
     * IATA 3-digit accounting code (PAX); numeric. It identifies the carrier. eg KLM = 074
     * @format IATA 3-digit accounting code (PAX)
     * @minLength 3
     * @maxLength 3
     * @example "074"
     */
    airlineCode: string;
    /**
     * IATA 2-letter accounting code (PAX); alphabetical. It identifies the carrier. Eg KLM = KL
     * @format IATA 2-letter airline code
     * @minLength 2
     * @maxLength 2
     * @example "KL"
     */
    airlineDesignatorCode: string;
    /**
     * Passenger name, initials, and a title.
     * @format last name + first name or initials + title.
     * @minLength 1
     * @maxLength 49
     * @example "FLYER / MARY MS."
     */
    passengerName: string;
    /**
     * The ticket's unique identifier.
     * @minLength 1
     * @maxLength 150
     */
    ticketNumber?: string;
    [key: string]: any;
}

/** Amount object */
export declare interface EPaymentAmount {
    /** Currency code as defined in ISO 4217. eg NOK for Norwegian kroner. */
    currency: EPaymentCurrency;
    /**
     * Integer value of price in the currency's monetary subunit (e.g., Norwegian øre),
     * or monetary unit where applicable (e.g., Japanese YEN). The type of the monetary
     * unit is defined in ISO 4217.
     * @format int64
     * @min 0
     * @max 65000000
     * @example 1000
     */
    value: number;
    [key: string]: any;
}

/** CaptureModificationRequest */
export declare interface EPaymentCaptureModificationRequest {
    /** Amount object */
    modificationAmount: EPaymentAmount;
    [key: string]: any;
}

/**
 * Create payment request
 * The `CreatePaymentRequest` object.
 */
export declare interface EPaymentCreatePaymentRequest {
    /** Amount object */
    amount: EPaymentAmount;
    /** Target customer */
    customer?: EPaymentCustomer;
    /**
     * The type of customer interaction that triggers the purchase.
     * `CUSTOMER_PRESENT` means that the customer is physically present at the
     * point of sale when the payment is made, typically in a store.
     * @default "CUSTOMER_NOT_PRESENT"
     * @example "CUSTOMER_NOT_PRESENT"
     */
    customerInteraction?: 'CUSTOMER_PRESENT' | 'CUSTOMER_NOT_PRESENT';
    /** Additional compliance data related to the transaction. */
    industryData?: EPaymentIndustryData;
    paymentMethod: EPaymentPaymentMethod;
    profile?: EPaymentProfileRequest;
    /** A reference */
    reference: EPaymentReference;
    /**
     * The URL the user is returned to after the payment session.
     * The URL has to use the `https://` scheme or a custom URL scheme.
     * @example "https://example.com/redirect?orderId=acme-shop-123-order123abc"
     */
    returnUrl?: string;
    /**
     * The flow for bringing to user to the Vipps Wallet payment confirmation screen.
     * If `userFlow` is `PUSH_MESSAGE`, a valid value for `customer.phoneNumber` is required.
     * @example "NATIVE_REDIRECT"
     */
    userFlow: 'PUSH_MESSAGE' | 'NATIVE_REDIRECT' | 'WEB_REDIRECT' | 'QR';
    /**
     * The payment will expire at the given date and time.
     * The format must adhere to RFC 3339.
     * The value must be more than 10 minutes and less than 28 days in the future.
     * Can only be combined with `userFlow: PUSH_MESSAGE` or `userFlow: QR`.
     * @pattern ^((?:(\d{4}-\d{2}-\d{2})(T|t)(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|z|([+-](?:2[0-3]|[01][0-9]):[0-5][0-9])))$
     * @example "2023-02-26T17:32:28Z"
     */
    expiresAt?: string | null;
    /**
     * Optional setting that is only applicable when `userFlow` is set to `QR`.
     * This is used to set the format for the QR code.
     */
    qrFormat?: {
        /**
         * If `userFlow` is `QR` and `qrFormat` is not set, the QR code image will be returned as `SVG+XML`, by default.
         * @default "IMAGE/SVG+XML"
         * @example "IMAGE/SVG+XML"
         */
        format: 'TEXT/TARGETURL' | 'IMAGE/SVG+XML' | 'IMAGE/PNG';
        /**
         * For example, if the value is 200, then 200x200 px is set as the dimension for the QR code.
         * This is only applicable when the format is set to `PNG`. If not set, the default is 1024.
         * @min 100
         * @max 2000
         * @example 1024
         */
        size?: number | null;
    };
    /**
     * The payment description summary that will be provided to the user through the app, the merchant portal, and the settlement files.
     * @minLength 3
     * @maxLength 100
     */
    paymentDescription?: string;
    [key: string]: any;
}

/**
 * Create payment response
 * The `CreatePaymentResponse` object.
 */
export declare interface EPaymentCreatePaymentResponse {
    /**
     * The URL to which the user is redirected when continuing the payment for `NATIVE_REDIRECT` and `WEB_REDIRECT`.
     * When `userFlow` is `QR`, a link to the QR image (or the target URL) will be returned.
     * Nothing will be returned when `userFlow` is `PUSH_MESSAGE`.
     * @format uri
     * @example "https://landing.vipps.no?token=abc123"
     */
    redirectUrl?: string;
    /** A reference */
    reference: EPaymentReference;
    [key: string]: any;
}

/**
 * Currency code as defined in ISO 4217. eg NOK for Norwegian kroner.
 * @example "NOK"
 */
export declare type EPaymentCurrency = 'NOK';

/**
 * Customer
 * Target customer
 */
export declare interface EPaymentCustomer {
    /**
     * The phone number of the user paying the transaction with Vipps.
     * Only Norwegian mobile numbers are supported (for now).
     * The format is MSISDN: Digits only: Country code and subscriber
     * number, but no prefix.
     *
     * See: https://en.wikipedia.org/wiki/MSISDN
     * @minLength 10
     * @maxLength 15
     * @pattern ^\d{10,15}$
     * @example 4791234567
     */
    phoneNumber?: string;
    [key: string]: any;
}

/** ForceApprove */
export declare interface EPaymentForceApprove {
    /** Target customer */
    customer?: EPaymentCustomer;
    /** The token value received in the redirectUrl property in the Create payment response */
    token?: string;
    [key: string]: any;
}

/**
 * Get payment response
 * The `GetPaymentResponse` object.
 */
export declare interface EPaymentGetPaymentResponse {
    aggregate: EPaymentAggregate;
    /** Amount object */
    amount: EPaymentAmount;
    /**
     * State of the Payment.
     * One of:
     * - CREATED : User has not yet acted upon the payment
     * - ABORTED : User has aborted the payment before authorization
     * - EXPIRED: User did not act on the payment within the payment expiration time
     * - AUTHORIZED : User has approved the payment
     * - TERMINATED : Merchant has terminated the payment via the cancelPayment endpoint
     */
    state: EPaymentState;
    paymentMethod: EPaymentPaymentMethodResponse;
    profile: EPaymentProfileResponse;
    /** Reference value for a payment defined by Vipps. */
    pspReference: EPaymentPspReference;
    /**
     * The URL you should redirect the user to to continue with the payment.
     * @format uri
     * @example "https://landing.vipps.no?token=abc123"
     */
    redirectUrl?: string;
    /** A reference */
    reference: EPaymentReference;
    [key: string]: any;
}

/** Additional compliance data related to the transaction. */
export declare interface EPaymentIndustryData {
    /**
     * Airline related data.
     * If present, `passengerName`, `airlineCode`, `airlineDesignatorCode`, and `agencyInvoiceNumber` are all required.
     */
    airlineData?: EPaymentAirlineData;
    [key: string]: any;
}

/** ModificationResponse */
export declare interface EPaymentModificationResponse {
    /** Amount object */
    amount: EPaymentAmount;
    /**
     * State of the Payment.
     * One of:
     * - CREATED : User has not yet acted upon the payment
     * - ABORTED : User has aborted the payment before authorization
     * - EXPIRED: User did not act on the payment within the payment expiration time
     * - AUTHORIZED : User has approved the payment
     * - TERMINATED : Merchant has terminated the payment via the cancelPayment endpoint
     */
    state: EPaymentState;
    aggregate: EPaymentAggregate;
    /** Reference value for a payment defined by Vipps. */
    pspReference: EPaymentPspReference;
    /** A reference */
    reference: EPaymentReference;
    [key: string]: any;
}

/** PaymentAdjustment */
export declare interface EPaymentPaymentAdjustment {
    /** Amount object */
    modificationAmount: EPaymentAmount;
    /** A reference */
    modificationReference: EPaymentReference;
    [key: string]: any;
}

/** PaymentEvent */
export declare interface EPaymentPaymentEvent {
    /** A reference */
    reference: EPaymentReference;
    /** Reference value for a payment defined by Vipps. */
    pspReference: EPaymentPspReference;
    /** @example "AUTHORIZED" */
    name?: 'CREATED' | 'ABORTED' | 'EXPIRED' | 'CANCELLED' | 'CAPTURED' | 'REFUNDED' | 'AUTHORIZED' | 'TERMINATED';
    /**
     * @deprecated
     * @example "CREATE"
     */
    paymentAction: 'CREATE' | 'ABORT' | 'EXPIRE' | 'CANCEL' | 'CAPTURE' | 'REFUND' | 'AUTHORISE' | 'TERMINATE';
    /** Amount object */
    amount: EPaymentAmount;
    /** @format date-time */
    timestamp: string;
    /**
     * @deprecated
     * @format date-time
     */
    processedAt?: string;
    /** The Idempotency key of the request. */
    idempotencyKey?: string | null;
    /** The outcome of the event */
    success: boolean;
    [key: string]: any;
}

/** PaymentEventV2 */
export declare interface EPaymentPaymentEventv2 {
    /** A reference */
    reference: EPaymentReference;
    /** Reference value for a payment defined by Vipps. */
    pspReference: EPaymentPspReference;
    /** @example "AUTHORIZED" */
    name: 'CREATED' | 'ABORTED' | 'EXPIRED' | 'CANCELLED' | 'CAPTURED' | 'REFUNDED' | 'AUTHORIZED' | 'TERMINATED';
    /** Amount object */
    amount: EPaymentAmount;
    /** @format date-time */
    timestamp: string;
    /** The Idempotency key of the request. */
    idempotencyKey?: string | null;
    /** The outcome of the event */
    success: boolean;
    [key: string]: any;
}

/** PaymentMethod */
export declare interface EPaymentPaymentMethod {
    /**
     * The paymentMethod type to be performed.
     * `CARD` has to be combined with a `userFlow` of `WEB_REDIRECT`.
     */
    type: EPaymentPaymentMethodType;
    [key: string]: any;
}

/** PaymentMethodResponse */
export declare interface EPaymentPaymentMethodResponse {
    /**
     * The paymentMethod type to be performed.
     * `CARD` has to be combined with a `userFlow` of `WEB_REDIRECT`.
     */
    type: EPaymentPaymentMethodType;
    /**
     * @minLength 6
     * @maxLength 6
     * @example "540185"
     */
    cardBin?: string;
    [key: string]: any;
}

/**
 * The paymentMethod type to be performed.
 * `CARD` has to be combined with a `userFlow` of `WEB_REDIRECT`.
 * @example "WALLET"
 */
export declare type EPaymentPaymentMethodType = 'WALLET' | 'CARD';

/** Problem */
export declare interface EPaymentProblem {
    /**
     * A URI reference that identifies the problem type.
     * @format uri
     */
    type: string;
    /** A short, human-readable summary of the problem type. It will not change from occurrence to occurrence of the problem. */
    title: string;
    /** A human-readable explanation specific to this occurrence of the problem. */
    detail?: string;
    /** An id that can be used to facilitate in tracing the error. */
    traceId: string;
    [key: string]: any;
}

/** Profile */
export declare interface EPaymentProfileRequest {
    /** A space-separated string list of requested user information in accordance with the OpenID Connect specification. */
    scope?: string;
    [key: string]: any;
}

/** Profile */
export declare interface EPaymentProfileResponse {
    /**
     * If `profile.scope` was requested in `createPayment` this value will populate once
     * `state` is `AUTHORIZED`. This can be used towards the
     * [Userinfo endpoint](https://developer.vippsmobilepay.com/api/userinfo#operation/getUserinfo)
     * to fetch requested user data.
     */
    sub?: string;
    [key: string]: any;
}

/**
 * PspReference
 * Reference value for a payment defined by Vipps.
 */
export declare type EPaymentPspReference = string;

/**
 * ReferenceType
 * A reference
 * @minLength 8
 * @maxLength 50
 * @pattern ^[a-zA-Z0-9-]{8,50}$
 * @example "reference-string"
 */
export declare type EPaymentReference = string;

/** RefundModificationRequest */
export declare interface EPaymentRefundModificationRequest {
    /** Amount object */
    modificationAmount: EPaymentAmount;
    [key: string]: any;
}

/**
 * State
 * State of the Payment.
 * One of:
 * - CREATED : User has not yet acted upon the payment
 * - ABORTED : User has aborted the payment before authorization
 * - EXPIRED: User did not act on the payment within the payment expiration time
 * - AUTHORIZED : User has approved the payment
 * - TERMINATED : Merchant has terminated the payment via the cancelPayment endpoint
 */
export declare type EPaymentState = 'CREATED' | 'ABORTED' | 'EXPIRED' | 'AUTHORIZED' | 'TERMINATED';

export declare interface InternalVippsConfiguration extends VippsConfiguration {
    vippsSystemName: string;
    vippsSystemVersion: string;
}

declare class Vipps {
    checkout: Checkout;
    ePayment: EPayment;
    constructor(options: VippsConfiguration);
}
export default Vipps;

export declare interface VippsConfiguration {
    /** Example: "My plugin" */
    pluginName: string;
    /** Example: "1.0.0" */
    pluginVersion: string;
    /** Client ID for the merchant (the "username"). Found in the Vipps portal.
     * Example: "fb492b5e-7907-4d83-bc20-c7fb60ca35de". */
    clientId: string;
    /** Client Secret for the merchant (the "password"). Found in the Vipps portal.
     * Example: "Y8Kteew6GE3ZmeycEt6egg==" */
    clientSecret: string;
    /** Vipps Subscription key for the API product. Found in the Vipps portal.
     * Example: "0f14ebcab0eb4b29ae0cb90d91b4a84a". */
    subscriptionKey: string;
    /** Vipps assigned unique number for a merchant. Found in the Vipps portal.
     * Example: "123456". */
    merchantSerialNumber: string;
    /** If true, uses Vipps test environment */
    useTestMode?: boolean;
}

export declare type VippsCredentials = Pick<InternalVippsConfiguration, 'clientId' | 'clientSecret' | 'subscriptionKey'>;

export { }
