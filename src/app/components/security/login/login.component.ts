import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'
import { NgForm } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private returnUrl!: string;

  constructor(private authService: AuthService, private route: ActivatedRoute , private router: Router) { }
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onLogin(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    this.authService.login(email, password).then(data => {
      console.log('Logged in', data);
      this.router.navigate(['/trips']);
      form.reset();
    }).catch((error) => {
      console.log(error);
    });
  }

  isLoggedIn(){
    return this.authService.isLoggedIn();
  }

}
