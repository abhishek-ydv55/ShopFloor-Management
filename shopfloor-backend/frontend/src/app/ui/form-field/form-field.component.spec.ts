import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent>;
  let component: FormFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormFieldComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render label when provided', () => {
    component.label = 'Email';
    component.fieldId = 'email';
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    expect(label?.textContent?.trim()).toContain('Email');
  });

  it('should show required asterisk when required=true', () => {
    component.label = 'Email'; component.fieldId = 'email'; component.required = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__req')).toBeTruthy();
  });

  it('should not show required asterisk when required=false', () => {
    component.label = 'Email'; component.fieldId = 'email'; component.required = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__req')).toBeNull();
  });

  it('should display error message', () => {
    component.error = 'This field is required';
    fixture.detectChanges();
    const err = fixture.nativeElement.querySelector('.form-field__error');
    expect(err?.textContent).toContain('This field is required');
  });

  it('should apply error class when error is set', () => {
    component.error = 'Error!';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field--error')).toBeTruthy();
  });

  it('should show hint when no error', () => {
    component.hint = 'Enter your full name';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__hint')).toBeTruthy();
  });

  it('should not show hint when error is present', () => {
    component.hint = 'Enter your full name'; component.error = 'Required';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-field__hint')).toBeNull();
  });
});
