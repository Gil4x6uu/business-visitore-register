import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {StoreCheckInComponent} from './components/store-check-in/store-check-in.component';
import {LoginComponent} from './components/login/login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {MainScreenComponent} from './pages/main-screen/main-screen.component';
import {MonitorQueuesComponent} from './components/monitor-queues/monitor-queues.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/HomePage',
    pathMatch: 'full'
  },
  {
    path: 'HomePage',
    component: MainScreenComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {
      title: 'Dashboard Page'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
