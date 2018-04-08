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
const https = __importStar(require("https"));
const service = __importStar(require("./services/service"));
require("rxjs/add/operator/take");
class Credentials {
    constructor(options, params) {
        this._options = options;
        this._params = params;
        this._token = '';
    }
    get options() { return this._options; }
    get params() { return this._params; }
    get url() { return urlParse.parse(this.options.webServerUrl); }
    get username() { return this._options.username; }
    get password() { return this._options.password; }
    get endPoint() { return `${this.url.protocol}//${this.url.hostname}${this._params.login}`; }
    get SAMLTemplate() { return service.getSAMLTemplate(); }
    get stsParams() {
        return {
            username: this.username,
            password: this.password,
            endpoint: this.endPoint
        };
    }
    get token() { return this._token; }
    set token(t) { this._token = t; }
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
    requestToken() {
        const saml = this.buildSamlRequest();
        const options = this.getTokenOptions(saml);
        let req = https.request(options, (response) => {
            let xml = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                xml += chunk;
            });
            response.on('end', () => {
                const token$ = service.parseToken(xml).take(1);
                token$.subscribe(token => {
                    console.log(token);
                    this.token = token;
                }, (err) => console.error(err), () => console.log('Token Request Complete.'));
            });
        });
        req.end(saml);
    }
    signin() {
        this.requestToken();
    }
}
exports.Credentials = Credentials;
//# sourceMappingURL=credentials.js.map