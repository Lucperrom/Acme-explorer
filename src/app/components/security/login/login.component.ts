import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'
import { NgForm } from '@angular/forms'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onLogin(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    this.authService.login(email, password).then(data => {
      console.log('Logged in', data)

      form.reset()
    }).catch((error) => {
      console.log(error)
    });
  }

  isLoggedIn(){
    return this.authService.isLoggedIn();
  }

}
