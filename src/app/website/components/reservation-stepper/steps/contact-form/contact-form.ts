import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ContactInfo } from '../../../../../models/reservation.models';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);
  selectedContactInfo = input<ContactInfo | null>(null);
  contactInfoChanged = output<ContactInfo>();
  formValidityChanged = output<boolean>();

  // Signal para controlar la visibilidad del prefix
  private readonly isPhoneFocused = signal(false);
  private readonly hasPhoneValue = signal(false);

  private readonly formData = signal<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  readonly contactForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]{9}$/),
        Validators.minLength(9),
        Validators.maxLength(9),
      ],
    ],
  });

  constructor() {
    // Effect para manejar la información de contacto seleccionada
    effect(() => {
      const contactInfo = this.selectedContactInfo();
      if (contactInfo) {
        this.contactForm.patchValue(
          {
            firstName: contactInfo.firstName,
            lastName: contactInfo.lastName,
            email: contactInfo.email,
            phone: contactInfo.phone,
          },
          { emitEvent: false },
        );
        this.formData.set(contactInfo);
        this.hasPhoneValue.set(!!contactInfo.phone);
      }
    });

    // Effect para manejar cambios en el formulario
    effect(() => {
      this.contactForm.valueChanges.subscribe((value) => {
        const contactInfo: ContactInfo = {
          firstName: value.firstName?.trim() || '',
          lastName: value.lastName?.trim() || '',
          email: value.email?.toLowerCase().trim() || '',
          phone: value.phone || '',
        };

        this.formData.set(contactInfo);
        this.hasPhoneValue.set(!!value.phone);

        if (this.contactForm.valid) {
          this.contactInfoChanged.emit(contactInfo);
        }

        this.formValidityChanged.emit(this.contactForm.valid);
      });
    });
  }

  // Método para determinar si mostrar el prefix del teléfono
  shouldShowPhonePrefix(): boolean {
    return this.isPhoneFocused() || this.hasPhoneValue();
  }

  // Métodos para manejar el foco del campo teléfono
  onPhoneFocus(): void {
    this.isPhoneFocused.set(true);
  }

  onPhoneBlur(): void {
    this.isPhoneFocused.set(false);
  }

  // Método para permitir solo números en el teléfono
  onKeyPress(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Solo permitir números del 0-9
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  // Método para manejar pegado de texto (solo números)
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    const numbersOnly = clipboardData.replace(/\D/g, '').slice(0, 9); // Solo números, máximo 9

    if (numbersOnly) {
      this.contactForm.get('phone')?.setValue(numbersOnly);
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const contactInfo = this.formData();
      this.contactInfoChanged.emit(contactInfo);
    } else {
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
