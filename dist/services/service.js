"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const xml2js = __importStar(require("xml2js"));
const https = __importStar(require("https"));
const Observable_1 = require("rxjs/Observable");
exports.getSAMLTemplate = () => { return fs.readFileSync('./saml.xml', 'utf8'); };
exports.requestToken = (saml, options) => {
    return Observable_1.Observable.create((observer) => {
        const req = https.request(options, (response) => {
            let xml = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                xml += chunk;
            });
            response.on('end', () => {
                observer.next(xml);
                console.log('XML Retrieved ...');
            });
        });
        req.end(saml);
    });
};
exports.parseToken = (xml) => {
    return Observable_1.Observable.create((observer) => {
        const parser = new xml2js.Parser({ emptyTag: '' });
        parser.on('end', (js) => {
            if (js["S:Envelope"]["S:Body"][0]["S:Fault"]) {
                const error = js["S:Envelope"]["S:Body"][0]["S:Fault"][0]["S:Detail"][0]["psf:error"][0]["psf:internalerror"][0]["psf:text"][0];
                observer.error(error);
            }
            else {
                const token = js["S:Envelope"]["S:Body"][0]["wst:RequestSecurityTokenResponse"][0]["wst:RequestedSecurityToken"][0]["wsse:BinarySecurityToken"][0]._;
                observer.next(token);
                console.log('Token Parsed ...');
            }
        });
        parser.parseString(xml);
    });
};
exports.submiToken = (token, options) => {
    return Observable_1.Observable.create((observer) => {
        const req = https.request(options, (res) => {
            let xml = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => xml += chunk);
            res.on('end', () => {
                const cookie = res.headers['set-cookie'];
                observer.next(exports.parseCookies(cookie));
                console.log('Cookies Retrieved ...');
            });
        });
        req.end(token);
    });
};
exports.parseCookies = (cookies) => {
    let cookieMap = {};
    cookies.forEach(cookie => {
        const idx = cookie.indexOf('=');
        const name = cookie.substr(0, idx + 1);
        const value = cookie.substr(idx + 1, cookie.length);
        cookieMap[name] = value;
    });
    return cookieMap;
};
//# sourceMappingURL=service.js.map