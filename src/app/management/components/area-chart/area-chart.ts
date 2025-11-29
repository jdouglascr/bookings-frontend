import { Component, input, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexGrid,
  ApexTooltip,
} from 'ng-apexcharts';
import { ChartDataPoint } from '../../../models/frontend.models';

@Component({
  selector: 'app-area-chart',
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
          [xaxis]="xaxis"
          [yaxis]="yaxis"
          [dataLabels]="dataLabels"
          [stroke]="stroke"
          [fill]="fill"
          [grid]="grid"
          [tooltip]="tooltip"
          [colors]="colors"
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
export class AreaChart {
  title = input.required<string>();
  subtitle = input<string>();
  data = input.required<ChartDataPoint[]>();
  seriesName = input.required<string>();

  series: ApexAxisChartSeries = [];
  chart: ApexChart = {
    type: 'area',
    height: 350,
    toolbar: { show: false },
    zoom: { enabled: false },
  };
  dataLabels: ApexDataLabels = { enabled: false };
  stroke: ApexStroke = { curve: 'smooth', width: 3 };
  xaxis: ApexXAxis = {
    categories: [],
    labels: {
      style: {
        colors: '#6c757d',
        fontSize: '12px',
      },
    },
  };
  yaxis: ApexYAxis = {
    labels: {
      style: {
        colors: '#6c757d',
        fontSize: '12px',
      },
    },
  };
  fill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.5,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  };
  colors: string[] = ['#28a745'];
  grid: ApexGrid = {
    borderColor: '#e9ecef',
    strokeDashArray: 4,
  };
  tooltip: ApexTooltip = { theme: 'light' };

  constructor() {
    effect(() => {
      const currentData = this.data();
      const currentSeriesName = this.seriesName();

      this.series = [
        {
          name: currentSeriesName,
          data: currentData.map((d) => d.y),
        },
      ];

      this.xaxis = {
        ...this.xaxis,
        categories: currentData.map((d) => d.x),
      };
    });
  }
}
