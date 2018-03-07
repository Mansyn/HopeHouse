import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { AdminComponent } from './account/admin/admin.component';
import { ContactComponent } from './contact/contact.component'
import { ServeComponent } from './serve/serve.component';

import { AdminGuard } from './core/admin.guard';
import { VolunteerGuard } from './core/volunteer.guard';
import { CanReadGuard } from './core/can-read.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'account/admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'serve', component: ServeComponent, canActivate: [VolunteerGuard] },
  { path: '*', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
