"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const urlParse = __importStar(require("url"));
const service = __importStar(require("./../services/service"));
const operators_1 = require("rxjs/operators");
class Credentials {
    constructor(options, params) {
        this._options = options;
        this._params = params;
    }
    get options() { return this._options; }
    get params() { return this._params; }
    get url() { return urlParse.parse(this.options.webServerUrl); }
    get username() { return this.options.username; }
    get password() { return this.options.password; }
    get endPoint() { return `${this.url.protocol}//${this.url.hostname}${this._params.login}`; }
    get SAMLTemplate() { return service.getSAMLTemplate(); }
    get stsParams() {
        return {
            username: this.username,
            password: this.password,
            endpoint: this.endPoint
        };
    }
    buildSamlRequest() {
        let saml = this.SAMLTemplate;
        Object.keys(this.stsParams)
            .forEach(key => saml = saml.replace('[' + key + ']', this.stsParams[key]));
        return saml;
    }
    getTokenOptions(saml) {
        return {
            method: 'POST',
            host: this._params.stsHost,
            path: this._params.stsPath,
            headers: { 'Content-Length': saml.length }
        };
    }
    getSPOOptions() {
        const endPointUrl = urlParse.parse(this.endPoint);
        return {
            method: 'POST',
            host: endPointUrl.hostname,
            path: endPointUrl.path,
            headers: this.params.userAgentHeader
        };
    }
    requestToken() {
        const saml = this.buildSamlRequest();
        const options = this.getTokenOptions(saml);
        return service.requestToken(saml, options);
    }
    parseToken(xml) {
        return service.parseToken(xml);
    }
    submitToken(token) {
        const options = this.getSPOOptions();
        return service.submiToken(token, options);
    }
    signin() {
        return this.requestToken().pipe(operators_1.take(1), operators_1.switchMap(xml => this.parseToken(xml)), operators_1.take(1), operators_1.switchMap(token => this.submitToken(token)), operators_1.take(1));
    }
}
exports.Credentials = Credentials;
//# sourceMappingURL=credentials.js.map