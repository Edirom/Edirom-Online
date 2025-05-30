# Developing with Docker

After running the initial installation instruction as described in the [README](../README.md#installation) the docker compose build will have performed with the setup you provided.

> [!WARNING]
> Even after you quit the Edirom Online and restart it with `docker compose up` it will be restarted with the initial setup.

If you want to change the setup, e.g., switching to another branch fo Edirom Online Frontend or Edirom Online Backend or provide another edition XAR, the service has to be rebuilt. The following provides several options of how to achieve this.



After you have quit Edirom Online and made changes to your configuration, e.g., specifying other repositories or branches for backend or frontend, you can make docker compose rebuild the containers by running:

> [!NOTE]
> ```bash
> docker compose build
> ```
[^1]

[^1]: For more information in the `docker compose build` command, see https://docs.docker.com/reference/cli/docker/compose/build/

This will rebuild both, the Edirom Online Frontend and the Edirom Online Backend according to your modified configuration. After starting Edirom Online with `docker compose up` it will run with your modified configuration.

Alternatively you can rebuild when starting the service by adding `--build` to the up command:

> [!TIP]
> ```bash
> docker compose up --build
> ```
[^2]

[^2]: For more information in the `docker compose up` command, see https://docs.docker.com/reference/cli/docker/compose/build/
