
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { AuthService } from 'angularx-social-login';
import { StoreOwner } from '../../models/storeOwner';
import { Router } from '@angular/router';
import { Store } from '../../models/store';
import { Visitor } from '../../models/visitor';
import { IgxDialogComponent } from 'igniteui-angular/';
import { StoreService } from '../../service/store.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})



export class DashboardComponent implements OnInit, OnDestroy {
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
    // Start interval that checks if new day started for the current visitors queue
    localStorage.setItem('lastKnownDate', new Date().toLocaleString());
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

  ngOnDestroy() {
    if (this.checkForDateInterval) {
      clearInterval(this.checkForDateInterval);
    }
  }

  /**
   *
   */
  public onStoreOwnerLoggedOut(): void {
  this.logout();
}

  /**
   * Remove visitor from local queue
   * @param rowId
   */
 public onVisitorRemoveFromQueue(rowId: number): void {
    this.todayVisitors.splice(rowId, 1);
    this.todayVisitors = this.todayVisitors.slice();
    this.nextVisitors = this.todayVisitors[0];
  }

  /**
   * Emits from app-avatar-and-logout
   */
  onLogoutEmit() {
    this.logout();
  }

  /**
   * Open socket for server side events
   */
  private initStream(): void {
    const stream = new EventSource('http://localhost:3000/stream');
    stream.onmessage = (event) => {
      if (event.data !== 'null') {
        // Updates the new visitors list
        this.store = (JSON.parse(event.data))[0];
        localStorage.setItem('store', JSON.stringify(this.store));
        this.visitors = this.store.visitors;
        this.visitors.map((visitor, index) => {
          visitor.id = index;
        });

        // Update the Queue list
        const lastVisitor: Visitor = this.visitors[(this.visitors.length) - 1];
        this.todayVisitors = this.todayVisitors.slice();
        this.todayVisitors.push(lastVisitor);
        this.nextVisitors = this.todayVisitors[0];
      } else {
        alert('No Access - please log in again -  visitor not added');
        this.logout();
      }
    };

  }

  /**
   * Add visitor to store
   */
  public addVisitorManually(dialog: any): void {
    this.visitor.time = new Date().toLocaleString();
    this.storeService.addVisitoreToStore(this.visitor, this.store.id)
      .subscribe(message => {
      });
    if (dialog) {
      dialog.close();
    }
  }

  /**
   * cancel button of add visitor modal
   */
  public cancel(dialog: any): void {
    if (dialog) {
      dialog.close();
    }
    this.visitor = new Visitor();
  }

  /**
   * Interval that checks if days has changed
   * If day changed we init the todayVisitors array
   */
  private checkForDate(): void {
    const now = (new Date().toLocaleString().split(','))[0];
    const lastKnownDate = (localStorage.getItem('lastKnownDate').split(','))[0];
    console.log(`now is:${now} and last known date is:${lastKnownDate}`);
    if (now !== lastKnownDate) {
      console.log(`inside if statment ---- now is:${now} and last known date is:${lastKnownDate}`);
      this.todayVisitors = [];
    }
  }

  /**
   * Logout store owner and clear interval
   */
  public logout(): void {
    if (this.checkForDateInterval) {
      clearInterval(this.checkForDateInterval);
    }
    localStorage.clear();
    this.OAuth.signOut().then(data => {
      this.router.navigate([``]);
    });
  }
}
