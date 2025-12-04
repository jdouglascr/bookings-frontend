import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ContactInfo } from '../../../../../models/frontend.models';
import { PhoneInputComponent } from '../../../../../shared/components/phone-input/phone-input';

@Component({
  selector: 'app-contact-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    PhoneInputComponent,
  ],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);
  selectedContactInfo = input<ContactInfo | null>(null);
  contactInfoChanged = output<ContactInfo>();
  formValidityChanged = output<boolean>();

  readonly contactForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const contactInfo = this.selectedContactInfo();
      if (contactInfo) {
        this.contactForm.patchValue(contactInfo, { emitEvent: false });
      }
    });

    effect(() => {
      this.contactForm.valueChanges.subscribe((value) => {
        const phoneControl = this.contactForm.get('phone');
        const phoneValue = value.phone;
        const isValidPhone = /^\+56[0-9]{9}$/.test(phoneValue);

        if (phoneValue && !isValidPhone) {
          phoneControl?.setErrors({ pattern: true });
        } else if (phoneControl?.hasError('pattern')) {
          phoneControl.setErrors(null);
        }

        if (this.contactForm.valid) {
          this.contactInfoChanged.emit({
            firstName: value.firstName.trim(),
            lastName: value.lastName.trim(),
            email: value.email.toLowerCase().trim(),
            phone: value.phone,
          });
        }
        this.formValidityChanged.emit(this.contactForm.valid);
      });
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const value = this.contactForm.value;
      this.contactInfoChanged.emit({
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.toLowerCase().trim(),
        phone: value.phone,
      });
    } else {
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
