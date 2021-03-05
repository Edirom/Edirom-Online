Edirom Online Preferences
=========================

The prefs folder contains Edirom Online default preferences. If you want project specific overwrite for these preferences copy this file to any location in your ```$CONTENTS_FOLDER$``` you may also rename it as desired. In order to activate the preference file you need to add its URI to your ```$EDITION_FILE``` in the following manner:

```<preferences xlink:href="xmldb:exist:///db/$CONTENTS_FOLDER$/$EDITION_ID$/$ANY_PATH$/$FILE_NAME$.xml"/>```

Besides overwrites for the preferences this file also allows configuring plugins, i.e. overwirtes for javascript functions and XQueries in the following manner:

JavaScript
--------------
```<entry key="plugin_annotView" value="../../../exist/rest/db/$CONTENTS_FOLDER$/$EDITION_ID$/$ANY_PATH$/$FILE_NAME$.js"/>```

XQuery
------

```<entry key="data/xql/getParts.xql" value="../../../exist/rest/db/$CONTENTS_FOLDER$/$EDITION_ID$/$ANY_PATH$/$FILE_NAME$.xql"/>```

Please be aware that the latter is not fully supported yet.
