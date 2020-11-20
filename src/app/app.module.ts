import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { InjectionToken, NgModule, Sanitizer } from '@angular/core';
import { AppComponent } from './app.component';
import { ResourceValidationDomSanitizer, URLValidatorFn } from './resource-validation-dom-sanitizer.service';
import { DOCUMENT } from '@angular/common';
import { environment } from '../environments/environment';


/**
 * Tests a sanitized url string against a list of URL fragments in a whitelist
 * according to the needs of the system
 * in this example we check the resource against allowed protocol, hostname, and port
 * this could be further extended to add an allowed path if desired, or path
 * @param url a URL to test against the whitelist
 */
export const WHITELIST_URL_VALIDATOR_FN: URLValidatorFn = (sanitizedValue: string): boolean => {
    const url = new URL(sanitizedValue);
    let valid = false;
    // the whitelist should come off of a service, not the environment but this is just an example
    for (const whitelistedURL of environment.IFrameSanitizerWhitelist) {
      if (whitelistedURL !== null && whitelistedURL !== undefined) {
        if (url.protocol === whitelistedURL.protocol
            && url.hostname === whitelistedURL.hostname
            && url.port === whitelistedURL.port ) {
          valid = true;
          break;
        }
        if (!valid) {
          // in real life send to system telemetry but don't show the user this message, it wmight open an attack pathway
          console.log('non-whitelisted value used in a resource URL:' + String(sanitizedValue));
        }
      }
    }
    return valid;
};

export const IFRAME_URL_VALIDATOR_FN: InjectionToken<URLValidatorFn> = new InjectionToken<URLValidatorFn> (
  'IFRAME_URL_VALIDATOR_FN' , { providedIn: 'root', factory: () => WHITELIST_URL_VALIDATOR_FN }
);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    {provide: Sanitizer, useExisting: DomSanitizer},
    {provide: DomSanitizer, useClass: ResourceValidationDomSanitizer, deps: [DOCUMENT, IFRAME_URL_VALIDATOR_FN]},

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
