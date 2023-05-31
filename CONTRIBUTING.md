# Edirom Online Contributing Guidelines

# General Guidelines

* do not combine code-linting and contet work in one commit

## Whitespace handling

1. Use whitespaces, not tabs to indent code
2. Close file with newline character 


# XQuery

## XQuery version

```xquery
xquery version 3.1
```

## Version Statement

```xquery
(:
For LICENSE-Details please refer to the LICENSE file in the root directory of this repository. 
:)
```

## Module imports

1. declare namespaces
2. import module namespaces of registered modules
3. import module namespaces of custom modules

* Sort all three alphabetically.
* Always use relative URIs for `import module namespace` statements that import for modules not registered with eXist-db.

## Declare variables

* Use declare function statements for all required external parameters

## Function declarations

* functions have to be preceeded by a XQDoc code-block

## Strings

* escape with single upper straight quote  