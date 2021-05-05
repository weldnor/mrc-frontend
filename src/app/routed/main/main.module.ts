import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomePage} from './pages/home/home.page';
import {MainRoutingModule} from './main-routing.module';


@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
  ]
})
export class MainModule {
}
