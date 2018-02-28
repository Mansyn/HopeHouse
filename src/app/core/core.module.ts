import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { AdminGuard } from './admin.guard';
import { CanReadGuard } from './can-read.guard';
import { VolunteerGuard } from './volunteer.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [AuthService, AdminGuard, VolunteerGuard, CanReadGuard]
})
export class CoreModule { }
