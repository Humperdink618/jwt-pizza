# Curiosity Report: Mutation Testing

Mutation testing is a software testing technique that involves making small changes to source code in order to check and see if the existing tests can detect the changes. These small deliberate changes are called "mutants", and they essentially simulate common coding mistakes that programmers can make. Tests are then run against each mutated version of the code. If the tests fail, the change is detected by the test, and the mutant is "killed." If all tests pass, the mutant "survives", meaning that there is a potential gap in the test coverage, and the test suite may need to be improved. The effectiveness of the test suite is determined by calculating the mutation score (the percentage of mutants killed). The higher the score, the more effective the test suite.

## What does Mutation Testing Accomplish? Why does it Matter?

Mutation testing not only tests your code, it also tests your tests. It is important to know if your tests are robust enough to catch real bugs or defects in your code, if your tests have any gaps in test coverage, if your tests are effective and thorough enough, and if new tests need to be made to cover specific scenarios. Mutation testing essentially helps ensure that your tests are actually effective, worthwhile, reliable, and good quality. 

## How it Works:

**Procedure:**

- Step 1: Introduce Mutations:
    - A special mutation testing tool scans your code and automatically introduces mutations to the source code to simulate potential bugs (see below for a list of potential tools that you can use). Such mutations can include:
        - Changing an operator (> to <, or - to +)
        - Swapping lines of code
        - Changing a conditional (&& to ||)
        - Deleting a statement
        - Changing booleans or boolean expressions (true to false, > to >=, etc.)
        - Removing a method body
        - Replacing variables with others whose variable types are compatible (i.e., from the same scope)
        - etc.
- Step 2: Run the tests:
    - Run the original test suite against each mutated version of the code
    - The mutation testing tool keeps track of whether the tests succeed or fail for each mutant
- Step 3: Evaluate the Results:
    - If a test fails, the change is detected and the mutant is "killed"
    - If all the tests pass, the mutant "survives," meaning that improvements may need to be made to the test suite.
- Step 4: Calculate the Mutation Score:
    - Calculated as the percentage of mutants killed
    - MutScore = (mutants killed / total mutants) x 100
    - Mutation score of 100% means that the test was adequate (the higher the score, the more effective your tests will be)
    - Note: there also can exist "Equivalent Mutants", where the mutants have the same meaning as the original source code, but have different syntax. Equivalent mutants aren't calculated as part of the mutant score.

**Tools:**
| Language      | Tool          |
|---------------|---------------|
| C/C++         | [Insure](https://docs.parasoft.com/pages/viewpage.action?pageId=41319116) |
| Java           | [PIT (PITest)](https://pitest.org/) |
| Java (JUnit)*  | [Jester](https://jester.sourceforge.net/) |
| JavaScript/TS  | [StrykerJS](https://stryker-mutator.io/) |
| Python         | [MutPy](https://github.com/mutpy/mutpy) |

**Mutation Testing Example:**

Original Code:
```javascript
function multiplyByFour(value) {
    return value * 4;
}
```

Mutant Version:
```javascript
function multiplyByFourMutation(value) {
    return value * 10;
}
```

## Pros and Cons: 

**Pros:**

- Reveals weaknesses in tests
- Enhances code quality
- Helps achieve high coverage
- Helps ensure that the test suite stays effective after code changes. omproving test suite maintenance

**Cons:**

- High cost
- Current mutation testing tools may not scale well for very large and complex systems
- Impractical without the use of an automation tool
- Time and resource intensive
- Requires specialized knowledge

## Why I Chose this Topic:

Mutation testing to me sounded like an interesting topic to explore. As we have discussed before in class, it is important to write tests that actually do something and provide good coverage. However, sometimes your tests may not be as robust as you would have liked, and some bugs may end up slipping through your tests. I found the very idea of testing your own tests to be an interesting one, and I wanted to learn more about it. While doing my research, I learned that even effective tests may not always cover everything, and that they should accomodate for edge cases or unexpected results. I also learned that there are actually different kinds of mutation testing, such as statement mutation (intentionally modifying a block of code by either deleting or copying certain statements, or reordering statements within the block of code to generate a variety of different sequences), value mutation (modifying a parameter and/or a constnt value within the code), and decision mutation (modifying logical and arithmetic operators to expose and detect potential flaws and weaknesses in the program's decision logic). I also learned why this topic was used as a potential curiosity report option instead of an actual in-class implementation, as it can be very complicated to compute, and can be very costly and time consuming to run with all the mutations that are being made to the code.

## Key Takeaways:

Mutation testing is a very good advanced software testing technique for testing both your code and your tests. It is a good way to expose gaps in testing and in test coverage, as well as prove the robustness of your tests at handling and catching potential bugs. It helps make tests more reliable, robust, accurate, and effective, and helps improve confidence in your tests. It may be expensive and time-consuming, but it may very well be worth it. 