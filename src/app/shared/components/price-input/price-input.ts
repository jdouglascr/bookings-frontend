import { Component, input, signal, inject, DestroyRef, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, NgControl, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PriceFormatterService } from '../../../core/services/prices-formatter.service';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-price-input',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, DecimalPipe],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label() }}</mat-label>
      @if (showPrefix()) {
        <span matTextPrefix>$&nbsp;</span>
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
        [attr.maxlength]="maxLength()"
      />
      @if (internalControl.hasError('required')) {
        <mat-error>El precio es obligatorio</mat-error>
      } @else if (internalControl.hasError('min')) {
        <mat-error>El precio debe ser mayor a 0</mat-error>
      } @else if (internalControl.hasError('max')) {
        <mat-error>El precio no puede exceder {{ maxValue() | number: '1.0-0' : 'es-CL' }}</mat-error>
      }
      @if (showHint() && displayValue()) {
        <mat-hint>{{ priceFormatter.format(numericValue()) }}</mat-hint>
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
export class PriceInput implements OnInit {
  label = input<string>('Precio');
  maxValue = input<number>(999999999);
  maxLength = input<number>(12);
  showHint = input<boolean>(true);

  protected readonly priceFormatter = inject(PriceFormatterService);
  private readonly destroyRef = inject(DestroyRef);
  readonly ngControl = inject(NgControl, { optional: true, self: true });

  isFocused = signal(false);
  displayValue = signal('');
  numericValue = signal(0);
  internalControl = new FormControl('');

  showPrefix = computed(() => this.isFocused() || this.displayValue().length > 0);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: number | null) => void = () => {};
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
      this.ngControl.control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncErrors());
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

    if (this.numericValue()) {
      const formatted = this.priceFormatter.formatInput(this.numericValue());
      this.displayValue.set(formatted);
      this.internalControl.setValue(formatted, { emitEvent: false });
    }

    this.ngControl?.control?.updateValueAndValidity();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');

    if (digits.length > this.maxLength()) {
      const truncated = digits.slice(0, this.maxLength());
      const formatted = this.priceFormatter.formatInput(truncated);
      this.displayValue.set(formatted);
      input.value = formatted;
      this.numericValue.set(parseInt(truncated, 10));
      this.onChange(parseInt(truncated, 10));
    } else if (digits) {
      const formatted = this.priceFormatter.formatInput(digits);
      this.displayValue.set(formatted);
      input.value = formatted;
      const numValue = parseInt(digits, 10);
      this.numericValue.set(numValue);
      this.onChange(numValue);
    } else {
      this.displayValue.set('');
      this.numericValue.set(0);
      this.onChange(null);
    }
  }

  writeValue(value: number | null): void {
    if (value != null) {
      const formatted = this.priceFormatter.formatInput(value);
      this.displayValue.set(formatted);
      this.numericValue.set(value);
      this.internalControl.setValue(formatted, { emitEvent: false });
    } else {
      this.displayValue.set('');
      this.numericValue.set(0);
      this.internalControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
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
}
