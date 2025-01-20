import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {


  ngOnInit(): void {
    this.typeWriter();
  }

  typeWriter() {
    const element = document.getElementById('typewriter');
    if (element) {
      const text = element.innerHTML;
      element.innerHTML = '';
      let i = 0;
      const speed = 20;

      function type() {
        if (i < text.length && element) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(type, speed);
        }
      }
      type();
    }
  }
}
