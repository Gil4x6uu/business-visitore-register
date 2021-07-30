import { Component, OnInit, Input } from '@angular/core';
import { Visitor } from '../../models/visitor';

@Component({
  selector: 'app-next-visitor',
  templateUrl: './next-visitor.component.html',
  styleUrls: ['./next-visitor.component.scss']
})
export class NextVisitorComponent implements OnInit {
  @Input() nextVisitors : Visitor;
  constructor() { }

  ngOnInit() {
  }

}
