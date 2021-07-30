import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { IgxListComponent } from 'igniteui-angular';
import { Visitor } from '../../models/visitor';

@Component({
  selector: 'app-monitor-queues',
  templateUrl: './monitor-queues.component.html',
  styleUrls: ['./monitor-queues.component.scss']
})
export class MonitorQueuesComponent implements OnInit {
  @ViewChild("queueMonitor", { static: true })
  public list: IgxListComponent;

  @Input() VisitorsQueue : Visitor[];
  @Output() visitorRemoveFromQueue = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }
  
  
  public deleteRow(rowID): void {
    this.visitorRemoveFromQueue.emit(rowID);
  }
   
}
