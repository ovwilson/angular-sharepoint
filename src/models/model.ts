export interface Options {
    username: string | undefined;
    password: string | undefined;
    webServerUrl: string | any;
}

export interface Params {
    login: string;
    stsHost: string;
    stsPath: string;
    odatasvc: string;
}