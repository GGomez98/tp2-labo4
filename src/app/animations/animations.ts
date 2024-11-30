import { trigger, group, style, animate, transition, query, animateChild,  } from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* => *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ transform: 'translateX(100%)'})
      ], { optional: true }),
      group([
        query(':leave', [
            animate('2s ease-in-out', style({ transform: 'translateX(-100%)'}))
          ], { optional: true }),
          query(':enter', [
            animate('2s ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
          ], { optional: true }),
      ]),
    ])
  ]);