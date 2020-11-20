import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'iframe-app';

  validiframesrc = 'https://angular.io';
  invalidiframesrc = 'https//vuejs.org';
}
