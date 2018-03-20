// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBhiQWMdx4fhRFiGIH7ZGk4YEdN19yRhNw",
    authDomain: "hopehouse-d.firebaseapp.com",
    databaseURL: "https://hopehouse-d.firebaseio.com",
    projectId: "hopehouse-d",
    storageBucket: "hopehouse-d.appspot.com",
    messagingSenderId: "786844687776"
  }
};