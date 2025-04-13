import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'
import { NgForm } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private returnUrl!: string;

  constructor(private authService: AuthService, private route: ActivatedRoute , private router: Router, private messageService: MessageService) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/trips'; // Read returnUrl or default to '/trips'
      console.log('Return URL:', this.returnUrl);
    });
  }

  onLogin(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    this.authService.login(email, password).then(data => {
      console.log('Logged in', data);
      this.router.navigate([this.returnUrl]); // Redirect to the desired route
      form.reset();
    }).catch((error) => {
      this.messageService.notifyMessage("Invalid Credentials", "alert-danger")
    });
  }

  isLoggedIn(){
    return this.authService.isLoggedIn();
  }

}
