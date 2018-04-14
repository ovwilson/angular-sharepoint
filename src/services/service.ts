import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as https from 'https';
import { Observable } from 'rxjs/Observable';

export const getSAMLTemplate = (): string => { return fs.readFileSync('./saml.xml', 'utf8'); }

export const requestToken = (saml: string, options: any): Observable<any> => {
    return Observable.create((observer: any) => {
        const req = https.request(options, (response) => {
            let xml = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                xml += chunk;
            })
            response.on('end', () => {
                observer.next(xml);
                console.log('XML Retrieved ...');
            })
        });
        req.end(saml);
    });
}

export const parseToken = (xml: string): Observable<any> => {
    return Observable.create((observer: any) => {
        const parser = new xml2js.Parser({ emptyTag: '' });
        parser.on('end', (js: any) => {
            if (js["S:Envelope"]["S:Body"][0]["S:Fault"]) {
                const error = js["S:Envelope"]["S:Body"][0]["S:Fault"][0]["S:Detail"][0]["psf:error"][0]["psf:internalerror"][0]["psf:text"][0];
                observer.error(error);
            }
            else {
                const token = js["S:Envelope"]["S:Body"][0]["wst:RequestSecurityTokenResponse"][0]["wst:RequestedSecurityToken"][0]["wsse:BinarySecurityToken"][0]._;
                observer.next(token);
                console.log('Token Parsed ...')
            }
        });
        parser.parseString(xml);
    });
}

export const submiToken = (token: string, options: any): Observable<string> => {
    return Observable.create((observer: any) => {
        const req = https.request(options, (res) => {
            let xml = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => xml += chunk)
            res.on('end', () => {
                const cookie = res.headers['set-cookie'];
                observer.next(parseCookies(cookie));
                console.log('Cookies Retrieved ...');
            })
        })
        req.end(token);
    });
}

export const parseCookies = (cookies: string[]) => {
    let cookieMap : any = {};
    cookies.forEach(cookie => {
        const idx = cookie.indexOf('=');
        const name = cookie.substr(0, idx);
        const value = cookie.substr(idx + 1, cookie.length);
        cookieMap[name] =value;
    })
    return cookieMap;
}
