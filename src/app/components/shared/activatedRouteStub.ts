import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ParamMap, convertToParamMap } from '@angular/router';

@Injectable()
export class ActivatedRouteStub {
  private subject = new BehaviorSubject(this.testParams);
  params = this.subject.asObservable();

  private _testParams: { [key: string]: string } = {};
  
  get testParams() { return this._testParams; }
  set testParams(params: { [key: string]: string }) {
    this._testParams = params;
    this.subject.next(params);
  }

  // ActivatedRoute.snapshot.paramMap
  get snapshot() {
    return { paramMap: convertToParamMap(this.testParams) };
  }
}
