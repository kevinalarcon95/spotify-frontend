import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.html',
  styleUrl: './empty.css',
  host: {
    '[class.empty-host--center]': 'centered()',
  },
})
export class Empty {
  readonly title = input<string>();
  readonly text = input<string>();
  readonly centered = input(false, { transform: booleanAttribute });
}
