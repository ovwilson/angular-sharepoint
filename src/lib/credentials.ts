import * as urlParse from 'url';
import * as service from './../services/service';
import { Options, Params } from './../models/model';
import { Observable } from 'rxjs/Observable';
import { switchMap, take, tap } from 'rxjs/operators';

export class Credentials {
    _options: Options;
    _params: Params;

    constructor(options: Options, params: Params) {
        this._options = options;
        this._params = params;
    }

    get options(): Options { return this._options; }
    get params(): Params { return this._params; }

    get url(): urlParse.UrlWithStringQuery { return urlParse.parse(this.options.webServerUrl) }
    get username(): string | undefined { return this.options.username }
    get password(): string | undefined { return this.options.password }
    get endPoint(): string { return `${this.url.protocol}//${this.url.hostname}${this._params.login}`; }
    get SAMLTemplate(): string { return service.getSAMLTemplate() }
    get stsParams(): any {
        return {
            username: this.username,
            password: this.password,
            endpoint: this.endPoint
        }
    }

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

    getSPOOptions() {
        const endPointUrl = urlParse.parse(this.endPoint);
        return {
            method: 'POST',
            host: endPointUrl.hostname,
            path: endPointUrl.path,
            headers: this.params.userAgentHeader
        }
    }

    requestToken() {
        const saml = this.buildSamlRequest();
        const options = this.getTokenOptions(saml);
        return service.requestToken(saml, options);
    }

    parseToken(xml: string): Observable<string> {
        return service.parseToken(xml);
    }

    submitToken(token: string) {
        const options = this.getSPOOptions();
        return service.submiToken(token, options);
    }

    signin() {
        return this.requestToken().pipe(take(1),
            switchMap(xml => this.parseToken(xml)), take(1),
            switchMap(token => this.submitToken(token)), take(1));
    }

}
