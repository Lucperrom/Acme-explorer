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


  constructor(private authService: AuthService, private fb: FormBuilder) { 
    this.roleList = this.authService.getRoles();
    this.createForm();
  }

  createForm() {
    this.registrationForm = this.fb.group({
      name: [''],
      surname: [''],
      email: [''],
      password: [''],
      role: [''],
      phone: [''],
      validated: [true]
    });
  }

  onRegister() {
    this.authService.signUp(this.registrationForm.value)
    .then( res => {
      console.log(res);
    }, err => {
      console.log(err);
    });
  }

  ngOnInit(): void {
  }

}
