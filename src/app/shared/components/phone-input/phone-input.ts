import { Component, input, signal, inject, DestroyRef, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, NgControl, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-phone-input',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label() }}</mat-label>
      @if (showPrefix()) {
        <span matTextPrefix>+56&nbsp;</span>
      }
      <input
        matInput
        type="text"
        inputmode="numeric"
        [value]="displayValue()"
        [formControl]="internalControl"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (input)="onInputChange($event)"
        [attr.maxlength]="9"
      />
      @if (internalControl.hasError('required')) {
        <mat-error>El teléfono es obligatorio</mat-error>
      } @else if (internalControl.hasError('pattern')) {
        <mat-error>El teléfono debe tener 9 dígitos</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class PhoneInputComponent implements OnInit {
  label = input<string>('Teléfono');

  private readonly COUNTRY_CODE = '+56';
  private readonly MAX_DIGITS = 9;

  isFocused = signal(false);
  displayValue = signal('');
  internalControl = new FormControl('');

  showPrefix = computed(() => this.isFocused() || this.displayValue().length > 0);

  private destroyRef = inject(DestroyRef);
  ngControl = inject(NgControl, { optional: true, self: true });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.internalControl.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.internalControl.touched) {
        this.onTouched();
      }
    });
  }

  ngOnInit(): void {
    if (this.ngControl?.control) {
      this.internalControl.setValidators(this.ngControl.control.validator);
      this.ngControl.control.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.syncErrors());
    }
  }

  syncErrors(): void {
    if (this.ngControl?.control) {
      this.internalControl.setErrors(this.ngControl.control.errors);
      if (this.ngControl.control.touched) {
        this.internalControl.markAsTouched();
      }
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.internalControl.markAsTouched();
    this.onTouched();
    this.ngControl?.control?.updateValueAndValidity();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = this.extractDigits(input.value);

    this.displayValue.set(digits);
    input.value = digits;
    this.onChange(this.formatForStorage(digits));
  }

  writeValue(value: string): void {
    const digits = this.extractDigits(value);
    this.displayValue.set(digits);
    this.internalControl.setValue(digits, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }

  private extractDigits(value: string): string {
    if (!value) return '';
    return value.replace(this.COUNTRY_CODE, '').replace(/\D/g, '').slice(0, this.MAX_DIGITS);
  }

  private formatForStorage(digits: string): string {
    return digits ? `${this.COUNTRY_CODE}${digits}` : '';
  }
}
