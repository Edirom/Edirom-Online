# Setup Edirom Online on a local machine



This guide will explain step by step how to **build Edirom Online**, the **EditionExample data package**, setup an **exist-db** on your local machine and upload both packages to it. We tested it on MacOS, but it should work on every OS. 
You need to install *Docker* and either *Apache Ant* or *oXygen XML-Editor*. Its recommended to install *git* but you can also download the required files from the git-repos without git.

**Prerequisites**

- open terminal-window (Windows: Powershell) and navigate to the path where you want the Edirom Online-files to be saved: e.g. `cd /home/<your-username>/repos`
- create a folder on your disc for the files: `mkdir edirom`
- go in that folder: `cd edirom`

## Build Edirom Online

If you only want to “use” Edirom Online, downloading a prebuild package is all you need to do. Go to the [releases](https://github.com/Edirom/Edirom-Online/releases) of the github-repo of edirom-online, chose your version and download the xar-package.
If you want to customize it, you need to build it and create a xar-package by yourself by following the description below.

- fork the [develop-branch](https://github.com/Edirom/Edirom-Online) of the Edirom Online Github repository
- **clone** your fork to your disk
    - `git clone git@github.com:<your-username>/Edirom-Online.git` (change `<your-username>`to your github-username)
    - this will checkout the latest version of Edirom Online, if you want an earlier version, you can manually checkout that commit
- navigate to the repository: `cd Edirom-Online`
- to **build** the Edirom Online we need *[Sencha Cmd](https://www.sencha.com/)*, but we can use the sencha-cmd-docker-image by @bwbohl instead of installing sencha on our own.
    - download and run the sencha-cmd-image:
      ```
      docker run --rm -it -v `pwd`:/app --name ediBuild ghcr.io/bwbohl/sencha-cmd:latest
      ```
    - this will build a docker-container giving us the opportunity to execute commands inside the container, but we still have access to the current directory, the terminal-prefix will change to something like this: `root@d5f2f1591708:/app#`
    - execute the build-script: `sh build.sh`
    - some warnings will appear, but you can savely ignore them
    - it will take a minute or so to build and return the following
      ```
      BUILD SUCCESSFUL 
      Total time: 17 seconds 
      root@d5f2f1591708:/app# 
      ``` 
  - the Edirom Online-package is built, we can leave docker-container: `exit`
  - the directory `build-xar/` was created inside the Edirom-Online repository and contains the built xar-file of Edirom Online: `Edirom-Online-1.0.0-20250213-1739.xar` (version and date-strings will vary)
- navigate back to the edirom-base-directory: `cd ..`

## Build data package

The [EditionExample](https://github.com/Edirom/EditionExample) is a good way to test if your Edirom Online works correctly and a good starting point for your own edition. 
- fork the EditionExample repository: https://github.com/Edirom/EditionExample
- clone the forked repository to your disk: `git clone git@github.com:<your-username>/EditionExample.git` (change `<your-username>`to your github-username)
- navigate to the directory: `cd EditionExample`
- open `build.xml` with *oXygen* and click the run-button, oXygen will do the rest automatically
    - if you have *Apache Ant* installed, you also can execute it manually: `ant`
- the directory `dist/` will be created and contains the built data package: `EditionExample-0.1.xar`
- leave the EditionExample directory: `cd ..`

## Create an exist-db on your local machine

Well done, we created the build of Edirom-Online and the one for the data package (EditionExample). To see the edition on your local machine, the last step is to load both xar-packages into an [exist-db](https://exist-db.org/exist/apps/homepage/index.html).
Also at this step we can use a docker image, instead of downloading exist on our own. 
- run the docker image provided by @peterstadler: `docker run -it -p 8080:8080 --name existdb -e EXIST_ENV=development -e EXIST_CONTEXT_PATH=/exist stadlerpeter/existdb:6`
    - if you only want to run the container once, you can add the flag `--rm` then it will be deleted after you stop it
- exist-db will start in a docker container, it is ready if the following is shown:
    ```
    26 Sep 2024 15:49:45,369 [main] INFO  (JettyStart.java [run]:288) - -----------------------------------------------------
    26 Sep 2024 15:49:45,369 [main] INFO  (JettyStart.java [run]:289) - Server has started, listening on:
    26 Sep 2024 15:49:45,370 [main] INFO  (JettyStart.java [run]:291) - http://172.17.0.2:8080/
    26 Sep 2024 15:49:45,370 [main] INFO  (JettyStart.java [run]:291) - https://172.17.0.2:8443/
    26 Sep 2024 15:49:45,370 [main] INFO  (JettyStart.java [run]:294) - Configured contexts:
    26 Sep 2024 15:49:45,371 [main] INFO  (JettyStart.java [run]:300) - /exist (eXist XML Database)
    26 Sep 2024 15:49:45,374 [main] INFO  (JettyStart.java [run]:316) - /exist/iprange (IPrange filter)
    26 Sep 2024 15:49:45,375 [main] INFO  (JettyStart.java [run]:324) - -----------------------------------------------------
    ``` 
- once the exist-db is ready, you can open its dashboard in your browser: [`http://localhost:8080/exist/apps/dashboard/index.html`](http://localhost:8080/exist/apps/dashboard/index.html)
- login to the exist-db via the "Login" button in the top right corner:
    - user: admin
    - pass: will be random-generated, but printed in the exist-db container output above, it looks like that:
        ```
        no admin password provided
        setting password to Thh3Mj3iUYG2OYpakbslXiTs
        ``` 
    - you might also want to save that password, because it wont be shown elsewhere
- go to "Package Manager" in the menu on the left and upload the two previously generated xar-packages
    - `Edirom-Online-1.0.0-2025213-1739.xar` (version and date-string varies)
    - `EditionExample-0.1.xar`
- once the upload is finished, the edirom will be available here: [`http://localhost:8080/exist/apps/Edirom-Online/index.html`](http://localhost:8080/exist/apps/Edirom-Online/index.html) (if not, a reload of the browser window may help)
- you can stop the docker container with `^+C` (Mac) or `CTRL+C` (Windows and Linux) or force-stop it by closing the terminal
- once you stopped the exist-db docker container, you can start it with the following command: `docker start existdb` and after a short time the Edirom Online will be available again. `docker stop existdb` will stop it.

---
*first version of this file was written by @feuerbart, 26./27.9.2024 at the [Edirom-Summer-School](https://ess.uni-paderborn.de/) in discussion with @riedde and @krHERO*
