# Inversion of Control workshop

## Introductions

The following article is a good introduction to this course: http://www.martinfowler.com/articles/injection.html

## Code is worth a thousand words
Consider the following class:

```csharp
public class WServiceAdmin
{
	private INeuronRepository _neuronDb = new XmlNeuronRepository();
	private IProfileRepository _profileDb = new XmlProfileRepository();
	private IConfigRepository _configDb = new XmlConfigRepository();
	private IPlatformRepository _platformDb = new XmlPlatformRepository();
	private IFeatureRepository _featureDb = new XmlFeatureRepository();
	private readonly VpnClientRegistrationManager _vpnClientResgistrationManager;

	public WServiceAdmin()
	{
		_vpnClientResgistrationManager = new VpnClientRegistrationManager(this);
		_vpnClientResgistrationManager.start();
	}
}
```

This class can be used in the following way:

```csharp
// requires you to use Xml repositories and a running Vpn client manager
var service = new WServiceAdmin();
```

This is quick and easy, the service is easy to instantiate, and it has all its dependencies contained in Repositories/Managers, some of which have interfaces because they have multiple implementations. This component is "standalone" and decoupled, because it doesn't need anything else to work.

Not so much.


### Unit testing this class

Let's look at this class and what we need to unit test it:

* We need to have a filesystem that will potentially accept read/write to the path use by these repositories. By looking at the implementation, all these reposiroties inherit from XmlBaseRepository that writes to path defined in the app.settings
	* This implies that if multiple unit tests are executed in parallel, all read/write actions must be synchronised, otherwise a test could impact another test's results.
	* This also requires to cleanup that path everytime, and requires the test agent on build machines to have access
	* If data must be pre-populated for a test, then it must be written to this file, otherwise the reposiroties will not be able to have pre-populated data
	* If assertions on data must be made without using the repositories, then the XML file's content must be read. This means that deserialization code will most likely be duplicated, creating a hard to maintain code.
* We need the VpnClientRegistrationManager to be able to start. This most likely requires to have OpenVPN installed on the build machines, which is not ideal. Some issues could also be raised whent ests are executed in parallel (what if multiple instances of VpnClientRegistrationManager are started?)
* If we want ot test a different file path, we have to modify the app.config file. Oh, if you didn't know, this implies unloading and reloading the app domain in order to see the changes in the app. Good luck with that.
* This is already too much. At this point, I gave up on unit testing this component.


## A slightly better class
Let's refactor this class a little bit to make it easier to unit test. The first step is to move all the repositories (which are interfaces) as constructor parameters.
```csharp
public class WServiceAdmin
{
	private INeuronRepository _neuronDb;
	private IProfileRepository _profileDb;
	private IConfigRepository _configDb;
	private IPlatformRepository _platformDb;
	private IFeatureRepository _featureDb;
	private readonly VpnClientRegistrationManager _vpnClientResgistrationManager;

	public WServiceAdmin(INeuronRepository neuronDb,
	IProfileRepository profileDb,
	IConfigRepository configDb,
	IPlatformRepository platformDb,
	IFeatureRepository featureDb)
	{
		_vpnClientResgistrationManager = new VpnClientRegistrationManager(this);
		_vpnClientResgistrationManager.start();

		_neuronDb = neuronDb;
		_profileDb = profileDb;
		_configDb = configDb;
		_platformDb = platformDb;
		_featureDb = featureDb;
	}
}
```
This simple modification allows us to the class in the following way:
```csharp
// using these constructor parameters, we can inject implementation other than XML
var service = new WServiceAdmin(new XmlNeuronRepository(),
								new XmlProfileRepository(),
								new XmlConfigRepository(),
								new XmlPlatformRepository(),
								new XmlFeatureRepository());
```
This looks like a lot more code to write to achieve the same result, but by doing this simple modification, 
we have effectively decoupled our class from its dependency XML persistency. 
We can now pass any implementation of INeuronRepository as parameter to this class. For intance, we could do the following:

```csharp   
// using these constructor parameters, we can inject implementation other than XML
var service = new WServiceAdmin(new SqlNeuronRepository(),
								new SqlProfileRepository(),
								new SqlConfigRepository(),
								new SqlPlatformRepository(),
								new SqlFeatureRepository());
```
### Unit testing this class
The main advantage of dependency injection can be seen when writing unit tests. Now that we can inject any implementation of repository, we can do the following for our unit tests:


* Create a mock for each repository. We can use a static list in each mock to define the list of Neurons or Configs that should be used for our tests. This is easily achieved using Moq.

```csharp
// Create the Mock of the repository
var _configRepository = new Mock<IConfigRepository>();

//Everytime GetServerConfig is called on the mock, the configurations expected for the test will be returned.
var expectedConfigurations = ConfigurationHelper.GetTestConfigurations();
_configRepository.Setup(repo => repo.GetServerConfig())
  				 .Returns(expectedConfigurations);

// Pass the mock Object to the service: this is our fake reposiroty
var service = new WServiceAdmin(..., _configRepository.Object, ...);
```
* The only constraint that remains is the `VpnClientRegistrationManager`


### Removing the VpnClientRegistrationManager dependency
In order to remove this dependency, we will use the same approach as the repositories:

- Pass the component as constructor parameter
- Use an interface instead (to allow passing mocks or other implementations)

In order to achieve this, we will need to add an interface above this `VpnClientRegistrationManager` (`IVpnClientRegistrationManager`), easily done using VisualStudio/Resharper "Extract Interface" refactor.
```csharp
internal interface IVpnClientRegistrationManager
{
	uint SignClientMaxQueueSize { get; set; }

	void ApplyVpnConfig(VpnCortexDynamicConfiguration newConfig);
	VPNKeys GetVpnKeys(string clientMac, string clientSignRequest, CortexDynamicConfiguration cortexDynamicConfiguration);
	bool UpdateVpnConfig(VpnCortexDynamicConfiguration dynamicConfig);
}
```
Now, update the constructor of `WServiceAdmin`:
```csharp
public WServiceAdmin(INeuronRepository neuronDb,
    IProfileRepository profileDb,
    IConfigRepository configDb,
    IPlatformRepository platformDb,
    IFeatureRepository featureDb,
    IVpnClientRegistrationManager vpnManager)
{
	_vpnClientResgistrationManager = vpnManager;
	_vpnClientResgistrationManager.start();

	_neuronDb = neuronDb;
	_profileDb = profileDb;
	_configDb = configDb;
	_platformDb = platformDb;
	_featureDb = featureDb;
}
```
However, there's a problem here: in the previous implementation, the `VpnClientRegistrationManager` has the service itself as constructor argument:
```csharp
_vpnClientResgistrationManager = new VpnClientRegistrationManager(this);
```
Fixing would require some refactoring, however, it turns out that this parameter is not used at all.
```csharp
public VpnClientRegistrationManager(IWServiceAdmin wServiceAdmin)
{
    SignClientMaxQueueSize = DefaultSignClientMaxQueueSize;
    _openVpnFolder = GetOpenVpnFolder();
}
```
We can safely remove it, avoid to refactor the code, but this is the typical things that makes unit testing legacy code hard to cost. 
Knowledge of the existing code base helps a lot in these cases.

## IoC Containers

A language point before continuing on IoC containers ([source](http://stackoverflow.com/questions/6550700/inversion-of-control-vs-dependency-injection))
> * **Inversion Of Control (IoC)** is a generic term meaning rather than having the application call
> the methods in a framework, the framework calls implementations
> provided by the application.
>
> * **Dependency Injection (DI)** is a form of IoC, where implementations are passed into an object
> through constructors/setters/service look-ups, which the object will
> 'depend' on in order to behave correctly.
>
> * **IoC without using DI**, for example would be the Template pattern
> because the implementation can only be changed through sub-classing.
>
> * **DI Frameworks** are designed to make use of DI and can define interfaces
> (or Annotations in Java) to make it easy to pass in implementations.
>
> * **IoC Containers** are DI frameworks that can work outside of the
> programming language. In some you can configure which implementations
> to use in metadata files (e.g. XML) which are less invasive. With some
> you can do IoC that would normally be impossible like inject
> implementation at pointcuts.

So in this section, we will talk about IoC containers, which are DI framework commonly used in software that follows SOLID design principles (remember, the D of SOLID stands for Dependency Inversion).

In the previous example, we saw how to create a component that has its depencies injected via its constructor.

This technique is called "Injection By Hand". While injection by hand can be ok for small projects, it can quickly become a mess for large projects (that's us). What happens in the previous example if the service has 20 dependencies. Now, what if each of these dependencies had an average of 3 dependencies of their own? And what happens when you want to add decorators to each given dependencies (logging, caching, etc.)?

Yeah.
That's right.
Nightmares and dead puppies.

You will spend more time creating and wiring objects together than actually writing code. This is where dependency injection libraries / frameworks can help.

### IoC containers to the rescue

IoC containers are a common way to solve these kind of issues. They provide a way to bind an interface to an implementation. To better illustrate, the following examples will use a "pseudo code" of IoC containers, but rest assured, most IoC frameworks have [very similar syntax](http://www.ninject.org/index.html).

```csharp
var container = new Container()
container.Bind<INeuronRepository>().To<XmlNeuronRepository>();
```

Whenever we will ask the container to give us the implementation of `INeuronRepository` , it will now return a new instance of `XmlNeuronRepository` object. 
Obviously, this is only possible if `XmlNeuronRepository` implements the interface `INeuronRepository`.

```csharp
var someRepository = container.Resolve<INeuronRepository>();
```

This allows to let the IoC container manage dependencies and pass them to objects. It also allows us to write custom rules to manage dependencies. For instance, we can do the following:
```csharp
var persistencyMode = RegistryHelper.GetValueOfKey<int>("HKLM\CAPSULE\CORTEX\PERSISTENCYMODE");
var container = new Container()

if(persistencyMode = PersistencyModes.XML) {
	container.Bind<INeuronRepository>().To<XmlNeuronRepository>();
}
else if(persistencyMode = PersistencyModes.SQL) {
	container.Bind<INeuronRepository>().To<SQLNeuronRepository>();
}
//[...]

// The container will pass the correct implementation to the service.
var service = new WServiceAdmin(container.Resolve<INeuronRepository>(), ...)
```

This allows to centralize dependencies in a single component. If another service needed a `INeuronRepository`, 
the container would give it the same. Not only does it makes the code easier to maintain, 
it also helps separating responsabilities: the depdency container manages dependencies, 
the repositories manages persistency, and services provides their functionnalities.

### Injection techniques
While passing these as arguments to the constructor of `WServiceAdmin`, IoC containers allows to do this in a better and faster way:
```csharp
var container = new Container();

var persistencyMode = RegistryHelper.GetValueOfKey<int>("HKLM\CAPSULE\CORTEX\PERSISTENCYMODE");
if(persistencyMode = PersistencyModes.XML) {
	container.Bind<INeuronRepository>().To<XmlNeuronRepository>();
}
else if(persistencyMode = PersistencyModes.SQL) {
	container.Bind<INeuronRepository>().To<SQLNeuronRepository>();
}
// register other repositories
// [...]

container.Bind<IWServiceAdmin>().To<WServiceAdmin>();

// Let the container pass arguments to the implementation of IWServiceAdmin
var service = container.Resolve<IWServiceAdmin>();
```

In this example, we let the container resolve the `IWServiceAdmin` implementation. When we ask to resolve the `IWServiceAdmin`, 
the container will find that it is bound to `WServiceAdmin`. It will then try to create a `WServiceAdmin` object by using reflection on its constructors. 
At this point, the container will identify X parameters in the constructor of `WServiceAdmin`. 
The first one is of type `INeuronRepository`, and it turns out that the container knows that `INeuronRepository` is bound to `XmlNeuronRepository` (or `SQLNeuronRepository`). 
It will then create the object for us and pass it as argument to the `WServiceAdmin`, then repeat for each other parameter.
If at any point the container is not able to resolve a dependency, it will go bang with an explicit message such as 
"Could not resolve depdendency `IUnknownDependencyStuff` when trying to instantiate `Assembly.Qualified.ClassName`, etc."

This is called Constructor injection, and it is the most commonly used injection technique. There are few other types of dependency injections that you can read about:

* [Martin Fowler's article](http://www.martinfowler.com/articles/injection.html#FormsOfDependencyInjection) about depdency injection (a reference)
* [Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection#Three_types_of_dependency_injection) (not that much of a reference, but well summarized)

## Using IoC containers in unit tests
As we saw earlier, one of the main benefits of dependency injection is that it made very easy to use mocks and inject them into our components. 
This allows us to focus the unit test of the method that is under test, making it trully "unitary".
The same principle applies with IoC containers, but with added sugar.

### Auto mocking containers

Many IoC frameworks provide "Auto Mocking" containers. The idea behind these is very simple: if a dependency is not registered in the container, 
it will create a Mock of that said dependency, register it and inject it instead of going bang. 
This is particularly useful when you need to test a component but only need to mock one of its dependencies.

Let's go back to our example. In this test, we will use [Autofac](http://autofac.org/) and [Moq](https://github.com/Moq/moq):
```csharp
public class WServiceAdmin
{
  public WServiceAdmin(INeuronRepository neuronDb,
					    IProfileRepository profileDb,
					    IConfigRepository configDb,
					    IPlatformRepository platformDb,
					    IFeatureRepository featureDb,
					    IVpnClientRegistrationManager vpnManager)
	{
		_vpnClientResgistrationManager = vpnManager;
		_vpnClientResgistrationManager.start();

		_neuronDb = neuronDb;
		_profileDb = profileDb;
		_configDb = configDb;
		_platformDb = platformDb;
		_featureDb = featureDb;
	}
	public void SaveConfig(IList<BaseConfig> configs)
	{
		// method under test goes here
	}
}

[TestClass]
public class WServiceAdmin
{
	[TestMethod]
	public void SaveConfig_WithDefaultConfigs_ShouldSucceed()
	{
		using (var autoMockingContainer = AutoMock.GetLoose())
		{
			// Arrange
			autoMockingContainer.Mock<IConfigRepository>()
								.Setup(repo => repo.Save())
								.Returns(True);

			// We are letting the automocking container resolve other dependencies
			var wServiceAdmin = autoMockingContainer.Create<WServiceAdmin>();

			// Act
			var result = wServiceAdmin.SaveConfig(ConfigHelper.GetDefaultConfigs());

			// Assert
			Assert.IsTrue(result);
			// Verify that Save() of the repository has been called once.
			autoMockingContainer.Mock<IConfigRepository>.Verify(repo => repo.Save, Times.Once);
		}
	}
}
```

Without the automocking container, we would have needed to write the following (boring) code:
```csharp
[TestMethod]
public void SaveConfig_WithDefaultConfigs_ShouldCallRepositorySave()
{
	// Arrange
	var neuronRepositoryMock = new Mock<INeuronRepository>();
	var profileRepositoryMock = new Mock<IProfileRepository>();
	var configRepositoryMock = new Mock<IConfigRepository>();
	var platformRepositoryMock = new Mock<IPlatformRepository>();
	var featureRepositoryMock = new Mock<IFeatureRepository>();
	var vpnMock= new Mock<IVpnClientRegistrationManager>();
	// Register all these in the container
	var container = new Container();
	container.Bind<INeuronRepository>().ToInstance(neuronRepositoryMock);
	container.Bind<IProfileRepository>().ToInstance(profileRepositoryMock );
	container.Bind<IConfigRepository>().ToInstance(configRepositoryMock );
	container.Bind<IPlatformRepository>().ToInstance(platformRepositoryMock );
	container.Bind<IFeatureRepository>().ToInstance(featureRepositoryMock );
	container.Bind<IVpnClientRegistrationManager>().ToInstance(vpnMock);
	var wServiceAdmin = container.Resolve<WServiceAdmin>();

	// Act
	var result = wServiceAdmin.SaveConfig(ConfigHelper.GetDefaultConfigs());

	// Assert
	Assert.IsTrue(result);
	// Verify that the Save() method of the repository has been called once.
	configRepositoryMock .Verify(repo => repo.Save, Times.Once);
}
```

While this is manageable with only five dependencies, you will quickly find that in complex solutions such as ours, auto-mocking quickly becomes addictive/required.

## With Great Power Comes Great Responsibility
While IoC containers can be useful way to register and resolve dependencies, you have to beware of one very common anti-pattern, which "IoC as service locator". 
This **anti pattern** is best described by the following code:
```csharp
// register all components as intances when the application start
IocContainer.Container.RegisterInstance(new ServiceLogHelper());
IocContainer.Container.RegisterInstance(new QueueFactory());
IocContainer.Container.RegisterInstance(new ConverterHelper());
IocContainer.Container.RegisterInstance(new ProcessingQueueSetting());
IocContainer.Container.RegisterInstance(new ReadyToSendQueueSetting());
// [...]
// Whenever a component is needed, use the IoC container to retrieve it
public QueueReceiver(QueueFactory factory, MSMQStorageSettings settings)
{
    _queue = factory.GetFrom(settings);
    _converter = IocContainer.Container.Resolve<ConverterHelper>();
}
``` 
The main issue with this approach is that the IoC container is not used for its intended purpose. Instead being used to manage dependencies, 
it is used as a [service locator](https://msdn.microsoft.com/en-us/library/ff648968.aspx) implementation.
This is a very common mistake that you should keep in mind when using IoC containers. Remember that the role of an 
IoC container is to provide dependencies to components, not to be used as a convenient way to get singleton/services instances.

A good indicator to keep in mind is that the depdencies *must* be injected into components. If you find that dependencies are resolved 
within methods instead of being injected into the component, then there is a good chance that you are using the IoC container as a Service Locator.

## Additional resources
You can find below a list of resources to get you started with Dependency Injection and have a more in depth understanding of how it works.

**Reading**

* [Martin Fowler's article on Inversion Of Control](http://www.martinfowler.com/articles/injection.html)
* [List of most used .NET DI frameworks](http://www.hanselman.com/blog/ListOfNETDependencyInjectionContainersIOC.aspx)

**PluralSight trainings**

* [Jon Skeet's C# Design Strategies](https://app.pluralsight.com/library/courses/csharp-design-strategies/table-of-contents), a very good training on how to apply SOLID principles in C# design. I strongly recommend the [outtake](https://app.pluralsight.com/player?course=csharp-design-strategies&author=jon-skeet&name=skeet-patterns-m5-ioc-ioc-outtake&clip=0&mode=live) session where he builds a lightweight IoC container in a few minutes. Seeing simple code of an IoC container implementation helps *a lot* in understanding how they work.
* [Jon Sonmez's training on Inversion of Control](https://app.pluralsight.com/library/courses/inversion-of-control/table-of-contents) where he covers the basic DI and IoC principles and shows examples with some common IoC frameworks (Unity, Windsor, Structure Map, Ninject)
* [RequireJS: JavaScript Dependency Injection and Module Loading](https://app.pluralsight.com/library/courses/requirejs-javascript-dependency-injection/table-of-contents) A presentation of RequireJS, one of the libraries/module loader that allows to do dependency injection in JavaScript. Note that require is not the only one, [SystemJS](https://github.com/systemjs/systemjs) has also a lot of traction and frameworks like [Angular](https://docs.angularjs.org/guide/di) and [Aurelia](http://aurelia.io/docs.html#/aurelia/dependency-injection/latest/doc/api/overview) have built-in Dependency Injection capabilities.

**Useful links**

* [AutoFixture](https://github.com/AutoFixture/AutoFixture) A framework designed to make the "arrange" phase faster. Allows easy auto mocking.
* [NodaTime](http://nodatime.org) Can you easily test code that calls DateTime.Now? No? Then use NodaTime. It is made by [Jon Skeet](http://stackoverflow.com/users/22656/jon-skeet) btw.
