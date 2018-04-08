import * as urlParse from 'url';
import * as https from 'https';
import * as service from './../services/service';
import { Options, Params } from './../models/model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';

export class Credentials {
    _options: Options;
    _params: Params;
    _token: string;

    constructor(options: Options, params: Params) {
        this._options = options;
        this._params = params;
        this._token = '';
    }

    get options(): Options { return this._options; }
    get params(): Params { return this._params; }

    get url(): urlParse.UrlWithStringQuery { return urlParse.parse(this.options.webServerUrl) }
    get username(): string | undefined { return this._options.username }
    get password(): string | undefined { return this._options.password }
    get endPoint(): string { return `${this.url.protocol}//${this.url.hostname}${this._params.login}`; }
    get SAMLTemplate(): string { return service.getSAMLTemplate() }
    get stsParams(): any {
        return {
            username: this.username,
            password: this.password,
            endpoint: this.endPoint
        }
    }
    get token() { return this._token }
    set token(t: string) { this._token = t }

    buildSamlRequest() {
        let saml = this.SAMLTemplate;
        Object.keys(this.stsParams)
            .forEach(key => saml = saml.replace('[' + key + ']', this.stsParams[key]));
        return saml;
    }

    getTokenOptions(saml: string) {
        return {
            method: 'POST',
            host: this._params.stsHost,
            path: this._params.stsPath,
            headers: { 'Content-Length': saml.length }
        }
    }

    requestToken() {

        const saml = this.buildSamlRequest();
        const options = this.getTokenOptions(saml);
        
        let req = https.request(options, (response) => {
            let xml = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                xml += chunk;
            })
            response.on('end', () => {
                const token$ = service.parseToken(xml).take(1);
                token$.subscribe(token => {
                    console.log(token);
                    this.token = token;
                },
                    (err) => console.error(err),
                    () => console.log('Token Request Complete.')
                );
            })
        });
        req.end(saml);
    }

    signin(){
        this.requestToken();
    }

}