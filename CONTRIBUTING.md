# Edirom Online Contributing Guidelines

# General Guidelines

## Whitespace handling

1. Use whitespaces, not tabs to indent code
2. Close file with 


# XQuery

## Importing modules

* always use relative URIs for `import module namespace` statements that import a local edirom xqm

# Javascript

## AJAX calls

The class `EdiromOnline.controller.AJAXController` provides a central method `doAJAXRequest` for performing AJAX requests. The method is provided globally as `window.doAJAXRequest`.

`doAJAXRequest` takes the following arguments:

* `url`: The URL of the requestet site or end point.
* `method`: The HTTP method like `PUT`, `GET`, `POST`.
* `params`: An object containing key-value-pairs of parameters for the request.
* `successFn`: A callback function which is called when the AJAX request was successfull.
* `retryNo`: The number of retries, if the requests fails. Standard is 2 retries.
* `async`: Defines the async parameter for AJAX calls. Default is 'true'.

An example of using the function would be:

```javascript
window.doAJAXRequest('data/xql/getAnnotationMeta.xql',
    'GET', 
    {
        uri: uri,
        lang: lang
    },
    Ext.bind(function(response){
        view.setMeta(response.responseText);
    }, this)
);
```

