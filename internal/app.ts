
import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Module_internal_team0} from './team0/module';
import {Module_internal_team1} from './team1/module';
import {Module_internal_team2} from './team2/module';
import {Module_internal_team3} from './team3/module';
import {Module_internal_team4} from './team4/module';
import {Module_internal_team5} from './team5/module';
import {Module_internal_team6} from './team6/module';
import {Module_internal_team7} from './team7/module';
import {Module_internal_team8} from './team8/module';
import {Module_internal_team9} from './team9/module';

@Component({
  selector: 'internal-app',
  template: `<h1>internal division homepage</h1>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
    imports: [
      BrowserModule,
      Module_internal_team0,
      Module_internal_team1,
      Module_internal_team2,
      Module_internal_team3,
      Module_internal_team4,
      Module_internal_team5,
      Module_internal_team6,
      Module_internal_team7,
      Module_internal_team8,
      Module_internal_team9
    ],
})
export class AppModule {}
