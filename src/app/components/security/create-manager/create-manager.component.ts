import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actor } from 'src/app/models/actor.model';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-create-manager',
  templateUrl: './create-manager.component.html',
  styleUrls: ['./create-manager.component.css']
})
export class CreateManagerComponent implements OnInit {

  registerForm!: FormGroup;
  actor: Actor | null = null;
  actorEmail: string ="";
  isDarkMode = false;
  
  
  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router, private messageService: MessageService) {
    this.createForm();
    this.actor = new Actor();
   }

  createForm() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['MANAGER', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phone: [''],  // No validators, making it optional
      address: [''],  // No validators, making it optional
      validated: [true]
    });
  }


  onRegister() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      let msg = $localize `Form is invalid`;
      this.messageService.notifyMessage(msg, 'alert-danger');
      return;
    } else {
      this.authService.signUp(this.registerForm.value)
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

