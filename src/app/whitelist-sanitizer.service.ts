import { ɵDomSanitizerImpl as DomSanitizerImpl,
  SafeValue } from '@angular/platform-browser';
import { Injector,
    Inject,
    Injectable,
    SecurityContext,
    ɵBypassType as BypassType,
    ɵallowSanitizationBypassAndThrow as allowSanitizationBypassOrThrow,
    ɵunwrapSafeValue as unwrapSafeValue,
    ɵ_sanitizeUrl as _sanitizeUrl } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../environments/environment';

export interface WhitelistEntry {
  hostname: string;
  ports: number[];

  protocol: 'http:' | 'https:';
}

export function whitelistDomSanitizerFactory(injector: Injector) {
    return new WhitelistDomSanitizer(injector.get(DOCUMENT));
  }


@Injectable({providedIn: 'root', useFactory: whitelistDomSanitizerFactory, deps: [Injector]})
export class WhitelistDomSanitizer extends DomSanitizerImpl {
constructor(@Inject(DOCUMENT) private document: any) {
    super(document);
}

sanitize(ctx: SecurityContext, value: SafeValue|string|null): string|null {
    console.log(`hey we overrode the sanitizer: sanitizing context: ${ctx} value: ${String(value)}  `);
    if (value == null) {
       return null;
    }
    switch (ctx) {
      /* overrides the default behavior of a resource url (media, embed, frame, iframe) which simply throws an error
      in this example we check the resource against allowed protocol, hostname, and port
      this could be further extended to add an allowed path if desired, or path. Unfortunately
      we don't know which of the document tags this came from, only that it is one of the four.
      */

      case SecurityContext.RESOURCE_URL:
        if (allowSanitizationBypassOrThrow(value, BypassType.ResourceUrl)) {
          return unwrapSafeValue(value);
        } else {
          // sanitize first and THEN test for whitelisting - uses Angular's internal sanitizer
          const sanitized = _sanitizeUrl(String(value));
          const testUrl = new URL(sanitized);
          let valid = false;
          //the whitelist should come off of a service that knows the correct ip addresses/domain names/
          for (const allowed of environment.IFrameSanitizerWhitelist) {
            if (allowed !== null && allowed !== undefined) {
              const entry = allowed as unknown as WhitelistEntry;
              if (testUrl.protocol === entry.protocol
                  && testUrl.hostname === entry.hostname
                  && entry.ports.includes(Number(testUrl.port))) {
                valid = true;
                break;
              }
            }
          }
          if (valid) {
            return sanitized;
          }
          else {
            throw new Error(
              'non-whitelisted value used in a resource URL:' + String(value));
          }
        }
        /* overrides the default behavior of a script url which simply throws an error - one could similarly whitelist */
        /* case SecurityContext.SCRIPT:
          if (allowSanitizationBypassOrThrow(value, BypassType.Script)) {
            return unwrapSafeValue(value);
          }
          throw new Error('unsafe value used in a script context');
          */
      default:
        super.sanitize(ctx, value);
    }
  }


}
