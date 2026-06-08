import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModalComponent] }).compileComponents();
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should not render overlay when open=false', () => {
    component.open = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-overlay')).toBeNull();
  });

  it('should render overlay when open=true', () => {
    component.open = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-overlay')).toBeTruthy();
  });

  it('should display title', () => {
    component.open = true; component.title = 'Confirm Delete';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-header h3').textContent).toContain('Confirm Delete');
  });

  it('should emit closed event on close button click', () => {
    component.open = true;
    fixture.detectChanges();
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);
    fixture.nativeElement.querySelector('.modal-close').click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit closed event on overlay click', () => {
    component.open = true;
    fixture.detectChanges();
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);
    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    overlay.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should have role=dialog attribute', () => {
    component.open = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
  });
});
