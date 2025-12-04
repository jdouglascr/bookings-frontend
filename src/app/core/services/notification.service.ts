import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Servicio para manejo de notificaciones
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
  };

  /**
   * Muestra notificación de éxito
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (default: 3000)
   */
  success(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Muestra notificación de error
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (default: 4000)
   */
  error(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Muestra notificación de advertencia
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (default: 3500)
   */
  warning(message: string, duration = 3500): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['warning-snackbar'],
    });
  }

  /**
   * Muestra notificación informativa
   * @param message Mensaje a mostrar
   * @param duration Duración en ms (default: 3000)
   */
  info(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      duration,
      panelClass: ['info-snackbar'],
    });
  }

  /**
   * Muestra notificación personalizada
   * @param message Mensaje a mostrar
   * @param config Configuración personalizada
   */
  custom(message: string, config: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      ...config,
    });
  }
}
