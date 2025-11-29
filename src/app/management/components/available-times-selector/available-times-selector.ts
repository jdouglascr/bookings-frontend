import { Component, input, output, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DaySchedule } from '../../../models/frontend.models';

@Component({
  selector: 'app-available-times-selector',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="schedule-list">
      @for (schedule of schedules(); track schedule.dayOfWeek; let i = $index) {
        <div class="schedule-item">
          <div class="schedule-day">
            <span class="day-name">{{ schedule.dayOfWeek }}</span>
            <button
              type="button"
              mat-button
              class="toggle-btn"
              [class.closed]="schedule.isClosed"
              (click)="toggleDay(i)"
            >
              {{ schedule.isClosed ? 'Cerrado' : 'Abierto' }}
            </button>
          </div>

          @if (!schedule.isClosed) {
            <form [formGroup]="getFormGroup(i)" class="schedule-times">
              <mat-form-field appearance="outline">
                <mat-label>Apertura</mat-label>
                <input matInput type="time" formControlName="startTime" />
              </mat-form-field>

              <span class="time-separator">-</span>

              <mat-form-field appearance="outline">
                <mat-label>Cierre</mat-label>
                <input matInput type="time" formControlName="endTime" />
              </mat-form-field>
            </form>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .schedule-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .schedule-item {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem;
        border-radius: 12px;
        border: 1.5px solid var(--gray-border-dark);
        background-color: transparent;
        transition: border-color 0.2s ease;

        &:focus-within {
          border-color: var(--gray-text-darker);
        }
      }

      .schedule-day {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .day-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-text-titles);
      }

      .toggle-btn {
        border-radius: 8px !important;
        font-weight: 600 !important;
        padding: 8px 16px !important;
        min-width: 100px !important;
        background-color: var(--color-success) !important;
        color: white !important;
        transition: all 0.2s ease !important;

        &:hover {
          opacity: 0.9;
        }

        &.closed {
          background-color: var(--gray-text-medium) !important;
        }
      }

      .schedule-times {
        display: flex;
        align-items: start;
        gap: 1rem;

        mat-form-field {
          flex: 1;
        }

        .time-separator {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-text-medium);
          padding-top: 18px;
        }
      }

      @media (max-width: 768px) {
        .schedule-item {
          padding: 1rem;
        }

        .schedule-day {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }

        .toggle-btn {
          width: 100% !important;
        }

        .schedule-times {
          flex-direction: column;
          gap: 0.75rem;

          .time-separator {
            display: none;
          }
        }
      }

      @media (max-width: 480px) {
        .schedule-item {
          padding: 0.875rem;
        }

        .day-name {
          font-size: 0.9375rem;
        }
      }
    `,
  ],
})
export class AvailableTimesSelector {
  schedules = input.required<DaySchedule[]>();
  schedulesChange = output<DaySchedule[]>();

  formGroups = signal<FormGroup[]>([]);

  private fb = new FormBuilder();

  constructor() {
    effect(() => {
      const schedules = this.schedules();
      this.initializeForms(schedules);
    });
  }

  private initializeForms(schedules: DaySchedule[]): void {
    const forms = schedules.map((schedule) => {
      const form = this.fb.group({
        startTime: [{ value: schedule.startTime || '', disabled: schedule.isClosed }],
        endTime: [{ value: schedule.endTime || '', disabled: schedule.isClosed }],
      });

      form.valueChanges.subscribe(() => {
        this.updateScheduleValues();
      });

      return form;
    });

    this.formGroups.set(forms);
  }

  getFormGroup(index: number): FormGroup {
    return this.formGroups()[index];
  }

  toggleDay(index: number): void {
    const updatedSchedules = [...this.schedules()];
    updatedSchedules[index].isClosed = !updatedSchedules[index].isClosed;

    const form = this.getFormGroup(index);

    if (updatedSchedules[index].isClosed) {
      form.disable({ emitEvent: false });
    } else {
      form.enable({ emitEvent: false });
    }

    this.schedulesChange.emit(updatedSchedules);
  }

  private updateScheduleValues(): void {
    const updatedSchedules = this.schedules().map((schedule, index) => {
      const form = this.getFormGroup(index);
      return {
        ...schedule,
        startTime: form.get('startTime')?.value || schedule.startTime,
        endTime: form.get('endTime')?.value || schedule.endTime,
      };
    });
    this.schedulesChange.emit(updatedSchedules);
  }
}
