import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorshipEditComponent } from './sponsorship-edit.component';

describe('SponsorshipEditComponent', () => {
  let component: SponsorshipEditComponent;
  let fixture: ComponentFixture<SponsorshipEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SponsorshipEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsorshipEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
