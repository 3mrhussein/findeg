# @findeg/ui

`@findeg/ui` contains retained prototype presentation primitives. The target
`frontend/web` application does not currently depend on this package. See the
[compatibility retirement boundaries](../../docs/package-guidance.md#retained-compatibility-evidence-64)
before adopting or removing components.

## Conventions

- Keep components framework-independent and free of database, runtime, and server-only imports.
- Use Tailwind logical properties (`ps`, `pe`, `ms`, `me`, `border-s`, and `border-e`) for bilingual RTL layouts.
- Add strict type coverage and RTL behavior coverage before consuming a new primitive.

## Usage

```tsx
import { Button, Card, CardHeader, CardTitle } from '@findeg/ui';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example</CardTitle>
      </CardHeader>
      <Button>Continue</Button>
    </Card>
  );
}
```
