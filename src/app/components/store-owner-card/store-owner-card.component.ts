import { Component, OnInit, Input } from '@angular/core';
import { Store } from '../../models/store';

@Component({
  selector: 'app-store-owner-card',
  templateUrl: './store-owner-card.component.html',
  styleUrls: ['./store-owner-card.component.scss']
})
export class StoreOwnerCardComponent implements OnInit {
  @Input() store: Store;
  constructor() { }

  ngOnInit() {
  }

}
