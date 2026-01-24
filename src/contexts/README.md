# Translation System

## Using Reactive Translations

The app now supports instant language switching without page refresh!

### For new components

Use the `useMessage` hook for reactive translations:

```jsx
import { useMessage } from 'contexts/TranslationContext';

function MyComponent() {
  const title = useMessage('modals.main.title');
  const description = useMessage('modals.main.description');

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
```

### For existing components

The old `variables.getMessage()` method still works but won't automatically update when language changes. Gradually migrate to `useMessage` for components that display translations prominently.

### How it works

1. `TranslationProvider` wraps the app and listens for language change events
2. When language is changed via the Radio component, it emits a `languageChange` event
3. The provider updates the i18n instance and triggers re-renders
4. Components using `useMessage` automatically update to show new translations

### Benefits

- No page refresh needed
- Minimal performance impact (translations already loaded)
- Backward compatible with existing code
- Smooth user experience
