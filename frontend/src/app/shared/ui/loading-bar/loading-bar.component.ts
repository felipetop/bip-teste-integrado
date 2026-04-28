import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  templateUrl: './loading-bar.component.html',
})
export class LoadingBarComponent {
  protected loading = inject(LoadingService);
}
