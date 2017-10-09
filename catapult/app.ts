
import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Module_catapult_team0} from './team0/module';
import {Module_catapult_team1} from './team1/module';
import {Module_catapult_team2} from './team2/module';
import {Module_catapult_team3} from './team3/module';
import {Module_catapult_team4} from './team4/module';
import {Module_catapult_team5} from './team5/module';
import {Module_catapult_team6} from './team6/module';
import {Module_catapult_team7} from './team7/module';
import {Module_catapult_team8} from './team8/module';
import {Module_catapult_team9} from './team9/module';

@Component({
  selector: 'catapult-app',
  template: `<h1>catapult division homepage</h1>`,
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
    imports: [
      BrowserModule,
      Module_catapult_team0,
      Module_catapult_team1,
      Module_catapult_team2,
      Module_catapult_team3,
      Module_catapult_team4,
      Module_catapult_team5,
      Module_catapult_team6,
      Module_catapult_team7,
      Module_catapult_team8,
      Module_catapult_team9
    ],
})
export class AppModule {}
