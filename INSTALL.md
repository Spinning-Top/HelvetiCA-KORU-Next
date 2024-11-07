# Server installation

## Basic configuration

- Choose a VPS and install Ubuntu Server 24.04 LTS

- Generate a new SSH key with

  `ssh-keygen -t rsa -b 4096 -C "marco@spinningtop.it"`

- Install the keys to 1password and termius

- Create new user

  `adduser gavynsykes`

- Add the user to sudo and root groups

  `usermod -aG sudo gavynsykes`

  `usermod -aG root gavynsykes`

- Copy SSH key to server

  `ssh-copy-id gavynsykes@[SERVER_IP]`

- Disable password authentication by opening the file

  `sudo nano /etc/ssh/sshd_config`

  * Perform these modifications

    `#PasswordAuthentication yes` to `PasswordAuthentication no`

    `UsePAM yes` to `UsePAM no`

    `PermitRootLogin yes` to `PermitRootLogin no`

  * Check if additional edits are needed in files inside `/etc/ssh/sshd_config.d/`

  * Apply updates with `sudo systemctl reload ssh`

- Avoid sudo password by opening the file

  `sudo nano /etc/sudoers.d/90-cloud-init-users`

  * Add this row to the end of the file

    `gavynsykes ALL=(ALL) NOPASSWD:ALL`

## Install nginx

`sudo apt install nginx`

TODO

## Firewall configuration

`sudo ufw default deny incoming`

`sudo ufw default allow outgoing`

`sudo ufw allow OpenSSH`

`sudo ufw allow "Nginx Full"`

`sudo ufw enable`

TODO

## Install docker

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
