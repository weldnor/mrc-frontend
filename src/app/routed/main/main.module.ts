import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomePage} from './pages/home/home.page';
import {MainRoutingModule} from './main-routing.module';
import {LoginPage} from './pages/login/login.page';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import { RegisterPage } from './pages/register/register.page';


@NgModule({
  declarations: [
    HomePage,
    LoginPage,
    RegisterPage,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
  ]
})
export class MainModule {
}
