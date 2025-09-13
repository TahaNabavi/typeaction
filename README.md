# @tahanabavi/typeaction

![npm version](https://img.shields.io/badge/react-informational?style=flat&logo=react&logoColor=white)
![npm version](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

A **lightweight React utility for type-safe server actions**. It simplifies working with async functions by providing `useTransition`-powered loading state, cache support, and type inference — all designed for modern React apps with Server Components and server actions.

---

## Table of contents

- [Why use this](#why-use-this)
- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [API reference](#api-reference)
- [Testing / Development](#testing--development)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)
- [Maintainers & Support](#maintainers--support)

---

## Why use this

If you use **Next.js Server Actions** or any async functions in React, you often need boilerplate for:

- Loading state
- Caching results
- Reusing results across components

This package provides a **minimal but extensible hook system** for calling actions with `isPending`, `mutate`, and cache support.

---

## Features

- ✅ Type-safe request/response with TypeScript inference
- ✅ Automatic loading state via `useTransition`
- ✅ Simple cache API (`invalidate`, `prefetch`, `getCache`)
- ✅ Works with Next.js Server Actions (`"use server"`)
- ✅ Minimal, composable design — extend as needed

---

## Install

```bash
npm install @tahanabavi/typeaction
# or
yarn add @tahanabavi/typeaction
```

---

## Quick start

```tsx
"use client";

import { createAction } from "@tahanabavi/typeaction";

// server action
"use server";
export const action = createAction(
  async function getMessage(data: { name: string }) {
    return { message: `Hello, ${data.name}!` };
  },
  { key: "greeting" }
);

// use inside component
function Example() {
  const { isPending, mutate, data } = action.useAction();

  return (
    <div>
      <button onClick={() => mutate({ name: "Taha" })} disabled={isPending}>
        {isPending ? "Loading..." : "Say hi"}
      </button>
      {data && <p>{data.message}</p>}
    </div>
  );
}
```

---

## API reference

### `createAction(fn, options)`

Wraps an async function or server action.

| Parameter     | Type                      | Description                     |
| ------------- | ------------------------- | ------------------------------- |
| `fn`          | `(data: T) => Promise<R>` | Async function or server action |
| `options.key` | `string` (optional)       | Unique key for caching results  |

### Returned API

`const action = createAction(fn)` returns an object with:

| Method         | Description                                              |
| -------------- | -------------------------------------------------------- |
| `useAction()`  | Hook that exposes `isPending`, `mutate`, `data`, `error` |
| `invalidate()` | Clears cached data for this action                       |
| `prefetch(d)`  | Runs action in background and caches it                  |

### Inside `useAction()`

| Property    | Type         | Description                     |
| ----------- | ------------ | ------------------------------- |
| `isPending` | `boolean`    | True while action is running    |
| `mutate(d)` | `Promise<R>` | Runs the action with input `d`  |
| `data`      | `R \| null`  | Last successful result (cached) |
| `error`     | `any`        | Last error if call failed       |

---

## Testing / Development

Run unit tests with Jest:

```bash
npm test
```

Build TypeScript:

```bash
npm run build
```

Local develop/test with another app:

```bash
npm link
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Run tests and linters locally
4. Open a PR with a clear description and changelog entry (if applicable)

Please include tests for new features and follow the established code style.

---

## Maintainers & Support

Maintained by `@tahanabavi`.

For issues, please open a GitHub issue in this repository. For questions or suggestions, create an issue or reach out on GitHub Discussions.

---

_Thank you for using `@tahanabavi/typeaction` — feedback and contributions are highly appreciated!_
