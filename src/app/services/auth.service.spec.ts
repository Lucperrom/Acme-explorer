import { BehaviorSubject } from "rxjs";
import { AuthService } from "./auth.service";

describe('AuthService', () => {
    let service: AuthService;
    beforeEach(() => {
      service = new AuthService();
    });
    it('#getValue should return real value', () => {
      expect(service.getValue()).toBe('real value');
    });
    it('#getObservableValue should return value from observable', (done: DoneFn) => {
      service.getObservableValue().subscribe((value) => {
        expect(value).toBe('observable value');
        done();
      });
    });
    it('#getPromiseValue should return value from a promise', (done: DoneFn) => {
      service.getPromiseValue().then((value) => {
        expect(value).toBe('promise value');
        done();
      });
    });
  });