import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { IgxGridComponent, IGridEditEventArgs} from 'igniteui-angular/';
import { Store } from '../../models/store';
import { Visitor } from '../../models/visitor';
import { StoreService } from '../../service/store.service'


@Component({
  selector: 'app-visitors-grid',
  templateUrl: './visitors-grid.component.html',
  styleUrls: ['./visitors-grid.component.scss'],
  providers: [StoreService]

})
export class VisitorsGridComponent implements OnInit {
  @Input() store: Store;
  @Input() visitors: Visitor[];
  @Output() logoutEvent = new EventEmitter<boolean>();
  
  @ViewChild('myGrid', { read: IgxGridComponent })
  public gridRowEdit: IgxGridComponent;
  
  constructor(private storeService: StoreService) { }

  ngOnInit() {
  }
  
  editDone(event: IGridEditEventArgs) {
    const newRow = event.newValue;
    this.storeService.updateVisitoreToStore(newRow, this.store.id)
      .subscribe(store => {
        if (store === undefined) {
          alert("Something is worng you are logut");
          this.logoutEvent.emit();

        }
        else {
          this.store = store[0];
          this.visitors = this.store.visitors;
          this.visitors.map((visitor, index) => {
            visitor.id = index;
          });
          localStorage.setItem('store', JSON.stringify(this.store));
        }

      })
  }
}
