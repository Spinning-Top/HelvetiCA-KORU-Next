# Server installation

# Helpful Commands

## Postfix external access

```
- installa socat
sudo apt install socat

- abilita porta 9090 su firewall
sudo ufw allow 9090/tcp comment "KORU Postfix-Server"

- attiva il portforwarding
socat TCP-LISTEN:9091,fork TCP:127.0.0.1:9090

- quando interrompi il comando socat con CTRL+C, anche il portforwarding si termina
```

## Docker delete all data

```
Rimuovere tutto da docker:

docker system prune -a --volumes
```
