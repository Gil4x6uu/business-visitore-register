
import { Component, OnInit, ViewChild} from '@angular/core';
import { AuthService } from 'angularx-social-login';
import { StoreOwner } from '../../models/storeOwner'
import { Router } from '@angular/router';
import { Store } from '../../models/store';
import { Visitor } from '../../models/visitor';
import { IgxDialogComponent } from 'igniteui-angular/';
import { StoreService } from '../../service/store.service'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})



export class DashboardComponent implements OnInit {
  public storeOwner = new StoreOwner();
  public store: Store;
  public visitors: Visitor[];
  public todayVisitors: Visitor[] = [];
  public nextVisitors: Visitor;
  public visitor: Visitor;
  public checkForDateInterval;
 
  constructor(
    public OAuth: AuthService,
    private router: Router,
    private storeService: StoreService,
  ) {
  }


  ngOnInit() {
    localStorage.setItem("lastKnownDate", new Date().toLocaleString())
    this.checkForDateInterval = setInterval(this.checkForDate, 50000);
    this.storeOwner = JSON.parse(localStorage.getItem('storeOwner'));
    this.store = JSON.parse(localStorage.getItem('store'));
    this.visitors = this.store.visitors;
    this.visitor = new Visitor();
    this.visitors.map((visitor, index) => {
      visitor.id = index;
    });
    console.log(this.store);
    this.initStream();
  }


onStoreOwnerLoggedOut(){
  this.logout();
}

  onVisitorRemoveFromQueue(rowId: number) {
    this.todayVisitors.splice(rowId, 1);
    this.todayVisitors = this.todayVisitors.slice();
    this.nextVisitors = this.todayVisitors[0];
  }
  
  onLogoutEmit(){
    this.logout();
  }




  initStream() {
    const stream = new EventSource('http://localhost:3000/stream');
    stream.onmessage = (event) => {
      if (event.data !== "null") {
        this.store = (JSON.parse(event.data))[0];
        localStorage.setItem('store', JSON.stringify(this.store));
        this.visitors = this.store.visitors;
        this.visitors.map((visitor, index) => {
          visitor.id = index;
        });
        const lastVisitor: Visitor = this.visitors[(this.visitors.length) - 1]
        this.todayVisitors = this.todayVisitors.slice();
        this.todayVisitors.push(lastVisitor);
        this.nextVisitors = this.todayVisitors[0];
      }
      else {
        alert("No Access - please log in again -  visitor not added");
        this.logout();
      }
    }

  }

  public addRow() {
    this.visitor.time = new Date().toLocaleString();
    this.storeService.addVisitoreToStore(this.visitor, this.store.id)
      .subscribe(message => {
      });
    this.cancel();
  }

  public cancel() {
    //this.dialog.close();
    this.visitor = new Visitor();
  }
  // Interval that checks if today become tomorrow
  checkForDate() {
    const now = (new Date().toLocaleString().split(","))[0];
    const lastKnownDate = (localStorage.getItem("lastKnownDate").split(","))[0];
    console.log(`now is:${now} and last known date is:${lastKnownDate}`)
    if (now != lastKnownDate) {
      console.log(`inside if statment ---- now is:${now} and last known date is:${lastKnownDate}`)
      this.todayVisitors = [];
    }
  }

  logout() {
    clearInterval(this.checkForDateInterval);
    localStorage.clear();
    this.OAuth.signOut().then(data => {
      this.router.navigate([`mainScreen`]);
    });
  }
}
