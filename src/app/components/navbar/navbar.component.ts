import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonTabBar, IonTabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pawOutline, calendarOutline, locationOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonTabBar, IonTabButton, IonIcon]
})
export class NavbarComponent {
  constructor() {
    addIcons({ pawOutline, calendarOutline, locationOutline, personOutline });
  }
}
