"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const credentials_1 = require("./lib/credentials");
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
    odatasvc: '/_vti_bin/ListData.svc/',
    userAgentHeader: {
        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)'
    }
};
const credentials = new credentials_1.Credentials(options, params);
credentials.signin().subscribe(data => console.log('Data', data));
//# sourceMappingURL=app.js.map