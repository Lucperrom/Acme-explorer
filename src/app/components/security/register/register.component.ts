import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import { Router} from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  roleList: string[];


  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router, private messageService: MessageService) { // Inject Router
    this.roleList = this.authService.getRoles();
    this.createForm();
  }

  createForm() {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phone: [''],  // No validators, making it optional
      address: [''],  // No validators, making it optional
      validated: [true]
    });
  }

  onRegister() {
    if (this.registrationForm.invalid) {
      this.messageService.notifyMessage('Form is invalid', 'alert-danger');
      return;
    } else {
      this.authService.signUp(this.registrationForm.value)
      .then(res => {
        console.log('Registration successful', res);
        this.messageService.removeMessage();
        this.router.navigate(['/trips']); // Navigate after successful registration
      })
      .catch(err => {
        console.error('Registration failed', err);
        if (err.message.includes('email-already-in-use')) {
          this.messageService.notifyMessage('Email already in use', 'alert-danger');
        } else if (err.message.includes('invalid-email')) {
          this.messageService.notifyMessage('Invalid email format', 'alert-danger');
        } else if (err.message.includes('weak-password')) {
          this.messageService.notifyMessage('Password should be at least 6 characters', 'alert-danger');
        } else {
          this.messageService.notifyMessage('Registration failed', 'alert-danger');
        }
      });
    }
    
  }

  ngOnInit(): void {
  }

}
