import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonProcessComponent } from './button-process.component';

describe('ButtonProcessComponent', () => {
  let component: ButtonProcessComponent;
  let fixture: ComponentFixture<ButtonProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
