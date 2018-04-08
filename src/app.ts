import * as fs from 'fs';
import * as urlParse from 'url';
import * as https from 'https';
import { Credentials } from './credentials';
import { Options, Params } from './models/model';

const dotenv = require('dotenv').config();

const options: Options = {
      username: process.env.USER,
      password: process.env.PASS,
      webServerUrl: process.env.WEBSERVER
}

const params: Params = {
      login: '/_forms/default.aspx?wa=wsignin1.0',
      stsHost: 'login.microsoftonline.com',
      stsPath: '/extSTS.srf',
      odatasvc: '/_vti_bin/ListData.svc/'
}


const credentials = new Credentials(options, params);
credentials.signin();