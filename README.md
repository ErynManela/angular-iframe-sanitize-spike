# IframeApp


Experiment app to allow the url for an iframe to be sanitized using Angular's internal sanitizer implementation.

This experiment places the whitelist as objects in the environments.ts files but in the final version this should be supplied via 
a service that will be forwards-looking for when there is a system-server and not just the localhost, so it should be smart enough to 
supply the correct domains, ports, protocol, and path.

The iframe source url is set within the app.component.ts and set as the [src] attribute of the iframe in the app.component.html

The whitelist checking function is defined in the app/app.module.ts and provided as an injection token
The sanitizer override code is in app/resource-validation-dom-sanitizer.service.ts, by default it does not validate
will need unit tests

the service is provided as Sanitizer and DomSanitizer providers in app.module.ts, in Raider it should be provided in the device frontent application module.

## Running the spike project
Running this depends on having some other web server running on port 4300, or edit 

Run `ng serve --port 4200` for a dev server. 

Navigate to `http://localhost:4200/`. 

