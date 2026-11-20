import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface PingResponse {
  message: string;
}

/** Placeholder page proving the dev-server proxy reaches the API on the same origin. */
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly ping = httpResource<PingResponse>(() => '/api/ping');
}
