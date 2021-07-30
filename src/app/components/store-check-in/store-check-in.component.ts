import { Component, OnInit, Input } from '@angular/core';
import { StoreService } from '../../service/store.service';
import { Store } from '../../models/store';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Visitor } from '../../models/visitor';
@Component({
  selector: 'app-store-check-in',
  templateUrl: './store-check-in.component.html',
  styleUrls: ['./store-check-in.component.scss']
})
export class StoreCheckInComponent implements OnInit {
  store: Store;
  storeId: number;
  stores: Store[];
  userForm: FormGroup;
  visitorInfo: Visitor;
  todayTime: Date;
  thankYou: boolean;
  worngStoreId: boolean;
  labelText = 'ID';
  constructor(
    private storeService: StoreService,
    private formBuilder: FormBuilder
  ) {
    this.userForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.email]],
    });
  }




  getStores(): void {
    this.storeService.getStores()
      .subscribe(stores => this.stores = stores);
  }

  getStoreById(id: number): void {
    this.storeService.getStoreById(id)
      .subscribe(store => {
        this.store = store[0];
        if (this.store === undefined) {
          this.labelText = 'Worng Store ID';
          this.storeId = null;
        } else {
          this.labelText = 'ID';
        }
      });
  }

  isStoreExicst(): void {
    if (this.store) {

    }
  }


  onSubmit() {
    if (this.userForm.invalid == true) {
      return;
    } else {
      this.visitorInfo = new Visitor(this.userForm.value);
      this.visitorInfo.time = new Date().toLocaleString();

      this.storeService.addVisitoreToStore(this.visitorInfo, this.store.id)
        .subscribe(message => {
        });
      this.thankYou = true;
    }
  }
  goBackToCheckInForm() {
    this.storeId = null;
    this.userForm.reset();
    this.store = null;
    this.thankYou = false;
  }

  ngOnInit() {


  }

}
