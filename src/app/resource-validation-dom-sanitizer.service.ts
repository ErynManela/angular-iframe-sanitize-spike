import {
  ɵDomSanitizerImpl,
  SafeValue
} from '@angular/platform-browser';
import {
    isDevMode,
    Injector,
    Inject,
    Injectable,
    SecurityContext,
    ɵBypassType,
    ɵallowSanitizationBypassAndThrow,
    ɵunwrapSafeValue,
    ɵ_sanitizeUrl,
    InjectionToken
  } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * A URL Validator function takes a sanitized string value and returns whether it is valid according
 * to some external parameter such as a whitelist
 */
export type URLValidatorFn = (sanitizedValue: string) => boolean;

export const ALWAYS_INVALID: URLValidatorFn = (sanitizedValue: string): boolean => false;
/**
 * Injection token for a URLValidatorFn that always returns false
 */
export const URL_INVALID_FN: InjectionToken<URLValidatorFn>
  = new InjectionToken<URLValidatorFn>('URL_INVALID_FN', { providedIn: 'root', factory: () => ALWAYS_INVALID});


/**
 * Extend the base Angular DomSanitizerImpl to sanitize urls for iframe and then
 * validates according to an injected or provided function.
 */
@Injectable({
  providedIn: 'root',
  deps: [Injector]
})
export class ResourceValidationDomSanitizer extends ɵDomSanitizerImpl {


  /**
   * Constructor for the sanitizer
   * @param document the main rendering context
   * @param isFrameURLValid a function determining whether the url, if sanitizable,
   * is valid according to some criteria such as a whitelist
   */
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(URL_INVALID_FN) private isFrameURLValid: URLValidatorFn /* ,
    //@Inject(URL_INVALID_FN) private isScriptURLValid: URLValidatorFn */ ) {
      super(document);
  }

  /**
   * Sanitizes a value in a given security context.
   * For iframes, whill sanitize and then test a sanitized value against some external validity test.
   * Uses Angulars internal methods for sanitization.
   * @param ctx the security context
   * @param value the value to be sanitized and tested.
   */
  sanitize(ctx: SecurityContext, value: SafeValue|string|null): string|null {
    if (value == null) {
      return null;
  }
    if (isDevMode()) {
      // in real life use a logging service for telemetry
      console.info(`hey we overrode the sanitizer: sanitizing context: ${ctx} value: ${String(value)}  `);
    }

    // switch based on the security context
    switch (ctx) {
        /* overrides the default behavior of a resource url (media, embed, frame, iframe)
        which throws an error in the default impl.
        Unfortunately, we don't know which of the document tags this came from, only that it is one of the four.
        */
        case SecurityContext.RESOURCE_URL:
          // if the user has flagged to just bypass security, let them, and return the unwrapped value
          if (ɵallowSanitizationBypassAndThrow(value, ɵBypassType.ResourceUrl)) {
            return ɵunwrapSafeValue(value);

          // otherwise we will sanitize and then check if the url is valid against a required function
          } else {

            // unless we are going to return false anyway
            if (!(this.isFrameURLValid === ALWAYS_INVALID)) {

              // sanitize first and THEN test the passed in validator, use Angular's internal sanitizer
              const sanitized = ɵ_sanitizeUrl(String(value));

              // test against the passed in function, and return the value if it is valid
              if (this.isFrameURLValid(sanitized)) {
                return sanitized;
              }

            // if the sanitized url is invalid, throw an error
            } else {
              throw new Error('unsafe value used in a resource URL context (see http://g.co/ng/security#xss)');
            }
          }
          break;

         /*
          //  overrides the default behavior of a script url which simply throws an error - one could similarly whitelist
          case SecurityContext.SCRIPT:
          if (ɵallowSanitizationBypassAndThrow(value, ɵBypassType.ResourceUrl)) {
            return ɵunwrapSafeValue(value);
          } else {
            if (!(this.isScriptURLValid === ALWAYS_INVALID)) {

              const sanitized = ɵ_sanitizeUrl(String(value));
              if (this.isScriptURLValid(sanitized)) {
                return sanitized;
              }
            } else {
              throw new Error('unsafe value used in a script context');
            }
          }
          break;
        */
        default:
          super.sanitize(ctx, value);
      }
    }

}
