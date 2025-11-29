import { Component, input, output, signal, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { TableColumn, TableAction } from '../../../models/frontend.models';
import { SpanishPaginatorIntl } from '../../../core/services/spanish-paginator-intl';

@Component({
  selector: 'app-data-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T> {
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  actions = input<TableAction<T>[]>([]);
  isLoading = input(false);
  showSearch = input(true);
  showCreateButton = input(true);
  createButtonText = input('Crear nuevo');
  emptyMessage = input('No hay datos disponibles');
  emptyIcon = input('inbox');

  rowClick = output<T>();
  createClick = output<void>();

  searchTerm = signal('');
  currentPage = signal(0);
  readonly pageSize = 5;

  displayedColumns = computed(() => {
    const cols = this.columns().map((col) => col.key);
    if (this.actions().length > 0) cols.push('actions');
    return cols;
  });

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.data();

    return this.data().filter((row) => {
      return this.columns().some((col) => {
        const value = col.getValue(row);
        return value.toLowerCase().includes(term);
      });
    });
  });

  paginatedData = computed(() => {
    const filtered = this.filteredData();
    const startIndex = this.currentPage() * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  });

  totalItems = computed(() => this.filteredData().length);

  skeletonRows = computed(() => Array(this.pageSize).fill({}));

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(0);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(0);
  }

  onCreateClick(): void {
    this.createClick.emit();
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByKey(_index: number, column: TableColumn<T>): string {
    return column.key;
  }

  trackByIcon(_index: number, action: TableAction<T>): string {
    return action.icon;
  }
}
