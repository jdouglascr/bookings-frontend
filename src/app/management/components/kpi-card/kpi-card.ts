import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { KpiCardData } from '../../../models/frontend.models';

@Component({
  selector: 'app-kpi-card',
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="kpi-card" [class]="card().colorClass">
      <div class="kpi-card__icon">
        <mat-icon>{{ card().icon }}</mat-icon>
      </div>
      <div class="kpi-card__content">
        <h3 class="kpi-card__title">{{ card().title }}</h3>
        <p class="kpi-card__value">{{ card().value }}</p>
        @if (card().trend) {
          <div class="kpi-card__trend" [class.positive]="card().trend!.isPositive" [class.negative]="!card().trend!.isPositive">
            <mat-icon>{{ card().trend!.isPositive ? 'trending_up' : 'trending_down' }}</mat-icon>
            <span>{{ card().trend!.value > 0 ? '+' : '' }}{{ card().trend!.value }}%</span>
          </div>
        }
      </div>
    </mat-card>
  `,
  styles: [
    `
      .kpi-card {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1.5rem;
        border-radius: 16px;
        background-color: var(--color-primary);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        transition: box-shadow 0.2s ease;
        cursor: default;
        height: 100%;
        border: none;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        &__icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
          }
        }

        &__content {
          flex: 1;
          min-width: 0;
        }

        &__title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-text-medium);
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        &__value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--gray-text-titles);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        &__trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;

          .mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }

          &.positive {
            color: var(--color-success);
          }

          &.negative {
            color: var(--color-error);
          }
        }

        &.primary {
          .kpi-card__icon {
            background-color: rgba(41, 38, 41, 0.1);
            color: var(--color-secondary);
          }
        }

        &.success {
          .kpi-card__icon {
            background-color: rgba(40, 167, 69, 0.1);
            color: var(--color-success);
          }
        }

        &.warning {
          .kpi-card__icon {
            background-color: rgba(255, 193, 7, 0.1);
            color: var(--color-warning);
          }
        }

        &.error {
          .kpi-card__icon {
            background-color: rgba(226, 91, 91, 0.1);
            color: var(--color-error);
          }
        }

        &.info {
          .kpi-card__icon {
            background-color: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
          }
        }
      }

      @media (max-width: 768px) {
        .kpi-card {
          padding: 1.25rem;

          &__icon {
            width: 48px;
            height: 48px;

            .mat-icon {
              font-size: 24px;
              width: 24px;
              height: 24px;
            }
          }

          &__value {
            font-size: 1.5rem;
          }

          &__title {
            font-size: 0.8125rem;
          }
        }
      }

      @media (max-width: 480px) {
        .kpi-card {
          gap: 1rem;
          padding: 1rem;

          &__icon {
            width: 44px;
            height: 44px;

            .mat-icon {
              font-size: 22px;
              width: 22px;
              height: 22px;
            }
          }

          &__value {
            font-size: 1.375rem;
          }
        }
      }
    `,
  ],
})
export class KpiCard {
  card = input.required<KpiCardData>();
}
