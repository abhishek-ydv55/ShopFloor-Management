import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should apply primary class by default', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('btn--primary');
  });

  it('should apply variant class', () => {
    component.variant = 'danger';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').className).toContain('btn--danger');
  });

  it('should disable when disabled=true', () => {
    component.disabled = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
  });

  it('should disable when loading=true', () => {
    component.loading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
  });

  it('should emit clicked event when clicked', () => {
    const spy = jasmine.createSpy('clicked');
    component.clicked.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    const spy = jasmine.createSpy('clicked');
    component.clicked.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply full-width class', () => {
    component.fullWidth = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').className).toContain('btn--full');
  });

  it('should show spinner when loading', () => {
    component.loading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.btn__spinner')).toBeTruthy();
  });
});
