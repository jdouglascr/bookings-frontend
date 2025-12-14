import { Component, inject, OnInit, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PriceFormatterService } from '../../../core/services/prices-formatter.service';
import { NotificationService } from '../../../core/services/notification.service';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { AreaChart } from '../../components/area-chart/area-chart';
import { DonutChart } from '../../components/donut-chart/donut-chart';
import { HorizontalBarChart } from '../../components/horizontal-bar-chart/horizontal-bar-chart';
import { KpiCardData, ChartDataPoint, BarChartData } from '../../../models/frontend.models';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonModule, MatIconModule, KpiCard, AreaChart, DonutChart, HorizontalBarChart],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly priceFormatter = inject(PriceFormatterService);
  private readonly notification = inject(NotificationService);

  stats = this.dashboardService.dashboardStats;
  isLoading = this.dashboardService.isLoading;

  // KPI Cards
  kpiCards = computed<KpiCardData[]>(() => {
    const data = this.stats();
    if (!data) return [];

    const kpis = data.monthlyKpis;

    return [
      {
        title: 'Reservas del mes',
        value: kpis.currentMonthBookings,
        icon: 'event',
        trend: {
          value: kpis.bookingsChangePercent,
          isPositive: kpis.bookingsChangePercent >= 0,
        },
        colorClass: 'primary',
      },
      {
        title: 'Ingresos del mes',
        value: this.priceFormatter.format(kpis.currentMonthRevenue),
        icon: 'payments',
        trend: {
          value: kpis.revenueChangePercent,
          isPositive: kpis.revenueChangePercent >= 0,
        },
        colorClass: 'success',
      },
      {
        title: 'Tasa de confirmación',
        value: `${kpis.confirmationRate.toFixed(1)}%`,
        icon: 'check_circle',
        colorClass: 'info',
      },
      {
        title: 'Nuevos clientes',
        value: kpis.newCustomers,
        icon: 'person_add',
        colorClass: 'success',
      },
      {
        title: 'Reservas hoy',
        value: kpis.upcomingBookingsToday,
        icon: 'today',
        colorClass: 'warning',
      },
      {
        title: 'Tasa de cancelación',
        value: `${kpis.cancellationRate.toFixed(1)}%`,
        icon: 'cancel',
        colorClass: 'error',
      },
    ];
  });

  // Daily Bookings Chart Data
  dailyBookingsData = computed<ChartDataPoint[]>(() => {
    const data = this.stats();
    if (!data) return [];

    return data.dailyBookings.map((booking) => ({
      x: this.formatDate(booking.date),
      y: booking.count,
    }));
  });

  // Status Distribution Chart Data
  statusLabels = computed<string[]>(() => {
    const data = this.stats();
    if (!data) return [];

    return ['Pendiente', 'Confirmada', 'Pagada', 'Completada', 'Cancelada'];
  });

  statusValues = computed<number[]>(() => {
    const data = this.stats();
    if (!data) return [];

    const dist = data.statusDistribution;
    return [dist.pending, dist.confirmed, dist.paid, dist.completed, dist.cancelled];
  });

  // Top Resources Chart Data
  topResourcesData = computed<BarChartData[]>(() => {
    const data = this.stats();
    if (!data) return [];

    return data.topResources.map((resource) => ({
      name: resource.resourceName,
      value: resource.bookingCount,
    }));
  });

  // Top Services Chart Data
  topServicesData = computed<BarChartData[]>(() => {
    const data = this.stats();
    if (!data) return [];

    return data.topServices.map((service) => ({
      name: service.serviceName,
      value: service.bookingCount,
    }));
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.loadDashboardStats().subscribe({
      error: (err) => {
        this.notification.error(err.error?.message || 'Error al cargar estadísticas');
      },
    });
  }

  private formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      timeZone: 'America/Santiago',
    });
  }
}
