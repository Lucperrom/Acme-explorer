// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebaseConfig : {
    apiKey: "AIzaSyAyT0CG2kNnjjY0vKGOcmTGU2quFsrFc2E",
    authDomain: "tec-cli.firebaseapp.com",
    projectId: "tec-cli",
    storageBucket: "tec-cli.firebasestorage.app",
    messagingSenderId: "588401779872",
    appId: "1:588401779872:web:3e9a865c8cf779c97715c5"
  },
  production: false,
  backendApiBaseUrl: 'http://localhost:3000'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
