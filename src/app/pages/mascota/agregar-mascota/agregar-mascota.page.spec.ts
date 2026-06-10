import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarMascotaPage } from './agregar-mascota.page';

describe('AgregarMascotaPage', () => {
  let component: AgregarMascotaPage;
  let fixture: ComponentFixture<AgregarMascotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
