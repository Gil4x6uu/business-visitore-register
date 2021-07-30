import { Input, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StoreOwner } from '../../models/storeOwner';

@Component({
  selector: 'app-avatar-and-logout',
  templateUrl: './avatar-and-logout.component.html',
  styleUrls: ['./avatar-and-logout.component.scss']
})
export class AvatarAndLogoutComponent implements OnInit {
  @Input() storeOwner : StoreOwner;
  @Output() logedOut = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }
  
  logout() {
    this.logedOut.emit();
  }

}
