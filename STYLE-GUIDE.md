
# Edirom Online Styleguide

- [General Instructions](#general-instructions)
- [XQuery](#xquery)
  * [Documentation: xqDoc](#documentation--xqdoc)
  * [XQuery document structure](#xquery-document-structure)
  * [HowTo ToDo:s](#howto-todo-s)
- [Javascript](#javascript)
  * [AJAX calls](#ajax-calls)

## General Instructions

* do not combine code-linting and content work in one commit
* Whitespace handling
  * Use whitespaces, not tabs to indent code
  * Close file with a newline character

## XQuery

For formatting of XQuery files we generally rely on the basic configuration of Synchrosoft’s oXygen XML software family and its “Format & Indent” function.

### Documentation: xqDoc

We use [xqDoc](https://xqdoc.org) for documenting the XQueries in this repository. Please refer to the section [xqDoc Comments](https://xqdoc.org/xqdoc_comments_doc.html) of the xqDoc-website for details on formatting the documentation comment blocks.

* XQuery modules must have a library module xqDoc comment preceding the module declaration.
* Function declarations must have a library module xqDoc function comment preceding the function.

### XQuery document structure

**XQuery version declaration**

```xquery
xquery version 3.1;
```

**Beginning comments**

For now, the beginning comments should only include the following:

```xquery
(:
 : Copyright: For LICENSE-Details please refer to the LICENSE file in the root directory of this repository.
 :)

 ```
The beginning comments and the structuring comments (see below) of the prolog are separated by a blank line.

**Prolog**

1. The parts of the prolog, are introduced by a comment followed by a new line.
2. The below form of the comments and the order of the parts is prescriptive.
3. Each part of the prolog ends with a blank line.

```xquery
(: IMPORTS ================================================================= :)

```

Sort imports by type:
1. All `import module namespace` statements registered with eXist-db
2. All `import module namespace` statements of custom modules that are not registered with eXist-db. Always use relative URIs for unregistered `import module namespace` statements.
3. Separate groups with a blank line.
4. In the groups sort alphabetically by prefix.

```xquery
(: NAMESPACE DECLARATIONS ================================================== :)

```

All `declare namespace` statements, sorted alphabetically by prefix.

```xquery
(: OPTION DECLARATIONS ===================================================== :)


```
All `declare option` statements.

```xquery
(: VARIABLE DECLARATIONS =================================================== :)

```
1. Use `declare variable` statements for all required external parameters
2. All global variable declarations, i.e. `declare variable` statements.
3. Separate these two groups with a blank line.
4. In the groups, sort alphabetically.

```xquery
(: FUNCTION DECLARATIONS =================================================== :)

```

1. All `declare function` statements.
2. All function declarations have to be preceded by an xqDoc comment.
3. The xqDoc comment and function declaration belonging together are not separated by blank lines – not even one ;-)
4. The comment-function-groups are separated by blank lines.

A prototypical example:

```xquery
(: FUNCTION DECLARATIONS =========================================== :)

(:~
 :
 :)
declare function eg:addComment($comment as xs:string, $function as function())
as xs:string
{
   …
}

(:~
 :)
declare function eg:addComment($comment as xs:string, $function as function())
as xs:string
{
   …
}
```

**Query body**

The Query body start after a structuring comment as follows:

```xquery
(: QUERY BODY ============================================================== :)

```

**Strings**

Note: this is derived from the current usage in Edirom-Online code

* escape with U+00027 APOSTROPHE: `'`

**Literal results**

TODO: how should literal results be indented, especially when they are long, e.g., as in the case of [getAudioPlayer.xql](add/data/xql/getAudioPlayer.xql).

**let statements**

Short variable definitions should be in a single line:

```xquery
let $lang := 'de'
```

Longer assignments, especially when the contain if-else-statements or FLWOR-expressions, should break after `:=` and then indent a further level, before following the rules applicable to the respective statements, e.g.:

```xquery
let $elems :=
   for $p in $participants
   let $id := substring-after($p, '#')
   return doc($doc)/id($id)
```

**Function declarations**

```xquery
(:~
 : XQdoc comment
 :
 …
 :
 :)
declare function prefix:function-name( $paramOne as datatype, §paramTwo as datatype )
as datatype
{
   …
};

```

- [ ] at the moment return datatypes and opening curly braces of function declarations are still in the same line as the `declare function` statement
- [ ] break long function argument

### HowTo ToDo:s

- [ ] literal results formatting
- [ ] nested return statements
- [ ] parenthesis placement


## Javascript

### AJAX calls

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
