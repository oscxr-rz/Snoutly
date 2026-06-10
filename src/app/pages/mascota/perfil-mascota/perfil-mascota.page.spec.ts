import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilMascotaPage } from './perfil-mascota.page';

describe('PerfilMascotaPage', () => {
  let component: PerfilMascotaPage;
  let fixture: ComponentFixture<PerfilMascotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
