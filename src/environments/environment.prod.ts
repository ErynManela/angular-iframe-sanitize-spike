import { TransitiveCompileNgModuleMetadata } from '@angular/compiler';

export const environment = {
  IFrameSanitizerWhitelist: [{protocol: 'https:', hostname: '127.0.0.1', ports: [4300]}, {protocol: 'https:', hostname: 'localhost', ports: [4300]}]
};
