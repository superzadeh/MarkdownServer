# Example

This is an example.

## Code is worth a thousand words

Code looks like this:

```csharp
public class SomeClass
{
  private IInterface field;
  private SomeOtherClass field;
  // Constructor
  public SomeClass()
  {
  }
}
```

## List all the things

Lists look like this:

* List item 1
	* This implies that if multiple unit tests are executed in parallel, all read/write actions must be synchronised, otherwise a test could impact another test's results.
	* This also requires to cleanup that path everytime, and requires the test agent on build machines to have access
	* If data must be pre-populated for a test, then it must be written to this file, otherwise the reposiroties will not be able to have pre-populated data
	* If assertions on data must be made without using the repositories, then the XML file's content must be read. This means that deserialization code will most likely be duplicated, creating a hard to maintain code.
* List item 2
* List item 3
* List item 4