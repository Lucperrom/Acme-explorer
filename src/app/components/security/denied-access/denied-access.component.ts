import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-denied-access',
  templateUrl: './denied-access.component.html',
  styleUrls: ['./denied-access.component.css']
})
export class DeniedAccessComponent implements OnInit {
  protected url!: String;
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.url = location.origin + this.route.snapshot.queryParams['previousURL']
  }

}
