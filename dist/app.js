"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const credentials_1 = require("./credentials");
const dotenv = require('dotenv').config();
const options = {
    username: process.env.USER,
    password: process.env.PASS,
    webServerUrl: process.env.WEBSERVER
};
const params = {
    login: '/_forms/default.aspx?wa=wsignin1.0',
    stsHost: 'login.microsoftonline.com',
    stsPath: '/extSTS.srf',
    odatasvc: '/_vti_bin/ListData.svc/'
};
const credentials = new credentials_1.Credentials(options, params);
credentials.signin();
//# sourceMappingURL=app.js.map