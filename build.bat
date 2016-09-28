::
:: cleaning the build dir
sencha ant clean

:: building the app
sencha app build

:: get additional stuff for exist-db
call ant build-plus

:: build xar
chdir .\build
call ant

chdir ..