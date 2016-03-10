# Mocking in .NET with MoQ

This is an introduction to the [MoQ library](https://github.com/moq/moq4. 
MoQ is "the most popular and friendly mocking framework for .NET", and there are many good
reasons for that. Let's explore a few of them.

# What is mocking?

When it comes to writing unit tests, we often to need to replace some components by "dummy"
ones in order to isolate the system under test and really test what we need. There many ways
to do this, and mocking is one of them.

Before we continue, let's go through some vocabulary first. Many of you may have already heard
of Mocks, Stubs, Fakes, Dummies, etc. They are different, and each of them has a specific goal.
Here is the definition provided **[Gerard Meszaros](http://www.gerardmeszaros.com)**, author of the book "**xUnit Test Patterns - Refactoring Test Code**" 
(from [one of Martin Fowler's articles](http://martinfowler.com/articles/mocksArentStubs.html)):

* **Dummy** objects are passed around but never actually used. Usually they are just used to fill parameter lists.
* **Fake** objects actually have working implementations, but usually take some shortcut which makes them not suitable for production (an in memory database is a good example).
* **Stubs** provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test. Stubs may also record information about calls, such as an email gateway stub that remembers the messages it 'sent', or maybe only how many messages it 'sent'.
* **Mocks** are what we are talking about here: objects pre-programmed with expectations which form a specification of the calls they are expected to receive.

The good thing is that with MoQ, all of these are possible. 

# Enough talking, show me some code
Let's take as example the 