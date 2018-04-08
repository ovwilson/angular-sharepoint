import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { Observable } from 'rxjs/Observable';

export const getSAMLTemplate = (): string =>  { return fs.readFileSync('./saml.xml', 'utf8'); }

export const parseToken = (xml: string): Observable<any> => {
    return Observable.create((observer: any) => {
        let parser = new xml2js.Parser({ emptyTag: '' });
        parser.on('end', (js: any) => {
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
}

