# Edirom Online Contributing Guidelines

# General Guidelines

* do not combine code-linting and content work in one commit

## Whitespace handling

1. Use whitespaces, not tabs to indent code
2. Close file with a newline character


# XQuery

## xqDoc

We use [xqDoc](https://xqdoc.org) for documenting the XQueries in this repository. Please refer to the section [xqDoc Comments](https://xqdoc.org/xqdoc_comments_doc.html) of the xqDoc-website for details on formatting the documentation comment blocks.

* XQuery modules must have a library module xqDoc comment preceding the module declaration.
* Function declarations must have a library module xqDoc function comment preceding the function.

## XQuery document structure

### XQuery version

```xquery
xquery version 3.1;
```

### License Statement

```xquery
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
:)
```

### File Header

1. `declare namespace` statements
   * sort alphabetically by prefix
2. `import module namespace` statements of registered modules
   * sort alphabetically by prefix
3. `import module namespace` statements of custom modules
   * sort alphabetically by prefix
   * Always use relative URIs for `import module namespace` statements that import for modules not registered with eXist-db.

### Declare variables

* Use `declare variable` statements for all required external parameters

### Function declarations

* functions have to be preceded by an xqDoc comment

### XQuery body

* Strings: escape with U+00027 APOSTROPHE: `'`


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
