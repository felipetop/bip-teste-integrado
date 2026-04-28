import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingBarComponent } from './shared/ui/loading-bar/loading-bar.component';
import { ToastComponent } from './shared/ui/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoadingBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
