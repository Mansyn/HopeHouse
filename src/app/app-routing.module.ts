import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AccountComponent } from './account/account.component';
import { RegisterComponent } from './account/register/register.component';
import { AdminComponent } from './admin/admin.component';
import { ContactComponent } from './contact/contact.component'
import { SchedulesComponent } from './schedules/schedules.component';
import { LoginComponent } from './account/login/login.component';

import { VolunteerGuard } from './core/volunteer.guard';
import { CanReadGuard } from './core/can-read.guard';
import { ScheduleComponent } from './schedule/schedule.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'account/register', component: RegisterComponent },
  { path: 'account/login', component: LoginComponent },
  { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule' },
  { path: 'schedules', component: SchedulesComponent, canActivate: [VolunteerGuard] },
  { path: 'schedule/:id', component: ScheduleComponent, canActivate: [VolunteerGuard] },
  { path: '*', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
