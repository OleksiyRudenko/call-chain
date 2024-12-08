import {callChain} from "../call-chain.js"
import {expect} from 'chai'

class TestObjectWithChainableMethods {
  constructor(value = 3) {
    this.init(value)
  }

  init(mainValue = 3) {
    this.aux = 5
    this.dummyProperty = {
      p1: 7
    }
    return this.setMain(mainValue)
  }

  setMain(value = 3) {
    this.main = value
    return this
  }

  getMain() { return this.main }

  double() {
    this.main *= 2
    return this
  }

  dummyMethod() { return this }
}

const testObject = new TestObjectWithChainableMethods()

const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const reducer = (acc, e, i) => (i%2 ? acc.push(e) : false, acc)

const testSetsSuccess = [
  {
    describeOptions: [false, false],
    testCases: [
      [
        "Successfully transforms the array.",
        [inputArray, [["filter", e => e%2], ["map", e => e*2], ["reduce", [reducer, []]] ], false, false],
        [6, 14],
      ],
      [
        "Successfully transforms the array and gets its length.",
        [inputArray, [["filter", e => e%2], ["map", e => e*2], ["reduce", [reducer, []]], "length" ], false, false],
        2,
      ],
      [
        "Successfully modifies main value and returns it (from object field).",
        [testObject, [["init", []], ["double", []], ["main"] ], false, false],
        6,
      ],
      [
        "Successfully modifies main value and returns it (from object field). Non-canonical notation for field.",
        [testObject, [["init", []], ["double", []], "main" ], false, false],
        6,
      ],
      [
        "Successfully modifies main value and returns it (by method).",
        [testObject, [["init", []], ["double", []], ["getMain", []] ], false, false],
        6,
      ],
      [
        "Successfully returns a defined field of the object's field.",
        [testObject, [["init", []], ["double", []], ["dummyProperty"], ["p1"] ], false, false],
        7,
      ],
      [
        "Successfully returns a defined field of the object's field. Non-canonical notation for fields.",
        [testObject, [["init", []], ["double", []], "dummyProperty", "p1" ], false, false],
        7,
      ],
    ],
  },
  /* {
    describeOptions: [true, false],
    testCases: [],
  },
  {
    describeOptions: [false, true],
    testCases: [],
  },
  {
    describeOptions: [true, true],
    testCases: [],
  }, */
]

const testSetsFailure = [
  {
    describeOptions: [false, false],
    testCases: [
      [
        "Throws a native TypeError as a property subsequent to undefined property ('dimension.x') is not referrable",
        [inputArray, [["filter", e => e%2], ["map", e => e*2],
          ["reduce", [reducer, []]], "dimension", "x"],
          false, false],
        TypeError,
      ],
    ]
  },
  {
    describeOptions: [true, false],
    testCases: [
      [
        "Successfully transforms the array but throws synthetic TypeError at getting length as it is called as a method.",
        [inputArray, [["filter", e => e%2], ["map", e => e*2], ["reduce", [reducer, []]], "length" ], true, false],
        TypeError,
      ],
      [
        "Throws a synthetic TypeError as a property ('dimension') is not defined and therefore not callable",
        [inputArray, [["filter", e => e%2], ["map", e => e*2],
          ["reduce", [reducer, []]], "dimension", "x"],
          true, false],
        TypeError,
      ],
    ]
  }
]

const scenarios = {
  "success": testSetsSuccess,
  "failure": testSetsFailure,
}

scenarios.success.forEach((testSet, testSetIndex) => {
  describe(`1.${testSetIndex+1}. Positive scenarios for: allPropertiesAreMethods = ${testSet.describeOptions[0]}, useOptionalChaining = ${testSet.describeOptions[1]}`, () => {
    testSet.testCases.forEach(([testDescription, inputArgs, expectedResult], testIndex) => {
      it(`1.${testSetIndex+1}.${testIndex+1}. ${testDescription}`, () => {
        expect(callChain(...inputArgs)).to.eql(expectedResult)
      })
    })
  })
})

scenarios.failure.forEach((testSet, testSetIndex) => {
  describe(`2.${testSetIndex+1}. Negative scenarios for: allPropertiesAreMethods = ${testSet.describeOptions[0]}, useOptionalChaining = ${testSet.describeOptions[1]}`, () => {
    testSet.testCases.forEach(([testDescription, inputArgs, expectedResult], testIndex) => {
      it(`2.${testSetIndex+1}.${testIndex+1}. ${testDescription}`, () => {
        expect(() => callChain(...inputArgs)).to.throw(expectedResult)
      })
    })
  })
})
