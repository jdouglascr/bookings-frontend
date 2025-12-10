import { Component, input, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexNonAxisChartSeries, ApexChart, ApexLegend, ApexDataLabels, ApexPlotOptions, ApexResponsive } from 'ng-apexcharts';
import { DonutChartFormatterContext } from '../../../models/frontend.models';

@Component({
  selector: 'app-donut-chart',
  imports: [MatCardModule, NgApexchartsModule],
  template: `
    <mat-card class="chart-card">
      <div class="chart-card__header">
        <h3 class="chart-card__title">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="chart-card__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="chart-card__content">
        <apx-chart
          [series]="series"
          [chart]="chart"
          [labels]="labels"
          [colors]="colors"
          [legend]="legend"
          [dataLabels]="dataLabels"
          [plotOptions]="plotOptions"
          [responsive]="responsive"
        ></apx-chart>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .chart-card {
        border-radius: 16px;
        padding: 1.5rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--color-primary);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        transition: box-shadow 0.2s ease;
        border: none;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        &__header {
          margin-bottom: 1rem;
        }

        &__title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--gray-text-titles);
          margin: 0 0 0.25rem 0;
        }

        &__subtitle {
          font-size: 0.875rem;
          color: var(--gray-text-medium);
          margin: 0;
        }

        &__content {
          flex: 1;
        }
      }

      @media (max-width: 768px) {
        .chart-card {
          padding: 1.25rem;

          &__title {
            font-size: 1rem;
          }
        }
      }
    `,
  ],
})
export class DonutChart {
  title = input.required<string>();
  subtitle = input<string>();
  chartLabels = input.required<string[]>();
  values = input.required<number[]>();

  series: ApexNonAxisChartSeries = [];
  chart: ApexChart = {
    type: 'donut',
    height: 350,
  };
  labels: string[] = [];
  colors: string[] = ['#ffc107', '#28a745', '#0d6efd', '#292629', '#e25b5b'];
  legend: ApexLegend = {
    position: 'bottom',
    fontSize: '14px',
    fontWeight: 500,
    labels: {
      colors: '#495057',
    },
  };
  dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val.toFixed(1) + '%',
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
  };
  plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
            color: '#495057',
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 700,
            color: '#0d1426',
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            fontWeight: 600,
            color: '#6c757d',
            formatter: (w: DonutChartFormatterContext) => {
              return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
            },
          },
        },
      },
    },
  };
  responsive: ApexResponsive[] = [
    {
      breakpoint: 768,
      options: {
        chart: {
          height: 300,
        },
      },
    },
  ];

  constructor() {
    effect(() => {
      this.series = this.values();
      this.labels = this.chartLabels();
    });
  }
}
