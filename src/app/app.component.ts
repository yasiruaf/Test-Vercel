import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  // title = 'Yasir';

  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.setTitle('Yasir');
  }
  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
