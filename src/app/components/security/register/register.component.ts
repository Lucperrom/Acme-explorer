import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import { Router} from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  roleList: string[];


  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { // Inject Router
    this.roleList = this.authService.getRoles();
    this.createForm();
  }

  createForm() {
    this.registrationForm = this.fb.group({
      name: [''],
      surname: [''],
      email: [''],
      password: [''],
      phone: [''],
      role: [''],
      validated: [true]
    });
  }

  onRegister() {
    this.authService.signUp(this.registrationForm.value)
    .then(res => {
      console.log('Registration successful', res);
      this.router.navigate(['/login']); // Navigate after successful registration
    })
    .catch(err => {
      console.error('Registration failed', err);
    });
  }

  ngOnInit(): void {
  }

}
