import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-application-table',
  templateUrl: './application-table.component.html',
  styleUrls: ['./application-table.component.css']
})
export class ApplicationTableComponent implements OnInit {

  constructor() { }
  onDetailToggle(event: any){
    return null
  }
  rows = [
    { name: 'John', age: 28, country: 'USA' },
    { name: 'Jane', age: 32, country: 'UK' },
    { name: 'Tom', age: 45, country: 'Canada' },
    { name: 'Lucy', age: 27, country: 'Australia' }
  ];

  columns = [
    { name: 'Name' },
    { name: 'Age' },
    { name: 'Country' }
  ];

  loading = false;
  sorts = [
    {
      prop: 'placementMoment',
      dir: 'desc'
    },
    {
      prop: 'total',
      dir: 'asc'
    }    
  ];
  ngOnInit(): void {
  }

}
