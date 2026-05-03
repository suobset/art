# Contributing to art

Thanks for contributing.

## Run locally

```bash
npm install
npm run dev
```

## Add a demo

1. Build the visual piece first.
2. Add controls that change behavior, not only decoration.
3. Include `Behind the scenes` content in `src/demos/index.ts`.
4. Add reset and remix actions.
5. Make sure the demo still reads as a distinct artwork.

## Behind-the-scenes expectations

Every demo should explain:

- what the visitor is seeing
- how the code works
- which parameters matter most
- where artistic choice enters
- what the visitor should try changing next

Keep code excerpts short, readable, and inviting.

## Accessibility checklist

- Use semantic controls and visible labels.
- Ensure focus states are obvious.
- Provide keyboard alternatives for interaction.
- Add a plain-language description for the visual behavior.
- Respect reduced motion and provide a pause path.
- Avoid hover-only disclosure.

## Performance checklist

- Cancel animation frames and timers on unmount.
- Avoid unnecessary recalculation in render.
- Keep canvas resolution bounded on smaller screens.
- Prefer small, focused dependencies.
- Test on phone-sized layouts before merging.

## Commit style

Use short, lowercase, human commit messages.

Examples:

- `add flow field controls`
- `document poetry internals`
- `polish reduced motion behavior`
