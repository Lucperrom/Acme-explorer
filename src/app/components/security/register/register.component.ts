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
  isDarkMode = false;


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
      let msg = $localize `Form is invalid`;
      this.messageService.notifyMessage(msg, 'alert-danger');
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
          let msg = $localize `Email already in use`;
          this.messageService.notifyMessage(msg, 'alert-danger');
        } else if (err.message.includes('invalid-email')) {
          let msg = $localize `Invalid email format`;
          this.messageService.notifyMessage(msg, 'alert-danger');
        } else if (err.message.includes('weak-password')) {
          let msg = $localize `Password should be at least 6 characters`;
          this.messageService.notifyMessage(msg, 'alert-danger');
        } else {
          let msg = $localize `Registration failed`;
          this.messageService.notifyMessage(msg, 'alert-danger');
        }
      });
    }
    
  }

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
  }

}
