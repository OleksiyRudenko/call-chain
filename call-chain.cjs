'use strict';

/**
 * Helpful when imperative code is replaced with declarative for the chained object properties reference.
 * @example
 * // returns XXX
 * callChain()
 * @example
 * // In KnexJS replaces imperative chained calls (e.g. table.integer("employee_id").references("id").inTable("employees"))
 * // into declarative
 * // returns same as table.integer("employee_id").unsigned().notNullable().references("id").inTable("employees")
 * callChain(table, [["integer", "employee_id"], ["unsigned", []], ["notNullable", []], ["references", "id"], ["inTable", "employees"]])
 * @param object {Object}
 * @param chain {Array|String} each element describes an object property and call arguments if property to be called as a method
 * Canonical descriptors are:
 *   [objectPropertyName, [callArguments...]] - for methods; use [objectPropertyName, []] to call a method without arguments
 *   [objectPropertyName] - for scalar properties
 * Non-canonical descriptors and canonization rules:
 *   [objectPropertyName, callArgument] => [objectPropertyName, [callArgument]]
 *   objectPropertyName => [objectPropertyName]
 * Non-canonical descriptors and canonization rules if allPropertiesAreMethods = true:
 *   [objectPropertyName] => [objectPropertyName, []]
 *   objectPropertyName => [objectPropertyName, []]
 * @param allPropertiesAreMethods {Boolean} false; if true then every objectPropertyName is treated as a method name
 * @param useOptionalChaining {Boolean} false; if true then every object property is referred to and every method is called with optional chaining operator (?.)
 * @returns Result of the chain calls
 */
const callChain = (object, chain, allPropertiesAreMethods = false, useOptionalChaining = false) => {
  // console.log("=== callChain\n", object, chain, allPropertiesAreMethods, useOptionalChaining)
  if (chain === undefined || (Array.isArray(chain) && chain.length === 0)) {
    // console.log(">>> callChain", object)
    return object
  }
  let descriptor = chain.shift();
  // canonization
  if (!Array.isArray(descriptor)) descriptor = [descriptor];
  let [objectPropertyName, args] = descriptor;
  if (args === undefined) {
    if (allPropertiesAreMethods) args = [];
  } else {
    if (!Array.isArray(args)) args = [args];
  }
  // console.log("--- callChain\n", objectPropertyName, args)

  let value;
  if (useOptionalChaining) {
    value = args === undefined ? object?.[objectPropertyName] : object?.[objectPropertyName]?.(...args);
  } else {
    if (args === undefined) {
      value = object[objectPropertyName];
    } else {
      try {
        value = object[objectPropertyName](...args);
      } catch(e) {
        // we want to re-trow the TypeError to provide user with a hint of what property failed
        // instead of providing a stack trace to just the callChain code
        throw new TypeError(`${objectPropertyName} is not a function`)
      }
    }
  }

  return callChain(value, chain, allPropertiesAreMethods, useOptionalChaining)
};

/*
const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]


console.log("===============\n", callChain(inputArray,
  [
    ["filter", e => e%2 ],
    ["map", e => e*2],
    ["reduce", [(acc, e, i) => (i%2 ? acc.push(e) : false, acc), []]],
    "dimension", "x"
  ],
  true, false))
*/

exports.callChain = callChain;
