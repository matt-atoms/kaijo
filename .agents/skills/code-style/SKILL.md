---
name: code-style
description: Readable TypeScript/React conventions—`type` over `interface`, React 19 `ref` as a prop (no forwardRef), braced control-flow with intentional spacing, minimal explanatory comments (trim excess; keep only why-comments and load-bearing notes), Tailwind/className extraction only when duplicated more than twice, `isolate` for parents of z-indexed layers, component file layout (no re-export-only `index.ts`, prefer flat files when a folder would hold a single component), and **`run()`** from `~/features/utils/common` for heavy conditional JSX and scoped Server Component logic. Also owns the **simplicity review**: a complexity-only review lens (duplication, dead code, hand-rolled stdlib, unused flexibility) with a one-line finding format. Use when editing JavaScript/TypeScript/React, when the user asks for consistent style, readability, naming, or `run`-based conditional rendering, or when they ask to simplify, review for over-engineering, find duplication, find what can be deleted, or audit for bloat.
---

# Code style

## Core Rules

- Prefer `type` over `interface` for object shapes and props.
- Use React 19 `ref` as a prop (no `forwardRef`).
- Braced `if`/`else` with intentional spacing; prefer early returns.
- Extract Tailwind/className strings only when duplicated more than twice; use `isolate` for parents of z-indexed layers.
- Prefer flat component files or justified folders; no re-export-only `index.ts`.
- Use **`run()`** from `~/features/utils/common` for heavy conditional JSX and scoped Server Component logic (see Detailed conventions).
- Reuse before writing: check `~/features/utils`, `sanity/utils.ts`, and neighboring modules before accepting new helper code as "new"; duplication is the highest-value review finding.
- Comments: minimal and explanatory. Trim to the fewest comments that carry real information (see Detailed conventions).
- Simplicity review requests use the one-line finding format in Detailed conventions (tags, grep-verified claims, `net:` scoring).

## Trigger Conditions

Apply when editing **TypeScript/JavaScript/React** in this repo or when the user asks for consistent style, readability, naming, or `run()`-based conditional rendering. Apply the **Simplicity review** section when the user asks to simplify, review for over-engineering, find duplication, find dead code, or audit the repo for bloat.

## Execution Checklist

1. Match existing patterns in the touched files.
2. Run `npm run check.types` after substantive edits.
3. Run `npm run check` (Biome) when formatting or control-flow style changes.

## Scope Guidance

- **frontend**: Pairs when the change is conditional UI in Client Components.
- **sanity** / **scaffolding-plop**: Not the primary owner of `run()`; use only if conditional rendering in those areas needs the same pattern.
- Simplicity review covers complexity only; correctness bugs, security holes, and performance route to a normal review pass (or **react-performance** / **performance-audit**).

## Non-Goals

- Replacing project-specific conventions in other skills (frontend, sanity, mantine-hooks, view-transitions).
- Drive-by reformatting unrelated files.

## Done Criteria

- No unnecessary `useMemo`/`useCallback` bodies wrapped in `run()` without justification.
- `run` imports from `~/features/utils/common` only (single source of truth).
- Braced branches and spacing follow the if-statement rules in Detailed conventions where control flow is touched.

## Reference Files

- None — this skill is self-contained under Detailed conventions.

## Detailed conventions

Conventions for a consistent, readable codebase. Sections below include control-flow formatting, TypeScript aliases, React refs, and the **`run()`** helper for conditional JSX.

### React: `ref` as a prop (React 19)

- **Do not use `React.forwardRef`.** In React 19, pass `ref` on the props object and destructure it like any other prop.
- Add `ref?: React.Ref<HTMLElement>` (or the concrete element type) to the component’s props `type`.
- Forward it to the DOM element or child that should receive the ref.

```tsx
import * as React from "react";

type DialogProps = {
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
};

export function Dialog({ ref, children }: DialogProps) {
  return <div ref={ref}>{children}</div>;
}
```

### TypeScript: `type` vs `interface`

- **Never use `interface`.** Use `type` for object shapes, props, and component contracts (including optional fields and intersections).
- Prefer `export type Name = { ... }` for exported prop types.

```ts
// Avoid
interface ButtonProps {
  label: string;
}

// Use
type ButtonProps = {
  label: string;
};
```

### If statement readability

#### Core rules

- Never use one-line `if` statements.
- Always use braces for every `if`, `else if`, and `else` branch, even for single statements.
- Keep conditional expressions readable; extract complex conditions into well-named booleans when needed.
- Prefer early returns to reduce nesting depth.

#### Spacing rules

- **General rule:** Treat every **braced** `if` / `else` block as its own visual unit. Use **blank lines** before and after that unit when the surrounding code is a **different** step (assignment, another `if`, a `return` that isn’t the only line of the block, etc.).
- **Back-to-back `if` blocks** that are **not** `else if` / `else` (independent conditions): put **one blank line between** each closing `}` and the next `if` — whether the branches use early `return`, mutate state, or call functions.
- **Same chain:** Do **not** insert blank lines between `if` → `else if` → `else`; those branches stay contiguous.
- **After a braced block:** Add a blank line before the next statement when it starts a new concern (including the “main” body after one or more leading `if` blocks).
- **Comment → `if`:** Do **not** add a blank line between a **full-line** comment (`//`, `/* … */`, JSDoc ` * …`) and the following `if`; the `if` stays directly under the comment.

#### Rewrite patterns

##### One-liner to block

```ts
// Avoid
if (!user) return null;

// Use
if (!user) {
  return null;
}
```

##### Separate concerns with vertical space

```ts
const isPublished = post.status === "published";

if (!isPublished) {
  return null;
}

const authorName = post.author?.name ?? "Unknown";
```

##### Keep branches visually connected

```ts
if (status === "success") {
  return "ok";
} else if (status === "error") {
  return "failed";
} else {
  return "pending";
}
```

##### Multiple independent braced `if` blocks

Same spacing whether the branches return early or run other logic:

```ts
const onPointerUpOrCancel = (e: PointerEvent) => {
  if (e.type === "pointerup" && e.button !== 0) {
    return;
  }

  if (!pointerHeldOnBackground) {
    return;
  }

  pointerHeldOnBackground = false;
  updateLabelFromPointer(e);
};
```

```ts
if (cache.has(key)) {
  return cache.get(key);
}

if (shouldRefresh) {
  await refresh();
}

return compute();
```

#### Application checklist

1. Convert any one-line `if` statements to braced blocks.
2. Ensure every branch in each conditional chain uses braces.
3. Add or remove blank lines so each conditional reads as a clear visual unit.
4. Re-check surrounding code so spacing reflects logical grouping, not personal preference.

### Comments: minimal and explanatory

Excessive comments overload the reader. Default to no comment; add one only when it carries information the code cannot.

- **Explain why, never what.** A comment restating the line below it gets deleted (`// set the status` above `setStatus(...)`).
- **One short line beats a paragraph.** If a comment needs multiple sentences, keep the one sentence that names the non-obvious constraint and cut the rest.
- **No banner/section comments** (`// ---- helpers ----`), no numbered step comments narrating a function, no commented-out code.
- **Exported kit APIs get a short JSDoc** (one line, plus `@default`/`@param` only when the signature alone misleads). Internal helpers usually need none.
- **Keep load-bearing comments.** A comment recording a non-obvious decision, a browser quirk, a security constraint, or a "this looks wrong but isn't" (e.g. the proxy cache strategy notes, stega warnings, LCP opacity trick) stays; that is exactly what comments are for. Never touch functional comments: `// PLOP:` anchors, `biome-ignore`, `@ts-expect-error`.
- When editing existing code, trim surrounding excess comments in the lines you touch; do not drive-by strip whole files.

#### Example

```ts
// ❌ Verbose: narrates the code and pads the why with prose
// First, we check for spam before doing anything else.
// If the spam check returns an error message, it means the submission
// was detected as spam, so we return early with the error so the
// user sees feedback and no document is created in Sanity.
const spamError = detectSpam(payload);

if (spamError) {
  return { success: false, error: spamError };
}

// ✅ Minimal: the code already says all of that
const spamError = detectSpam(payload);

if (spamError) {
  return { success: false, error: spamError };
}
```

```ts
// ❌ Verbose what-comment
// Set the timeout to 200 milliseconds as a fallback value
const id = window.setTimeout(cb, 200);

// ✅ Minimal why-comment, same information that matters
// Safari < 17.4 lacks requestIdleCallback; land after hydration settles.
const id = window.setTimeout(cb, 200);
```

- **Do not add `index.ts` (or `index.js`) that only re-exports** other modules. If the primary export is a client component, use **`index.tsx`** in that folder (or a single named `*.tsx` file at the root of `components/`).
- **Prefer a single flat file** `components/<name>.tsx` when the feature is **one component** and there are no colocated helpers (e.g. `components/my-widget.tsx`).
- **Use a folder** `components/<name>/` when the feature is **multiple files** that belong together (e.g. `index.tsx` for the client UI + **`actions.ts`** for `"use server"` handlers, or multiple subcomponents). Do **not** create a folder whose only TS module is one component unless a second file (server actions, tests, etc.) justifies it.

### Tailwind / `className` strings

- **Inline** `className` (and similar string literals passed to `cx`, `cva`, etc.) **at the use site** when the same class string appears **once or twice**.
- **Extract** a `const` (or shared fragment) only when the **same** class string is needed **more than twice** (three or more call sites). Then one named constant is justified.
- Rationale: indirection for a single JSX node or a duplicate adds jump-to-definition noise without reducing duplication meaningfully.

### Stacking contexts (`z-index`)

- When an element uses a `z-*` / `-z-*` utility (or non-zero `z-index` in CSS), ensure an **ancestor** establishes a stacking context—typically the **immediate parent** of the z-indexed node—with Tailwind’s **`isolate`** (`isolation: isolate`) unless a parent already provides one (e.g. `isolate` on a section wrapper).
- Do not rely on z-index alone crossing unrelated parts of the tree; `isolate` keeps layering predictable within that subtree.

### The `run()` helper

Use this section when refactoring or writing **conditional React JSX**, parallel render branches (e.g. static vs motion), or scoped async/try blocks in Server Components. **Not** the primary topic for schema, Plop scaffolding, or pure runtime animation APIs alone.

#### What `run` is

Defined in `~/features/utils/common`:

```ts
export function run<T>(fn: () => T): T {
  return fn();
}
```

It runs a function immediately and returns the result, like an IIFE, but readable in JSX and fully typed.

Import: `import { run } from "~/features/utils/common"`.

#### When to use

- **Nested or long ternary chains** in JSX; replace with `run(() => { ... })` and **early returns** per branch.
- **Type narrowing**: sequential `if` returns inside the callback so TypeScript narrows unions (e.g. discriminated `state.kind`, optional `user`).
- **Parallel UI branches** without duplicating structure in JSX (e.g. `still ? map(static) : map(motion)` -> one `run` per column or one block with early-style branches).
- **Server Components**: wrap `async` fetch/parse in `await run(async () => { ... })` with try/catch and `return null` early so the outer component stays short.

Use **`run` in JSX** or for a **small block before `return`** in a component when a plain function body would force hoisting awkwardly or you want the logic colocated with the slot it fills.

#### When not to use

- **Inside an existing callback** (`useMemo`, `useCallback`, event handlers) - that body already supports `if` / early returns; no need for `run` unless it clearly improves a one-off.
- **Top-level component body** - use normal `if` and `const` assignments; reserve `run` for JSX slots or tight scoped blocks.
- **Trivial conditions** - `condition && <X />` or a short ternary is enough.

#### Practices

- Keep each `run` callback **short**; **extract** a helper or subcomponent if it grows.
- Prefer `run` when JSX conditional branch count is 3+ (or you already have 2+ chained ternaries) or nested ternary depth > 1.
- Repo examples: `components/animated-text.tsx` (static vs animated branches), `features/sanity/media/mux-video.tsx` (player branches via `run`), `features/auth/sanity-basic-auth-proxy.ts` (scoped async block).

#### JSX pattern

```tsx
{
  run(() => {
    if (state.kind === "loading") {
      return <Spinner />;
    }

    if (state.kind === "error") {
      return state.retryable ? <RetryError /> : <ErrorView />;
    }

    if (state.user?.isAdmin) {
      return <AdminDashboard />;
    }

    if (state.user) {
      return <Dashboard user={state.user} />;
    }

    return <SignIn />;
  });
}
```

#### Server Component pattern

```tsx
const list = await run(async () => {
  try {
    const res = await fetch(`/api/lists/${id}`);

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
});

if (!list) {
  return null;
}
```

#### Checklist for `run` changes

- `run` imports from `~/features/utils/common` only (single source of truth).
- No unnecessary `run` inside `useMemo`/`useCallback` bodies without justification.
- Braced branches and spacing follow the **if statement readability** rules above where you touch control flow.

### Simplicity review

Review lens for unnecessary complexity. The best outcome is getting shorter. Two scopes:

- **diff** (default): the working diff or a branch.
- **repo**: the whole tree, ranked biggest cut first, ending `net: -<N> lines, -<M> deps possible.`

#### Format

One line per finding: `<file>:L<line>: <tag> <what>. <replacement>.`

Tags:

- `dup:` copy-pasted logic (the DRY hunt): the same block in two or more files, or a re-implementation of a helper that already lives in the repo. Replacement: the one extracted or existing helper. This is the highest-value tag; check `~/features/utils`, `sanity/utils.ts`, and neighboring modules before accepting new code as "new".
- `delete:` verified dead code: zero callers or setters, confirmed by grep across `app/`, `components/`, `features/`, `sanity/`, `templates/`, `scripts/`, and `proxy.ts`. Never claim dead from memory.
- `stdlib:` hand-rolled thing JS/Node/React already ships. Name the replacement.
- `native:` code or a dependency doing what the platform or an already-installed dependency covers (CSS over JS, `@mantine/hooks` over manual listeners, Next.js built-ins, `node:util` over CLI libs). Name the feature.
- `shrink:` same logic, meaningfully fewer lines. Show the shorter form.
- `speculative:` unused flexibility (an option nobody passes, a config value nothing sets, a branch no caller reaches). Conservative bar, see below.

#### Speculative findings: the conservative bar

This repo is a starter template; single-implementation seams are often the product, not bloat. Flag `speculative:` only when ALL of these hold:

1. Zero usage, verified by grep (no caller passes the option, nothing sets the flag, no template emits it).
2. Not a documented extension seam: plop templates, `create-*` schema field factories, `sanity/config.ts`, media-type prop symmetry, or anything a SKILL.md or `docs/` names as an edit point stays.
3. Recreating it later is roughly as cheap as keeping it.

When in doubt, do not flag it. An abstraction with one implementation is fine; the target is an abstraction with zero uses and no documented purpose.

#### Examples

✅ `features/agents/markdown-proxy-state.ts:L58: dup: fetch/cache/TTL block copy-pasted from sanity-basic-auth-proxy.ts. Extract one shared helper.`

✅ `L4: native: hand-rolled outside-click effect. useClickOutside from @mantine/hooks.`

✅ `L52-71: delete: exported hook with zero callers (grep-verified). Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds object. Object.fromEntries(entries), 1 line.`

❌ "This validator class might be more complex than necessary, have you considered..." (prose instead of a finding)

❌ Flagging a `create-*` factory with one call site (documented extension seam).

#### Scoring and boundaries

- End with `net: -<N> lines possible.` Nothing to cut: `Lean already. Ship.`
- Scope is complexity only: correctness bugs, security holes, and performance route to a normal review pass. Note them in one line each under "out-of-scope notes" if tripped over.
- A single smoke test or assert-based self-check is the minimum for non-trivial logic, not bloat; never flag it for deletion.
- Lists findings; applies nothing unless the user asks for fixes.
