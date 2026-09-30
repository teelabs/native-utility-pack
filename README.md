# @teelabs/native-utility-pack

Reusable React Native utility components from `teelabs`.

The first public component is `ReelPicker`, a single-column slot-reel control with accessible labels, controlled and uncontrolled values, bounded numeric movement, swipe callbacks, animation controls, reduced-motion support, formatting, and style customization.

## Install

```bash
npm install @teelabs/native-utility-pack react react-native
```

## Use

```tsx
import { ReelPicker } from "@teelabs/native-utility-pack";

<ReelPicker accessibilityLabel="Repetitions" max={20} min={1} />;
```

See the [ReelPicker documentation](components/reel-picker/README.md) and the [capability showcase](https://teelabs.github.io/native-utility-pack/).
