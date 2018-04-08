"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js = __importStar(require("xml2js"));
const Observable_1 = require("rxjs/Observable");
exports.parseToken = (xml) => {
    return Observable_1.Observable.create((observer) => {
        let parser = new xml2js.Parser({ emptyTag: '' });
        parser.on('end', (js) => {
            if (js["S:Envelope"]["S:Body"][0]["S:Fault"]) {
                const error = js["S:Envelope"]["S:Body"][0]["S:Fault"][0]["S:Detail"][0]["psf:error"][0]["psf:internalerror"][0]["psf:text"][0];
                observer.error(error);
            }
            else {
                const token = js["S:Envelope"]["S:Body"][0]["wst:RequestSecurityTokenResponse"][0]["wst:RequestedSecurityToken"][0]["wsse:BinarySecurityToken"][0]._;
                observer.next(token);
            }
        });
        parser.parseString(xml);
    });
};
//# sourceMappingURL=service.js.map