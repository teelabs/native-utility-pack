# @teelabs/native-utility-pack — ReelPicker

Reusable React Native slot-reel picker component.

The component is extracted as a generic single-column control. It supports controlled and default values, numeric bounds, non-looping reels, tap selection, gesture tracking, velocity-weighted release, reduced motion, elastic boundary settling, and customizable formatting and styles.

Application-specific kilogram/gram and minute/second controls remain compositions outside this package.

Boundary settling uses React Native stiffness, damping, and mass parameters together so the animation remains valid on Android.

Swipe previews stay inside the picker. `onSwipeMove` reports live movement, while `onChange` emits the chosen value once on release; consumers do not need to throttle committed value changes.
