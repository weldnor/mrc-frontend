import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomePage} from './pages/home/home.page';
import {MainRoutingModule} from './main-routing.module';
import { LoginPage } from './pages/login/login.page';


@NgModule({
  declarations: [
    HomePage,
    LoginPage,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
  ]
})
export class MainModule {
}
