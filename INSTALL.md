# Server installation

## Basic configuration

Choose a VPS and install Ubuntu Server 24.04 LTS.

# Helpful Commands

## Docker compose up and down

To start docker compose file use

`docker compose up --build -d`

To stop instead

`docker compose down`

## Docker delete all data

To delete all containers, images, builds, volumes, networks it is possible to use the command

`docker system prune -a --volumes`

## Docker open a shell

To open a shell in a container, use

`docker exec -it [CONTAINER_NAME] /bin/sh`

## Postfix-Server external access

To permit the access to Postfix server from outside, it is possible to use socat as a way to execute a port forwarding.

- Install socat with

  `sudo apt install socat`

- Enable the 9091 TCP port on ufw firewall

  `sudo ufw allow 9091/tcp comment "KORU Postfix-Server"`

- Enable the port forwarding

  `socat TCP-LISTEN:9091,fork TCP:127.0.0.1:9090`

- The Postfix-Server is reachable on `[SERVER_IP]:9091` as long as the socat command is alive
