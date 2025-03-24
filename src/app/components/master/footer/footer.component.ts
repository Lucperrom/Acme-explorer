import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  protected today!: number;
  visitorsNumber!: number;

  constructor() { }

  ngOnInit(): void {
    this.today = Date.now();
    this.visitorsNumber = Math.floor((Math.random() * 1000000) + 1);
  }

}
