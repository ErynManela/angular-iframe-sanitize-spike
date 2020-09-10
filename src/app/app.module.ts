import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule, Sanitizer } from '@angular/core';

import { AppComponent } from './app.component';
import { WhitelistDomSanitizer } from './whitelist-sanitizer.service';
import { DOCUMENT } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    {provide: Sanitizer, useExisting: DomSanitizer},
    {provide: DomSanitizer, useClass: WhitelistDomSanitizer, deps: [DOCUMENT]},

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
