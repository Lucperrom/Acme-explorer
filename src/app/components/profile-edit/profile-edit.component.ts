import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actor } from 'src/app/models/actor.model';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
  profileForm!: FormGroup;
  actor: Actor | null = null;
  actorEmail: string =""
  isDarkMode = false;
  
  
  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router, private messageService: MessageService) {
    this.createForm();
    this.actor = new Actor();
   }

  createForm() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phone: [''],  // No validators, making it optional
      address: [''],  // No validators, making it optional
      validated: [true]
    });
  }


  onUpdate() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.messageService.notifyMessage('Form is invalid', 'alert-danger');
      return;
    } else {
      const formData = this.profileForm.getRawValue();
      const profileData = {
        ...formData,
      };
      this.authService.updateUser(this.actorEmail,profileData)
      .then(res => {
        console.log('Update successful', res);
        this.messageService.removeMessage();
        this.router.navigate(['/trips']);
      })
      .catch(err => {
        console.error('Update failed', err);
        this.messageService.notifyMessage('Update failed', 'alert-danger');
      });
    } 
  }

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    const alreadyReloaded = sessionStorage.getItem('reloaded');

    if (!alreadyReloaded) {
      sessionStorage.setItem('reloaded', 'true');
      setTimeout(() => {
        location.reload();
      }, 0);
      return;
    }
  
    // Ya recargado, continuamos normalmente
    sessionStorage.removeItem('reloaded');
    this.actor = this.authService.getCurrentActor();
    console.log("ACTOR", this.actor)
    if (!this.actor) {
      console.log('No actor found. Creating a trip is not possible. Redirecting to login page.');
      this.router.navigate(['/login']);
      return;
    }
    this.actorEmail = this.actor.email

    this.profileForm.patchValue({
      name: this.actor.name,
      surname: this.actor.surname,
      phone: this.actor.phone,
      address: this.actor.address
    });

  }

}
