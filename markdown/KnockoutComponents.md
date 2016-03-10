# Knockout Components

This is an introduction on Knockout Components. The goal of this workshop is not to repeat
every thing that is already documented on 
[Knockout's awesome website](http://Knockoutjavascript.com/documentation/component-overview.html), 
but rather summarize it and explain how we can use these components in our solution.

# What is a component
Knockout components are the equivalent of Custom controls (or Directives for Angular people). 
Since Knockout is an MVVM framework, components have a View and a ViewModel. 
You can easily re-use them throughout your application.

## Example
They are very close to the Web Component specficication. Here is what a Knockout component
looks like:

-	A view named `mycomponent.html` is created. It contains the HTML markup as well as the 
bindings of the component
-	A [require](http://requirejs.org/) module named `mycomponent.js` is created. It requires 
Knockout and also requires the HTML template using require’s `Text!` import. This allows to
inject the markup inside of the ViewModels, to reduce coupling between the view and the 
ViewModel
-	The javascript module exports a function which is the ViewModel’s constructor
-	Components are registered using Knockout’s registerComponent method (just like applications)
-	The components registration will happen at the initialization of the application:
  - For SLIQ, in the `MainViewModel.js`, in the `RegisterComponents` method
  - For the Web Admin, in the `koApp.js`, within the the `run` method

```html
<!-- mycomponent.html -->
<div <div class="row">  
    <div <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">  
        <span data-bind="text: Message"></span>  
    </div>  
</div>  
```

```javascript
// mycomponent.js, in the same folder as mycomponent.html 
define(['Knockout', 'text!./mycomponent.html'], function (ko, htmlString) {  
    function ViewModel() {  
        var self = this;  
        self.Message = ko.observable("Hellow world!");  
    }  
    return {  
        viewModel: ViewModel,  
        template: htmlString  
    };  
});  
```

```html
<!-- Example usage -->
<div data-bind="foreach: ListOfItems()">  
    <mycomponent></mycomponent>  
</div>  
```

## Requirements
In order to use components, you will need at least Knockout v3.2, 
where they were introduced.

# Why should I make components
- Create abstraction from UI frameworks (such as Bootstrap)
  - To change UI framework, simply rewrite your UI components instead of your whole application
- Less code duplication
- Better separation of concerns
- Write less code (especially with Bootstrap)
- Code is easier to read. Example with a bootstrap Modal
- They are easier to test

```html
<!-- without components -->
<div class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Modal title</h4>
      </div>
      <div class="modal-body">
        <p>One fine body</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<!-- With components -->
<modal params="Title: 'Modal Title', PrimaryButtonText: 'Save Changes', SecondaryButtonText: 'Close'">
   <p>One fine body</p>
</modal>
```
A lot simpler, right?

# Advanced components stuff
Components means that your all application code will not be in the same ViewModel anymore.
This implies that you will now need to pass data to components. There are multiple ways to
do this, but here are the two most common and "cleanest":
- Use the `params` binding to supply parameters to the components' viewmodel
- Place markup directly inside the component, just like with the modal example above.

## Using params to pass data

The `params` bindings allows to pass parameters from parent to child components. Let's
take our modal component and see how it would be implemented:
```html
<modal params="Title: 'Modal Title', PrimaryButtonText: 'Save Changes', SecondaryButtonText: 'Close'">  
</modal>
```
```javascript
// modal.js
define(['Knockout', 'text!./modal.html'], function (ko, htmlString) {  
    function ModalViewModel(params) {  
        var self = this;  
        self.Title = ko.observable(params.Title);
        self.PrimaryButtonText = ko.observable(params.PrimaryButtonText);
        self.SecondaryButtonText = ko.observable(params.SecondaryButtonText); 
    }  
    return {  
        viewModel: ModalViewModel,  
        template: htmlString  
    };  
});  
```
```html
<!-- modal.html -->
<div class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 data-bind="text: Title" class="modal-title"></h4>
      </div>
      <div class="modal-body">
        <!-- ommited for now, we'll deal with this later -->
      </div>
      <div class="modal-footer">
        <button type="button" data-bind="text: SecondaryButtonText" class="btn btn-default" data-dismiss="modal"></button>
        <button type="button" data-bind="text: PrimaryButtonText" class="btn btn-primary"></button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
```
Notice how the component creates observables using the params as default value. It works fine in this case,
but what if the parent would like to pass an obsevable, and have the component reuse that same observable?

Say that we have a page (using [PagerJS](http://pagerjs.com/) or another routing library, 
such as [Crossroads](https://millermedeiros.github.io/crossroads.js/)). That page's viewmodel will be 
in charge of regularly contacting an API to retrieve data and store it in an observable array. The page
will then use a `Grid` component to display the data, which will passed to the grid using the `params`
binding. Wouldn't it be nice if when the observable array from the parent changes, the child also changes?

Here's how we would do it:

```html
<!-- page.html -->
<h1>Page Title</h1>
<grid params="items: neurons"></grid>
```

```javascript
// page.js
define(['Knockout', 'text!./page.html', 'api'], function (ko, htmlString, api) {  
    function PageViewModel(params) {  
        var self = this;  
        self.neurons = ko.observableArray([]);
        // set a timer to update the list of items every 5 seconds
        setTimeout(function(){
          api.getNeurons().then(function(javascriptonResponse) { 
            self.neurons(javascriptonResponse) 
          }); 
        }, 5000);
    }  
    return {  
        viewModel: PageViewModel,  
        template: htmlString  
    };  
});
```
This is our page. It is fairly simple, it will retrieve data every 5 seconds and update its observable
list of neurons with the results. Its view is simply composed of a title and the Grid component, to which
it passes the list of Neurons.

Now, let's look at the implementation of this Grid component:

```html
<!-- grid.html -->
<table data-bind="foreach: items">
  <tr>
    <td data-bind="text: NeuronId"></td>
    <td data-bind="text: Location"></td>
    <td data-bind="text: NurseId"></td>    
  </tr>
</table>
```

```javascript
// grid.js
define(['Knockout', 'text!./grid.html'], function (ko, htmlString) {  
    function GridViewModel(params) {  
        var self = this;  
        self.items = ko.observableArray([]);
        
        // This should be in a helper, but placed here for demo.
        if(params.items){
            if(ko.isObservable(params.items){
              // if the parameter is an observable, use it directly. Therefore, when this observable
              // changes, the list will be updated using the foreach binding.
              self.items = params.items;
              
              // We can also subscribe to changes on this observable to make custom actions.
              // This is useful if you use 3rd party libraries (ex: update charts data)
              params.items.subscribe(function(newItems) {
                console.log('Received new data...');
              });
            } else {
              // if the parameters are not observables, create an observable from it. This allows to 
              // use the component to simply display an Array. This is a good practice as it makes
              // components more resilient and easier to use.
              self.neurons = ko.observableArray(params.items);
            }           
        }       
    }  
    return {  
        viewModel: GridViewModel,  
        template: htmlString  
    };  
});
```

This component is now capable of being bound to an observable array of item, run custom 
actions when the data changes, and it can also be used to simply display an array 
of items (useful for components such as dropdowns): 

```html
<dropdown params="items: ['Wow', 'Much', 'Array', 'Such', 'Component']"></dropdown>
```


## Using params to pass delegates, aka "click handlers"
Another best practice is to pass delegates to components having buttons or actions 
to execute. A good example for this would be our Modal model. When we use that component,
there is a very likely chance that the `Save` and `Cancel` methods will be in the parent
of this component. The best thing to do is to pass delegates as `params` to the child 
component. Here's what it looks like (simplified markup/javascript to make easier to read):

```html
<!-- modal.html -->
<div class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-footer">
    <button type="button" data-bind="text: PrimaryButtonText, click: onPrimaryClicked" class="btn btn-primary"></button>
  </div>
</div><!-- /.modal -->
```

```javascript
// modal.js
define(['Knockout', 'text!./modal.html'], function (ko, htmlString) {  
    function ModalViewModel(params) {  
        var self = this;  
        self.PrimaryButtonText = ko.observable(params.PrimaryButtonText);
        
        self.onPrimaryClicked = function(data, event){
          // do internal stuff if needed
          console.log('Primary button clicked');
          // Invoke the parent delegate
          params.onPrimaryClicked(data, event);
        }
    }  
    return {  
        viewModel: ModalViewModel,  
        template: htmlString  
    };  
});  
```

And to use this modal from a page, we would do the following:

```html
<!-- page.html -->
<h1>Page Title</h1>
<modal params="Title: 'Such title!', onPrimaryClicked: saveData, PrimaryButtonText: 'Save Changes'">  
</modal>
```
```javascript
// page.js
define(['Knockout', 'text!./page.html', 'api'], function (ko, htmlString, api) {  
    function PageViewModel(params) {  
        var self = this;  
        self.saveData = function(data, event) {
          api.saveData(data);
        }
    }  
    return {  
        viewModel: PageViewModel,  
        template: htmlString  
    };  
});
```

## Passing content directly to components
If we look back at our primary example, we were able to pass HTML markup directly inside the component.
This is particularly useful for our modal example, where the content can be complex and hard to make "generic".
As a reminder, this is what we would like to achieve:
```html
<modal>
  <p>Some content that we want to display in the modal</p> 
    <ul>
      <li>And that is not</li>
      <li>easy to make generic</li>
      <li>without requiring a ton of parameters</li>
    </ul>  
</modal>
```
This can be done quite easily with Knockout Components. By default, everything inside the `<modal>`
tag will be stripped. However, Knockout keep the stripped nodes in memory and passes them to the 
component's binding context. We can then reuse this to simply display these nodes, which looks like
this (again, some markup is stripped to make it easier to read):

```html
<!-- modal.html -->
<div class="modal fade" tabindex="-1" role="dialog">  
  <div class="modal-body">
    <!-- ko template: { nodes: $componentTemplateNodes, data: $data } --><!-- /ko -->
  </div>         
</div>
```

This is all we need. The `ko template` is a special comment that is processed by Knockout.
It will render the nodes inside our `<modal>`, and bind it to the current viewmodel, which is the 
ModalViewModel. This means that in the parent, we can even bind the content to some values passed as 
params to the modal component:

```html
<modal params="title: 'Wow, much title'">
  <p>The title of this modal component has a length of <b data-bind="text: title().length"></b> characters.</p>
</modal>
```

## Further reading

### Knockout's documentation
The whole Knockout documentation. I really recommend to read it, you will learn a lot about how
Knockout works and what it is capable of. There are a lot of bindings and possibilities to use them.
The examples shown here are only one of the ways to use components (the "custom elements" method), but
there are other ones that might be a lot more convenient depending on what you are doing. It will also
inform you on some best practices and caveats that you need to be aware of.

If you are writing JavaScript and use Knockout, read it.

Seriously.

It's here http://Knockoutjavascript.com/documentation/introduction.html, and it's free.

### Plugins
The other thing is not necessarly related to components, but is very useful for people who use Knockout.
It is called "plugins". Have a look:

- https://github.com/Knockout/Knockout/wiki/plugins

Also look at @mbest contributions on GitHub, he has done some great plugins for Knockout:
- https://github.com/mbest 