# Setup Edirom-Online on a local machine


This guide will explain step by step how to **build Edirom-Online**, the **EditionExample data package**, setup an **exist-db** on your local machine and upload both packages to it. We tested it on MacOS, but it should work on every OS. 
You need to install *Docker* and either *Apache Ant* or *oXygen XML-Editor*. Its recommended to install *git* but you can also download the required files from the git-repos without git.

**Prerequisites**

- open terminal-window (Windows: Powershell) and navigate to the path where you want the Edirom-Online files to be saved: e.g. `cd /home/<your-username>/repos`
- create a folder on your disc for the files: `mkdir edirom`
- go in that folder: `cd edirom`

## Build Edirom-Online

If you only want to “use” Edirom-Online, downloading prebuilt packages for the frontend and backend is all you need to do. 

Go to the [frontend releases](https://github.com/Edirom/Edirom-Online-Frontend/releases) of the GitHub repository of Edirom-Online Frontend, choose your version and download the xar-package.

Go to the [backend releases](https://github.com/Edirom/Edirom-Online-Backend/releases) of the GitHub repository of Edirom-Online Backend, choose your version and download the xar-package.

If you want to customize the frontend or the backend, you need to build and create a xar-package for either one by yourself by following the description below. 

### Build Backend module

- fork the develop branch of the [Edirom-Online Backend](https://github.com/Edirom/Edirom-Online-Backend) Github repository
- **clone** your fork to your disk
    - `git clone git@github.com:<your-username>/Edirom-Online-Backend.git` (change `<your-username>`to your github-username)
    - this will checkout the latest version, if you want an earlier version, you can manually checkout that commit
- navigate to the repository: `cd Edirom-Online-Backend`
- to **build** the Edirom-Online Backend we need *Apache Ant*, simply type in the terminal:
      ```
      ant
      ```
  - the Edirom-Online Backend package is built
  - the directory `build-xar/` was created inside the Edirom-Online Backend repository and contains the built xar-file of Edirom-Online Backend: `Edirom-Online-Backend-1.0.0-20250213-1739.xar` (version and date-strings will vary)
- navigate back to the edirom-base-directory: `cd ..`

### Build Frontend module

- fork the develop branch of the [Edirom-Online Frontend](https://github.com/Edirom/Edirom-Online-Frontend) Github repository
- **clone** your fork to your disk
    - `git clone git@github.com:<your-username>/Edirom-Online-Frontend.git` (change `<your-username>`to your github-username)
    - this will checkout the latest version, if you want an earlier version, you can manually checkout that commit
- navigate to the repository: `cd Edirom-Online-Frontend`
- to **build** the Edirom-Online Frontend a script is executed (this will make use of a Docker container and *Sencha Cmd* internally), simply type in the terminal:
      ```
      sh build.sh -d
      ```
  - the Edirom-Online Frontend package is built
  - the directory `build-xar/` was created inside the Edirom-Online Frontend repository and contains the built xar-file of Edirom-Online Frontend: `Edirom-Online-Frontend-1.0.0-20250213-1739.xar` (version and date-strings will vary)
- navigate back to the edirom-base-directory: `cd ..`

## Build data package

The [EditionExample](https://github.com/Edirom/EditionExample) is a good way to test if your Edirom-Online works correctly and a good starting point for your own edition. 
- fork the EditionExample repository: https://github.com/Edirom/EditionExample
- clone the forked repository to your disk: `git clone git@github.com:<your-username>/EditionExample.git` (change `<your-username>`to your github-username)
- navigate to the directory: `cd EditionExample`
- open `build.xml` with *oXygen* and click the run-button, oXygen will do the rest automatically
    - if you have *Apache Ant* installed, you also can execute it manually: `ant`
- the directory `dist/` will be created and contains the built data package: `EditionExample-0.1.xar`
- leave the EditionExample directory: `cd ..`

## Create an exist-db on your local machine

Well done, we now have the builds of Edirom-Online Backend and Frontend and the one for the data package (EditionExample). To see the edition on your local machine, the last step is to load all xar-packages into an [exist-db](https://exist-db.org/exist/apps/homepage/index.html).
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
    - `Edirom-Online-Backend-1.0.0-2025213-1739.xar` (version and date-string varies)
    - `Edirom-Online-Frontend-1.0.0-2025213-1739.xar` (version and date-string varies)
    - `EditionExample-0.1.xar`
- once the upload is finished, the edirom will be available here: [`http://localhost:8080/exist/apps/Edirom-Online-Frontend/index.html`](http://localhost:8080/exist/apps/Edirom-Online-Frontend/index.html) (if not, a reload of the browser window may help)
- you can stop the docker container with `^+C` (Mac) or `CTRL+C` (Windows and Linux) or force-stop it by closing the terminal
- once you stopped the exist-db docker container, you can start it with the following command: `docker start existdb` and after a short time the Edirom-Online will be available again. `docker stop existdb` will stop it.

---
*first version of this file was written by @feuerbart, 26./27.9.2024 at the [Edirom-Summer-School](https://ess.uni-paderborn.de/) in discussion with @riedde and @krHERO*
