import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {StoreService} from '../../service/store.service';
import {Store} from '../../models/store';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Visitor} from '../../models/visitor';
import {IgxDialogComponent, IgxDialogModule} from 'igniteui-angular';

@Component({
  selector: 'app-store-check-in',
  templateUrl: './store-check-in.component.html',
  styleUrls: ['./store-check-in.component.scss']
})
export class StoreCheckInComponent implements OnInit {
  @ViewChild('dialog1', { read: IgxDialogComponent, static: true })
  public dialog: IgxDialogComponent;

  constructor(
    private storeService: StoreService,
    private formBuilder: FormBuilder) {

  }

  public store: Store;
  public storeId: number;
  public userForm: FormGroup;
  private visitorInfo: Visitor;
  public thankYou: boolean;
  public wrongStoreId: boolean;
  public labelText = 'ID';

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.email]],
    });
  }

  /**
   * Checks if store exist and if true open the checkin form modal
   * @param id
   */
  checkIfStoreExist(id: number): void {
    this.storeService.getStoreById(id)
      .subscribe(store => {
        this.store = store[0];
        if (this.store === undefined) {
          this.labelText = 'Wrong Store ID';
          this.storeId = null;
        } else {
          this.dialog.open();
          this.labelText = 'ID';
        }
      });
  }

  /**
   * Checkin form submit
   */
  public onCheckinFormSubmit(): void {
    if (this.userForm.invalid === true) {
      return;
    } else {
      this.visitorInfo = new Visitor(this.userForm.value);
      this.visitorInfo.time = new Date().toLocaleString();
      this.storeService.checkInVisitorToStore(this.visitorInfo, this.store.id)
        .subscribe(message => {
          this.thankYou = true;
          this.dialog.close();
        });
    }
  }

  /**
   *
   */
  public goBackToCheckInForm(): void {
    this.storeId = null;
    this.store = null;
    // this.userForm.reset();
    this.thankYou = false;
    this.dialog.close();
  }
}
