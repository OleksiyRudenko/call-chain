# call-chain

Convert imperative code that chains a number of method calls
into declarative code.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Examples](#examples)
  - [Example 1. Impractical demo](#example-1-impractical-demo)
  - [Example 2. Practical demo](#example-2-practical-demo)
- [Usage. Chain description conventions and flags](#usage-chain-description-conventions-and-flags)
- [FAQ](#faq)
  - [Q1. Why don't you use `call-chain` in the modules tests?](#q1-why-dont-you-use-call-chain-in-the-modules-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- *generated with [DocToc](https://github.com/thlorenz/doctoc)* -->

## Examples

### Example 1. Impractical demo

Doesn't make much sense, just a demo on a commonly known pattern
for an array transformation.

```javascript
const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const reducer = (acc, e, i) => {
  // keep elements with odd indices only
  if (i%2) acc.push(e)
  return acc
}

// classical approach
inputArray
  .filter(e => e % 2)
  .map(e => e * 2)
  .reduce(reducer, [])

// call-chain fantasy approach
callChain(inputArray, [
  ["filter", e => e % 2],
  ["map", e => e * 2],
  ["reduce", [reducer, []]]
])
```

### Example 2. Practical demo

[KnexJS](https://knexjs.org/guide/query-builder.html#knex) offers
a query builder that is a set of chainable methods to construct SQL
queries.

You will prefer declarative approach if you need to import
table schemas or other queries from files or provide by users
(and you do now want users to provide runnable code).

In the scenario below `employeeTableSchema` could have been
imported from a module or JSON.

```javascript
// KnexJS
table
  .integer("employee_id")
  .unsigned()
  .notNullable()
  .references("id")
  .inTable("employees")

// same code with chainCall
const employeeTableSchema = [
  ["integer", "employee_id"],
  ["unsigned", []],
  ["notNullable", []],
  ["references", "id"],
  ["inTable", "employees"]
]

chainCall(table, employeeTableSchema)
```

## Usage. Chain description conventions and flags

```javascript
const callChain = (object, chain, allPropertiesAreMethods = false, useOptionalChaining = false)
```

Parameters:
- `object` to apply chain of calls to
- `chain` is an array of chain elements where each element
  represents an object field (state) or method (behavior represented by
  a function).
- `allPropertiesAreMethods` flag: if `true` then each property in chain
  description is treated as a callable method
- `useOptionalChaining` flag: if true then undefined properties do not break
  code execution by usage of optional chaining operator `?.`

Use flags with caution.

Canonical chain element description is
```javascript
[
  [fieldName], // for a field
  [methodName, [callArguments]] // for a method
  // wrap all arguments into array; use empty array if no arguments to be passed
]
```

Canonization rules for non-canonical descriptions
```javascript
[
  propertyName,           // => [propertyName] or, if allPropertiesAreMethods === true, [propertyName, []]
  [propertyName],         // => if allPropertiesAreMethods === true, [propertyName, []]
  [methodName, argument]  // => [methodName, [argument]]
]
```

## FAQ

### Q1. Why don't you use `call-chain` in the modules tests?

A. We do. `call-chain.self.test.mjs` uses `chain-call` to test `chain-call`.
Although we consider this approach
